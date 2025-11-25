/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Prisma, StatusPedido } from '@prisma/client';
import cupomDescontoServices from '../cupom-desconto/cupom-desconto.services.js';
import prisma from '../../config/prisma.js';
import {
  calcularDesconto,
  includeDetalhesPedido,
  buscarPedidoDetalhado,
  listarPedidos,
  transicoesPermitidas,
  includeListagemPedidos,
} from './pedido.helpers.js';

const pedidoServices = {
  // --- ROTA DE CRIAÇÃO (Pública ou Autenticada) ---
  async criarPedido(idUsuario, dadosInput) {
    const { codCupom, observacoes } = dadosInput;

    try {
      const novoPedidoCompleto = await prisma.$transaction(async (tx) => {
        // 1. PREPARAÇÃO DOS DADOS (Logado vs Anônimo)
        let carrinhoFonte;
        let dadosEnderecoEntrega = null;

        if (idUsuario) {
          // Logado: Busca do banco
          carrinhoFonte = await tx.carrinho.findUnique({
            where: { id: idUsuario },
            include: {
              itensNoCarrinho: {
                include: {
                  // Includes mínimos necessários para a validação de preço
                  produto: { select: { nome: true } },
                  modificadoresSelecionados: true,
                },
              },
            },
          });
          dadosEnderecoEntrega = dadosInput.enderecoEntrega;
        } else {
          // Anônimo: Usa do body
          carrinhoFonte = dadosInput.carrinho;
          dadosEnderecoEntrega = carrinhoFonte?.enderecoEntrega;
        }

        // Validações
        if (!carrinhoFonte || !carrinhoFonte.lojaId)
          throw new Error('Carrinho inválido ou loja não definida.');
        if (!carrinhoFonte.tipo)
          throw new Error('Carrinho inválido (não possui tipo de pedido).');
        if (!carrinhoFonte.itensNoCarrinho?.length)
          throw new Error('O carrinho está vazio.');

        const { lojaId, tipo, itensNoCarrinho } = carrinhoFonte;

        if (tipo === 'ENTREGA' && !dadosEnderecoEntrega) {
          throw new Error(
            'Endereço de entrega é obrigatório para pedidos de entrega.',
          );
        }

        // 2. REVALIDAÇÃO DE ITENS E PREÇOS
        let valorBaseCalculado = new Prisma.Decimal(0);
        const itensDataParaCriar = [];

        for (const item of itensNoCarrinho) {
          const produtoEmLoja = await tx.produtosEmLoja.findFirst({
            where: { lojaId, produtoId: item.produtoId, disponivel: true },
          });

          if (!produtoEmLoja)
            throw new Error(
              `O produto ${item.produto.nome} não está mais disponível nesta loja.`,
            );

          let valorItem = produtoEmLoja.valorBase;
          const modsDataParaCriar = [];

          if (item.modificadoresSelecionados?.length > 0) {
            for (const modSel of item.modificadoresSelecionados) {
              const modEmLoja = await tx.modificadorEmLoja.findUnique({
                where: {
                  lojaId_modificadorId: {
                    lojaId,
                    modificadorId: modSel.modificadorId,
                  },
                  disponivel: true,
                },
              });

              if (!modEmLoja)
                throw new Error(
                  `A opção ${modSel.modificadorId} está indisponível.`,
                );

              valorItem = valorItem.plus(modEmLoja.valorAdicional);
              modsDataParaCriar.push({
                modificadorId: modSel.modificadorId,
                valorAdicionalCobrado: modEmLoja.valorAdicional,
              });
            }
          }

          valorBaseCalculado = valorBaseCalculado.plus(
            valorItem.times(item.qtdProduto),
          );

          itensDataParaCriar.push({
            produtoId: item.produtoId,
            qtdProduto: item.qtdProduto,
            valorUnitarioProduto: produtoEmLoja.valorBase,
            modificadores: modsDataParaCriar,
          });
        }

        // 3. APLICAÇÃO DE CUPOM
        let valorCobrado = valorBaseCalculado;
        let cupomIdParaAssociar = null;

        if (codCupom) {
          const resultadoCupom = await cupomDescontoServices.validarEUsarCupom(
            codCupom,
            tx,
            idUsuario,
          );
          valorCobrado = calcularDesconto(
            valorBaseCalculado,
            resultadoCupom.tipoDesconto,
            resultadoCupom.valorDesconto,
          );
          cupomIdParaAssociar = resultadoCupom.cupomId;
        }

        // 4. CRIAÇÃO DO ENDEREÇO SNAPSHOT (Se Entrega)
        let enderecoSnapshotId = null;
        if (tipo === 'ENTREGA' && dadosEnderecoEntrega) {
          const novoEndereco = await tx.endereco.create({
            data: {
              cep: dadosEnderecoEntrega.cep,
              logradouro: dadosEnderecoEntrega.logradouro,
              numero: dadosEnderecoEntrega.numero,
              complemento: dadosEnderecoEntrega.complemento,
              bairro: dadosEnderecoEntrega.bairro,
              cidade: dadosEnderecoEntrega.cidade,
              estado: dadosEnderecoEntrega.estado,
              pontoReferencia: dadosEnderecoEntrega.pontoReferencia,
              latitude: dadosEnderecoEntrega.latitude,
              longitude: dadosEnderecoEntrega.longitude,
            },
          });
          enderecoSnapshotId = novoEndereco.id;
        }

        // 5. CRIAÇÃO DO PEDIDO
        const novoPedido = await tx.pedido.create({
          data: {
            clienteId: idUsuario,
            lojaId,
            valorBase: valorBaseCalculado,
            valorCobrado,
            cupomUsadoId: cupomIdParaAssociar,
            tipo,
            observacoes: observacoes || null,
            status: StatusPedido.PENDENTE,
            enderecoEntregaId: enderecoSnapshotId,
          },
        });

        // 6. CRIAÇÃO DOS ITENS DO PEDIDO
        for (const itemData of itensDataParaCriar) {
          const novoItemPedido = await tx.itemPedido.create({
            data: {
              pedidoId: novoPedido.id,
              produtoId: itemData.produtoId,
              qtdProduto: itemData.qtdProduto,
              valorUnitarioProduto: itemData.valorUnitarioProduto,
            },
          });

          if (itemData.modificadores.length > 0) {
            await tx.itemPedidoModificadores.createMany({
              data: itemData.modificadores.map((mod) => ({
                itemPedidoId: novoItemPedido.id,
                modificadorId: mod.modificadorId,
                valorAdicionalCobrado: mod.valorAdicionalCobrado,
              })),
            });
          }
        }

        // 7. LIMPEZA DO CARRINHO (Apenas Logado)
        if (idUsuario) {
          await tx.itemCarrinho.deleteMany({
            where: { carrinhoId: idUsuario },
          });
        }

        // Retorna usando seu include detalhado
        const pedidoParaRetornar = await tx.pedido.findUnique({
          where: { id: novoPedido.id },
          include: includeDetalhesPedido,
        });

        return pedidoParaRetornar;
      });

      return novoPedidoCompleto;
    } catch (error) {
      // Tratamento de erros (Mantido igual)
      if (error.code === 'P2003')
        throw new Error('Falha de referência: Loja ou produto não existe.');
      // Propaga erros de negócio conhecidos
      if (
        !error.message.includes('inválido') &&
        !error.message.includes('vazio') &&
        !error.message.includes('indisponível')
      ) {
        console.error(`Erro ao criar pedido:`, error);
      }
      throw error;
    }
  },

  // --- ROTAS DO CLIENTE (AUTENTICADO) ---

  async listarMeusPedidos(idUsuario, filtros) {
    const whereBase = { clienteId: idUsuario };
    return listarPedidos(whereBase, filtros, includeListagemPedidos, prisma);
  },

  async buscarMeuPedidoPorId(idPedido, idUsuario) {
    const where = { id: idPedido, clienteId: idUsuario };
    return buscarPedidoDetalhado(where, prisma);
  },

  async cancelarMeuPedido(idPedido, idUsuario) {
    try {
      // TODO: Adicionar lógica de reembolso
      const pedidoCancelado = await prisma.$transaction(async (tx) => {
        const pedido = await tx.pedido.findFirst({
          where: {
            id: idPedido,
            clienteId: idUsuario,
          },
        });

        if (!pedido) {
          throw new Error(
            `Pedido com ID ${idPedido} não encontrado ou não pertence a este usuário.`,
          );
        }

        const statusPermitidos = [
          StatusPedido.PENDENTE,
          StatusPedido.AGUARDANDO_PAGAMENTO,
        ];
        if (!statusPermitidos.includes(pedido.status)) {
          throw new Error(
            `Este pedido (status: ${pedido.status}) não pode mais ser cancelado.`,
          );
        }

        const pedidoAtualizado = await tx.pedido.update({
          where: {
            id: idPedido,
          },
          data: {
            status: StatusPedido.CANCELADO,
          },
          include: includeDetalhesPedido,
        });

        return pedidoAtualizado;
      });

      return pedidoCancelado;
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('não pode mais ser cancelado')
      ) {
        throw error;
      }

      console.error(
        `Erro ao cancelar o pedido ${idPedido} para o usuário ${idUsuario}: `,
        error,
      );
      throw new Error('Não foi possível cancelar o pedido.');
    }
  },

  // --- ROTAS DA LOJA (FUNCIONÁRIO/ADMIN) ---

  async listarPedidosDaLoja(idLoja, filtros) {
    const whereBase = { lojaId: idLoja };
    return listarPedidos(whereBase, filtros, includeListagemPedidos, prisma);
  },

  async buscarPedidoDaLoja(idPedido, idLoja) {
    const where = { id: idPedido, lojaId: idLoja };
    return buscarPedidoDetalhado(where, prisma);
  },

  async atualizarStatusDoPedido(idPedido, idLoja, status) {
    let novoStatus;
    if (status && typeof status === 'string') {
      const statusFormatado = status.toUpperCase();
      if (statusFormatado in StatusPedido) {
        novoStatus = StatusPedido[statusFormatado];
      }
    }

    if (!novoStatus) {
      throw new Error(`Status fornecido (${status}) é inválido.`);
    }

    try {
      const pedidoAtualizado = await prisma.$transaction(async (tx) => {
        const pedido = await tx.pedido.findFirst({
          where: {
            id: idPedido,
            lojaId: idLoja,
          },
        });

        if (!pedido) {
          throw new Error(
            `Pedido com ID ${idPedido} não encontrado ou não pertence à loja com ID ${idLoja}.`,
          );
        }

        const statusAtual = pedido.status;

        if (statusAtual === novoStatus) {
          return pedido;
        }

        const transicoesValidas = transicoesPermitidas[statusAtual];

        if (!transicoesValidas || !transicoesValidas.includes(novoStatus)) {
          throw new Error(
            `Transição de status inválida: não é possível mudar de "${statusAtual}" para "${novoStatus}".`,
          );
        }

        // --- LÓGICA DE RECOMPENSA E RELATÓRIO ---
        if (novoStatus === StatusPedido.REALIZADO && pedido.clienteId) {
          const limiarCupom = 100.0; // Definir o limiar para ganhar um cupom (ex: R$ 100)
          const usuarioId = pedido.clienteId;

          // Atualiza o relatório com os gastos deste pedido
          const relatorioAtualizado = await tx.relatorioUsuario.update({
            where: { usuarioId },
            data: {
              gastosTotais: { increment: pedido.valorCobrado },
              gastosMensais: { increment: pedido.valorCobrado },
              qtdTotalPedidos: { increment: 1 },
              qtdMensalPedidos: { increment: 1 },
              gastoDesdeUltimoCupom: { increment: pedido.valorCobrado },
              dataUltimoPedido: new Date(),
            },
          });

          if (relatorioAtualizado.gastoDesdeUltimoCupom.gte(limiarCupom)) {
            try {
              // Cria o cupom de fidelidade
              await cupomDescontoServices.criarCupomFidelidade(tx, usuarioId);

              await tx.relatorioUsuario.update({
                where: { usuarioId },
                data: {
                  gastoDesdeUltimoCupom: {
                    decrement: new Prisma.Decimal(limiarCupom),
                  },
                },
              });
              console.log(
                `Cupom de fidelidade gerado para usuário ${usuarioId}.`,
              );
            } catch (cupomError) {
              console.error(
                `FALHA AO GERAR CUPOM FIDELIDADE para usuário ${usuarioId} (Pedido ${idPedido}): `,
                cupomError,
              );
            }
          }
        } // --- FIM DA LÓGICA DE RECOMPENSA ---

        const pedidoNovo = await tx.pedido.update({
          where: {
            id: idPedido,
          },
          data: {
            status: novoStatus,
          },
          include: includeDetalhesPedido,
        });

        return pedidoNovo;
      });

      return pedidoAtualizado;
    } catch (error) {
      if (
        error.message.includes('inválido') ||
        error.message.includes('não encontrado') ||
        error.message.includes('Transição de status inválida')
      ) {
        throw error;
      }

      console.error(
        `Erro ao atualizar o status do pedido ${idPedido}: `,
        error,
      );
      throw new Error('Não foi possível atualizar o status do pedido.');
    }
  },

  // --- ROTAS DE ADMIN ---

  async listarTodosOsPedidos(filtros) {
    const whereBase = {};
    return listarPedidos(whereBase, filtros, includeListagemPedidos, prisma);
  },

  async buscarPedidoPorIdAdmin(idPedido) {
    const where = { id: idPedido };
    return buscarPedidoDetalhado(where, prisma);
  },
};

export default pedidoServices;
