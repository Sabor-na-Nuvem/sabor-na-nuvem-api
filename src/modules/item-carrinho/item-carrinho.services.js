/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { TipoPedido } from '@prisma/client';
import prisma from '../../config/prisma.js';
import carrinhoServices from '../carrinho/carrinho.services.js';

const itemCarrinhoServicess = {
  async adicionarItensDoPedido(idUsuario, idPedido) {
    try {
      const avisosAoUsuario = [];

      await prisma.$transaction(async (tx) => {
        const carrinho = await tx.carrinho.findUnique({
          where: { id: idUsuario },
          select: { lojaId: true },
        });

        if (!carrinho || !carrinho.lojaId) {
          throw new Error(
            'Loja não definida no carrinho. Por favor, selecione uma loja primeiro.',
          );
        }
        const { lojaId: lojaDestinoId } = carrinho;

        // Busca o pedido ANTIGO
        const pedidoAntigo = await tx.pedido.findUnique({
          where: { id: idPedido, clienteId: idUsuario },
          include: {
            itensNoPedido: {
              include: {
                produto: { select: { nome: true } },
                modificadoresSelecionados: true,
              },
            },
          },
        });

        if (!pedidoAntigo) {
          throw new Error(
            `Pedido com ID ${idPedido} não encontrado ou não pertence a este usuário.`,
          );
        }

        // Itera sobre cada item do pedido antigo e tenta adicioná-lo ao carrinho
        for (const itemAntigo of pedidoAntigo.itensNoPedido) {
          const dadosItem = {
            produtoId: itemAntigo.produtoId,
            qtdProduto: itemAntigo.qtdProduto,
            lojaId: lojaDestinoId, // USA A LOJA ATUAL DO CARRINHO
            modificadores: itemAntigo.modificadoresSelecionados.map((m) => ({
              modificadorId: m.modificadorId,
            })),
          };

          // ATENÇÃO: Reutiliza a lógica de 'adicionarItemAoCarrinho'
          // NAO MUDAR, pois o tratamento de erros é diferente de 'adicionarItemAoCarrinho'

          try {
            // --- Início da lógica de validação (simplificada de adicionarItemAoCarrinho) ---

            // Validar Produto Base
            const produtoEmLoja = await tx.produtosEmLoja.findUnique({
              where: {
                lojaId_produtoId: {
                  lojaId: lojaDestinoId,
                  produtoId: dadosItem.produtoId,
                },
                disponivel: true,
              },
              include: { produto: { include: { personalizacao: true } } },
            });

            if (!produtoEmLoja) {
              throw new Error(
                `Produto "${itemAntigo.produto.nome}" indisponível.`,
              );
            }

            // Validar Modificadores
            const modificadoresValidos = await Promise.all(
              dadosItem.modificadores.map(async (modInput) => {
                const mod = await tx.modificador.findUnique({
                  where: { id: modInput.modificadorId },
                });
                if (!mod)
                  throw new Error(
                    `Modificador (ID: ${modInput.modificadorId}) não existe.`,
                  );

                const modPertence = produtoEmLoja.produto.personalizacao.some(
                  (g) => g.id === mod.personalizavelId,
                );
                if (!modPertence)
                  throw new Error(
                    `Modificador "${mod.nome}" não pertence ao produto.`,
                  );

                const modEmLoja = await tx.modificadorEmLoja.findUnique({
                  where: {
                    lojaId_modificadorId: {
                      lojaId: lojaDestinoId,
                      modificadorId: modInput.modificadorId,
                    },
                    disponivel: true,
                  },
                });
                if (!modEmLoja)
                  throw new Error(`Modificador "${mod.nome}" indisponível.`);

                return {
                  modificadorId: modInput.modificadorId,
                  personalizavelId: mod.personalizavelId,
                  valorAdicionalCobrado: modEmLoja.valorAdicional,
                };
              }),
            );

            // Validar Regras Min/Max
            for (const grupo of produtoEmLoja.produto.personalizacao) {
              const countInGroup = modificadoresValidos.filter(
                (m) => m.personalizavelId === grupo.id,
              ).length;
              if (countInGroup < grupo.selecaoMinima)
                throw new Error(
                  `Grupo "${grupo.nome}" (mín: ${grupo.selecaoMinima}) não satisfeito.`,
                );
              if (countInGroup > grupo.selecaoMaxima)
                throw new Error(
                  `Grupo "${grupo.nome}" (máx: ${grupo.selecaoMaxima}) excedido.`,
                );
            }

            const novoItem = await tx.itemCarrinho.create({
              data: {
                carrinhoId: idUsuario,
                produtoId: dadosItem.produtoId,
                qtdProduto: dadosItem.qtdProduto,
                valorUnitarioProduto: produtoEmLoja.valorBase,
              },
            });

            if (modificadoresValidos.length > 0) {
              await tx.itemCarrinhoModificadores.createMany({
                data: modificadoresValidos.map((mod) => ({
                  itemCarrinhoId: novoItem.id,
                  modificadorId: mod.modificadorId,
                  valorAdicionalCobrado: mod.valorAdicionalCobrado,
                })),
              });
            }
            // --- Fim da lógica de validação ---
          } catch (validationError) {
            // Se um item falhar na validação, adiciona um aviso e continua o loop
            avisosAoUsuario.push(
              `Não foi possível adicionar '${itemAntigo.produto.nome}': ${validationError.message}`,
            );
          }
        } // Fim do loop for...of
      }); // --- FIM DA TRANSAÇÃO ---

      const carrinhoFinal =
        await carrinhoServices.buscarCarrinhoCompleto(idUsuario);

      return { carrinho: carrinhoFinal, avisos: avisosAoUsuario };
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('Loja não definida')
      ) {
        throw error;
      }
      console.error(
        `Erro ao adicionar itens do pedido ${idPedido} ao carrinho ${idUsuario}: `,
        error,
      );
      throw new Error('Não foi possível reordenar o pedido.');
    }
  },

  async adicionarItemAoCarrinho(idUsuario, dadosItem) {
    const {
      produtoId,
      qtdProduto,
      idLoja,
      modificadores: modificadoresInput = [],
    } = dadosItem;

    if (!idLoja || Number.isNaN(Number(idLoja))) {
      throw new Error('A loja (lojaId) é obrigatória ao adicionar um item.');
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Cria o carrinho em caso de primeira inserção
        const carrinho = await tx.carrinho.upsert({
          where: { id: idUsuario },
          update: {},
          create: {
            id: idUsuario,
            lojaId: Number(idLoja),
            tipo: TipoPedido.ENTREGA,
          },
          select: { lojaId: true },
        });

        const { lojaId } = carrinho;

        if (carrinho.lojaId !== Number(idLoja)) {
          throw new Error(
            `Este item é da Loja ${Number(idLoja)}, mas seu carrinho já contém itens da Loja ${carrinho.lojaId}. Limpe o carrinho para trocar de loja.`,
          );
        }

        // Validar o Produto Base
        const produtoEmLoja = await tx.produtosEmLoja.findUnique({
          where: {
            lojaId_produtoId: { lojaId, produtoId },
            disponivel: true,
          },
          include: {
            produto: {
              include: {
                personalizacao: true,
              },
            },
          },
        });
        if (!produtoEmLoja) {
          throw new Error('Produto não encontrado ou indisponível nesta loja.');
        }

        // Validar os Modificadores Selecionados
        const idModificadoresSelecionados = modificadoresInput.map(
          (m) => m.modificadorId,
        );

        const modificadoresValidos = await Promise.all(
          idModificadoresSelecionados.map(async (modId) => {
            const mod = await tx.modificador.findUnique({
              where: { id: modId },
              select: { personalizavelId: true, nome: true },
            });

            if (!mod) {
              throw new Error(
                `Opção de personalização (ID: ${modId}) não existe.`,
              );
            }

            const modPertenceAoProduto =
              produtoEmLoja.produto.personalizacao.some(
                (grupo) => grupo.id === mod.personalizavelId,
              );
            if (!modPertenceAoProduto) {
              throw new Error(
                `Opção "${mod.nome}" (ID: ${modId}) não pertence a este produto.`,
              );
            }

            const modEmLoja = await tx.modificadorEmLoja.findUnique({
              where: {
                lojaId_modificadorId: { lojaId, modificadorId: modId },
                disponivel: true,
              },
            });

            if (!modEmLoja) {
              throw new Error(
                `Opção "${mod.nome}" (ID: ${modId}) está indisponível nesta loja.`,
              );
            }

            // Retorna os dados validados
            return {
              modificadorId: modId,
              personalizavelId: mod.personalizavelId,
              valorAdicionalCobrado: modEmLoja.valorAdicional,
            };
          }),
        );

        for (const grupo of produtoEmLoja.produto.personalizacao) {
          const modificadoresAtivos = modificadoresValidos.filter(
            (mod) => mod.personalizavelId === grupo.id,
          ).length;

          // Verifica regra Mínima
          if (modificadoresAtivos < grupo.selecaoMinima) {
            throw new Error(
              `Seleção obrigatória faltante: O grupo "${grupo.nome}" exige no mínimo ${grupo.selecaoMinima} opção(ões).`,
            );
          }

          // Verifica regra Máxima
          if (modificadoresAtivos > grupo.selecaoMaxima) {
            throw new Error(
              `Seleção excedida: O grupo "${grupo.nome}" permite no máximo ${grupo.selecaoMaxima} opção(ões).`,
            );
          }
        }

        // Criar o ItemCarrinho
        const novoItem = await tx.itemCarrinho.create({
          data: {
            carrinhoId: idUsuario,
            produtoId,
            qtdProduto,
            valorUnitarioProduto: produtoEmLoja.valorBase,
          },
        });

        // Criar as Relações de Modificadores (se houver)
        if (modificadoresValidos.length > 0) {
          await tx.itemCarrinhoModificadores.createMany({
            data: modificadoresValidos.map((mod) => ({
              itemCarrinhoId: novoItem.id,
              modificadorId: mod.modificadorId,
              valorAdicionalCobrado: mod.valorAdicionalCobrado,
            })),
          });
        }
      });

      return carrinhoServices.buscarCarrinhoCompleto(idUsuario);
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('indisponível') ||
        error.message.includes('Loja não definida') ||
        error.message.includes('obrigatória faltante') ||
        error.message.includes('excedida') ||
        error.message.includes('não pertence') ||
        error.message.includes('Limpe o carrinho')
      ) {
        throw error;
      }

      console.error(
        `Erro ao adicionar item ao carrinho para usuário ${idUsuario}: `,
        error,
      );
      throw new Error('Não foi possível adicionar o item ao carrinho.');
    }
  },

  async atualizarItemNoCarrinho(idUsuario, itemCarrinhoId, novosDados) {
    try {
      const item = await prisma.itemCarrinho.findFirst({
        where: {
          id: itemCarrinhoId,
          carrinhoId: idUsuario,
        },
      });

      if (!item) {
        throw new Error(
          `Item (ID: ${itemCarrinhoId}) não encontrado no carrinho deste usuário.`,
        );
      }

      await prisma.itemCarrinho.update({
        where: {
          id: itemCarrinhoId,
        },
        data: {
          qtdProduto: novosDados.qtdProduto,
        },
      });

      return carrinhoServices.buscarCarrinhoCompleto(idUsuario);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        throw error;
      }
      console.error(
        `Erro ao atualizar item ${itemCarrinhoId} no carrinho do usuário ${idUsuario}: `,
        error,
      );
      throw new Error('Não foi possível atualizar o item no carrinho.');
    }
  },

  async removerItemDoCarrinho(idUsuario, itemCarrinhoId) {
    try {
      const item = await prisma.itemCarrinho.findFirst({
        where: {
          id: itemCarrinhoId,
          carrinhoId: idUsuario,
        },
      });

      if (!item) {
        throw new Error(
          `Item (ID: ${itemCarrinhoId}) não encontrado no carrinho deste usuário.`,
        );
      }

      await prisma.itemCarrinho.delete({
        where: {
          id: itemCarrinhoId,
        },
      });

      return carrinhoServices.buscarCarrinhoCompleto(idUsuario);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        throw error;
      }
      console.error(
        `Erro ao remover item ${itemCarrinhoId} do carrinho do usuário ${idUsuario}: `,
        error,
      );
      throw new Error('Não foi possível remover o item do carrinho.');
    }
  },
};

export default itemCarrinhoServicess;
