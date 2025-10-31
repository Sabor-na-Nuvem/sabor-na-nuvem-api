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
} from './pedido.helpers.js';

const pedidoServices = {
  // --- ROTA DE CRIAÇÃO (Pública ou Autenticada) ---
  async criarPedido(idUsuario, dadosInput) {
    const { codCupom, observacoes } = dadosInput;

    try {
      const novoPedidoCompleto = await prisma.$transaction(async (tx) => {
        // Dados do Carrinho
        let carrinhoFonte;
        if (idUsuario) {
          // Usuário Logado: Busca o carrinho do banco
          carrinhoFonte = await tx.carrinho.findUnique({
            where: { id: idUsuario },
            include: {
              itensNoCarrinho: {
                include: {
                  produto: { select: { nome: true } },
                  modificadoresSelecionados: {
                    include: {
                      modificador: { select: { nome: true } },
                    },
                  },
                },
              },
            },
          });
        } else {
          // Usuário Anônimo: Usa o carrinho mockado do body
          carrinhoFonte = dadosInput.carrinho;
        }

        if (!carrinhoFonte || !carrinhoFonte.lojaId) {
          throw new Error('Carrinho inválido ou loja não definida.');
        }
        if (!carrinhoFonte.tipo) {
          throw new Error('Carrinho inválido (não possui tipo de pedido).');
        }
        if (
          !carrinhoFonte.itensNoCarrinho ||
          carrinhoFonte.itensNoCarrinho.length === 0
        ) {
          throw new Error('O carrinho está vazio.');
        }

        const { lojaId, tipo, itensNoCarrinho } = carrinhoFonte;

        // Revalidar Itens e Calcular Totais
        let valorBaseCalculado = new Prisma.Decimal(0);
        const itensDataParaCriar = [];

        for (const item of itensNoCarrinho) {
          // Revalida Produto Base
          const produtoEmLoja = await tx.produtosEmLoja.findFirst({
            where: {
              lojaId,
              produtoId: item.produtoId,
              disponivel: true,
            },
          });
          if (!produtoEmLoja) {
            throw new Error(
              `O produto "${item.produto?.nome || item.produtoId}" não está mais disponível nesta loja.`,
            );
          }

          // Confia no preço congelado do produto no carrinho
          let valorItem = item.valorUnitarioProduto;

          // Modificadores
          const modsDataParaCriar = [];
          if (
            item.modificadoresSelecionados &&
            item.modificadoresSelecionados.length > 0
          ) {
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
              if (!modEmLoja) {
                throw new Error(
                  `A opção "${modSel.modificador?.nome || modSel.modificadorId}" não está mais disponível.`,
                );
              }
              // Confia no preço congelado do modificador no carrinho
              valorItem = valorItem.plus(modSel.valorAdicionalCobrado);
              modsDataParaCriar.push({
                modificadorId: modSel.modificadorId,
                valorAdicionalCobrado: modSel.valorAdicionalCobrado,
              });
            }
          }

          // Adiciona ao total
          valorBaseCalculado = valorBaseCalculado.plus(
            valorItem.times(item.qtdProduto),
          );

          // Guarda os dados para a criação do ItemPedido
          itensDataParaCriar.push({
            produtoId: item.produtoId,
            qtdProduto: item.qtdProduto,
            valorUnitarioProduto: item.valorUnitarioProduto,
            modificadores: modsDataParaCriar,
          });
        } // Fim do loop de itens

        // Validar e Aplicar Cupom
        let valorCobrado = valorBaseCalculado;
        let cupomIdParaAssociar = null;

        if (codCupom) {
          const resultadoCupom = await cupomDescontoServices.validarEUsarCupom(
            codCupom,
            tx,
            idUsuario,
            // { valorCarrinho: valorBaseCalculado } // TODO: Cupom precisa de um valor mínimo na compra?
          );

          // Se válido, calcula o desconto
          valorCobrado = calcularDesconto(
            valorBaseCalculado,
            resultadoCupom.tipoDesconto,
            resultadoCupom.valorDesconto,
          );
          cupomIdParaAssociar = resultadoCupom.cupomId;
        }

        // Criar o Pedido
        const novoPedido = await tx.pedido.create({
          data: {
            clienteId: idUsuario, // Será null se for anônimo
            lojaId,
            dataHora: new Date(),
            valorBase: valorBaseCalculado,
            valorCobrado,
            cupomUsadoId: cupomIdParaAssociar,
            tipo,
            observacoes: observacoes || null,
            status: StatusPedido.PENDENTE, // TODO: Ou AGUARDANDO_PAGAMENTO se a lógica mudar
          },
        });

        // Criar os Itens do Pedido (ItemPedido e ItemPedidoModificadores)
        for (const itemData of itensDataParaCriar) {
          const novoItemPedido = await tx.itemPedido.create({
            data: {
              pedidoId: novoPedido.id,
              produtoId: itemData.produtoId,
              qtdProduto: itemData.qtdProduto,
              valorUnitarioProduto: itemData.valorUnitarioProduto,
            },
          });

          // Cria os modificadores associados a este ItemPedido
          if (itemData.modificadores.length > 0) {
            await tx.itemPedidoModificadores.createMany({
              data: itemData.modificadores.map((mod) => ({
                itemPedidoId: novoItemPedido.id,
                modificadorId: mod.modificadorId,
                valorAdicionalCobrado: mod.valorAdicionalCobrado,
              })),
            });
          }
        } // Fim do loop de criação de itens

        // Limpar Carrinho (se for usuário logado)
        if (idUsuario) {
          await tx.itemCarrinho.deleteMany({
            where: { carrinhoId: idUsuario },
          });
        }

        // Retornar o Pedido completo
        const pedidoCompleto = await tx.pedido.findUnique({
          where: { id: novoPedido.id },
          include: includeDetalhesPedido,
        });

        return pedidoCompleto;
      }); // --- FIM DA TRANSAÇÃO ---

      return novoPedidoCompleto;
    } catch (error) {
      if (
        error.message.includes('Carrinho inválido') ||
        error.message.includes('não está mais disponível') ||
        error.message.includes('não encontrado') ||
        error.message.includes('indisponível') ||
        error.message.includes('inválido') ||
        error.message.includes('Loja não definida') ||
        error.message.includes('vazio') ||
        error.message.includes('Cupom')
      ) {
        throw error;
      }

      if (error.code === 'P2003') {
        throw new Error(
          'Falha de referência: A loja ou produto/modificador não existe.',
        );
      }

      console.error(
        `Erro ao criar pedido para usuário ${idUsuario || 'anônimo'}: `,
        error,
      );
      throw new Error('Não foi possível processar o seu pedido.');
    }
  },

  // --- ROTAS DO CLIENTE (AUTENTICADO) ---

  async listarMeusPedidos(idUsuario, filtros) {
    const whereBase = { clienteId: idUsuario };
    const include = { loja: { select: { nome: true } } };
    return listarPedidos(whereBase, filtros, include, prisma);
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
    const include = { cliente: { select: { nome: true } } };
    return listarPedidos(whereBase, filtros, include, prisma);
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
    const include = {
      loja: { select: { nome: true } },
      cliente: { select: { nome: true } },
    };
    return listarPedidos(whereBase, filtros, include, prisma);
  },

  async buscarPedidoPorIdAdmin(idPedido) {
    const where = { id: idPedido };
    return buscarPedidoDetalhado(where, prisma);
  },
};

export default pedidoServices;
