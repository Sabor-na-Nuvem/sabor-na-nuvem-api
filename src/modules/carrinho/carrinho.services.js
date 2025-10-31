/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { Prisma, TipoPedido } from '@prisma/client';
import prisma from '../../config/prisma.js';

const carrinhoServices = {
  async buscarCarrinhoCompleto(idUsuario, txClient = prisma) {
    try {
      const carrinhoComItens = await txClient.carrinho.findUnique({
        where: {
          id: idUsuario,
        },
        select: {
          id: true,
          tipo: true,
          lojaId: true,
          loja: {
            select: { id: true, nome: true },
          },
          itensNoCarrinho: {
            select: {
              id: true,
              produtoId: true,
              qtdProduto: true,
              valorUnitarioProduto: true,
              produto: {
                select: {
                  id: true,
                  nome: true,
                  descricao: true,
                  imagemUrl: true,
                },
              },
              modificadoresSelecionados: {
                select: {
                  modificadorId: true,
                  valorAdicionalCobrado: true,
                  modificador: {
                    select: {
                      nome: true,
                      personalizavel: { select: { nome: true } },
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!carrinhoComItens) {
        return null;
      }

      // Calcular o valor do carrinho
      let subtotalCalculado = new Prisma.Decimal(0);

      carrinhoComItens.itensNoCarrinho.forEach((item) => {
        let valorTotalDoItem = item.valorUnitarioProduto;

        item.modificadoresSelecionados.forEach((mod) => {
          valorTotalDoItem = valorTotalDoItem.plus(mod.valorAdicionalCobrado);
        });

        subtotalCalculado = subtotalCalculado.plus(
          valorTotalDoItem.times(item.qtdProduto),
        );
      });

      // Adiciona o valor ao objeto
      const carrinhoCompleto = {
        ...carrinhoComItens,
        subtotal: subtotalCalculado.toFixed(2),
      };

      return carrinhoCompleto;
    } catch (error) {
      console.error(
        `Erro ao buscar carrinho completo para usuário ${idUsuario}: `,
        error,
      );
      throw new Error('Não foi possível buscar o carrinho.');
    }
  },

  async atualizarCarrinho(idUsuario, novosDados) {
    const avisosAoUsuario = [];

    try {
      // Busca o carrinho e TODAS as suas dependências para validação
      const carrinhoAtualizado = await prisma.$transaction(async (tx) => {
        const carrinhoAtual = await tx.carrinho.findUnique({
          where: { id: idUsuario },
          include: {
            itensNoCarrinho: {
              include: {
                produto: {
                  include: {
                    personalizacao: {
                      include: {
                        modificadores: true,
                      },
                    },
                  },
                },
                modificadoresSelecionados: {
                  include: {
                    modificador: true,
                  },
                },
              },
            },
          },
        });

        const dadosParaUpsert = {};

        // Lógica para atualizar o TIPO
        if (novosDados.tipo && typeof novosDados.tipo === 'string') {
          const tipoFormatado = novosDados.tipo.toUpperCase();
          if (tipoFormatado in TipoPedido) {
            dadosParaUpsert.tipo = TipoPedido[tipoFormatado];
          } else {
            console.warn(
              `Tipo inválido fornecido: "${novosDados.tipo}". Mudança ignorada.`,
            );
          }
        }

        // Lógica para MUDANÇA DE LOJA
        const novaLojaId = novosDados.lojaId
          ? Number(novosDados.lojaId)
          : undefined;

        if (!carrinhoAtual && !novaLojaId) {
          throw new Error(
            'Loja (lojaId) é obrigatória ao criar um carrinho ou adicionar o primeiro item.',
          );
        }

        const lojaIdAntiga = carrinhoAtual?.lojaId;
        const mudouDeLoja = novaLojaId && novaLojaId !== lojaIdAntiga;

        if (novaLojaId) {
          dadosParaUpsert.lojaId = novaLojaId;
        }

        if (
          mudouDeLoja &&
          carrinhoAtual &&
          carrinhoAtual.itensNoCarrinho.length > 0
        ) {
          dadosParaUpsert.lojaId = novaLojaId;

          for (const item of carrinhoAtual.itensNoCarrinho) {
            let itemValido = true;

            // Verifica o Produto na nova loja
            const produtoEmLoja = await tx.produtosEmLoja.findUnique({
              where: {
                lojaId_produtoId: {
                  lojaId: novaLojaId,
                  produtoId: item.produtoId,
                },
              },
            });

            if (!produtoEmLoja || !produtoEmLoja.disponivel) {
              // Produto INDISPONIVEL/NAO EXISTE na nova loja: Remove o item
              avisosAoUsuario.push(
                `Item '${item.produto.nome}' foi removido (indisponível na nova loja).`,
              );
              itemValido = false;
            } else {
              // Produto VÁLIDO: Atualiza o preço
              await tx.itemCarrinho.update({
                where: { id: item.id },
                data: { valorUnitarioProduto: produtoEmLoja.valorBase }, // TODO: Lógica de promoção
              });
            }

            // Verifica os Modificadores na nova loja
            if (itemValido) {
              const modsParaRemover = [];
              const idModsValidosSelecionados = new Set();

              for (const modSelecionado of item.modificadoresSelecionados) {
                const modificadorEmLoja = await tx.modificadorEmLoja.findUnique(
                  {
                    where: {
                      lojaId_modificadorId: {
                        lojaId: novaLojaId,
                        modificadorId: modSelecionado.modificadorId,
                      },
                    },
                  },
                );

                if (modificadorEmLoja && modificadorEmLoja.disponivel) {
                  // Modificador VÁLIDO: Atualiza o preço e marca como válido
                  idModsValidosSelecionados.add(modSelecionado.modificadorId);
                  await tx.itemCarrinhoModificadores.update({
                    where: {
                      itemCarrinhoId_modificadorId: {
                        itemCarrinhoId: item.id,
                        modificadorId: modSelecionado.modificadorId,
                      },
                    },
                    data: {
                      valorAdicionalCobrado: modificadorEmLoja.valorAdicional,
                    },
                  });
                } else {
                  // Modificador INVÁLIDO: Marca para remoção
                  modsParaRemover.push({
                    itemCarrinhoId: item.id,
                    modificadorId: modSelecionado.modificadorId,
                  });
                  avisosAoUsuario.push(
                    `Opção '${modSelecionado.modificador.nome}' foi removida do item '${item.produto.nome}' (indisponível na nova loja).`,
                  );
                }
              } // fim loop modificadores

              // Remove Modificadores inválidos
              if (modsParaRemover.length > 0) {
                await tx.itemCarrinhoModificadores.deleteMany({
                  where: { OR: modsParaRemover },
                });
              }

              // Verifica se grupos de personalização OBRIGATÓRIOS foram quebrados
              for (const grupo of item.produto.personalizacao) {
                // eslint-disable-next-line no-continue
                if (grupo.selecaoMinima === 0) continue; // Pula grupos opcionais

                const selecionadosNesteGrupo =
                  item.modificadoresSelecionados.filter(
                    (ms) =>
                      ms.modificador.personalizavelId === grupo.id &&
                      idModsValidosSelecionados.has(ms.modificadorId),
                  );

                if (selecionadosNesteGrupo.length < grupo.selecaoMinima) {
                  // Grupo obrigatório QUEBRADO: Tenta adicionar o modificador padrão se já não estiver presente
                  const defaultMod = grupo.modificadores.find(
                    (mod) => mod.isOpcaoPadrao,
                  );

                  if (
                    defaultMod &&
                    !idModsValidosSelecionados.has(defaultMod.id)
                  ) {
                    const defaultModEmLoja =
                      await tx.modificadorEmLoja.findUnique({
                        where: {
                          lojaId_modificadorId: {
                            lojaId: novaLojaId,
                            modificadorId: defaultMod.id,
                          },
                        },
                      });

                    if (defaultModEmLoja && defaultModEmLoja.disponivel) {
                      // Modificador padrão DISPONIVEL na nova loja: Adiciona ao carrinho
                      await tx.itemCarrinhoModificadores.create({
                        data: {
                          itemCarrinhoId: item.id,
                          modificadorId: defaultMod.id,
                          valorAdicionalCobrado:
                            defaultModEmLoja.valorAdicional,
                        },
                      });
                      avisosAoUsuario.push(
                        `Opção do item '${item.produto.nome}' foi alterada para '${defaultMod.nome}' (opção padrão).`,
                      );
                    } else {
                      // Modificador padrão INDISPONIVEL: Item é inválido
                      itemValido = false;
                      avisosAoUsuario.push(
                        `Item '${item.produto.nome}' foi removido (opção obrigatória indisponível na nova loja).`,
                      );
                      break;
                    }
                  } else {
                    // Grupo obrigatório quebrado e sem Modificador padrão: Item é inválido
                    itemValido = false;
                    avisosAoUsuario.push(
                      `Item '${item.produto.nome}' foi removido (opção obrigatória indisponível na nova loja).`,
                    );
                    break;
                  }
                }
              } // fim loop grupos personalizacao
            } // fim if (itemValido)

            if (!itemValido) {
              // Deleta o item inválido
              await tx.itemCarrinho.delete({ where: { id: item.id } });
            }
          } // fim loop itens
        } // fim if (novaLojaId)

        // Atualiza o Carrinho
        await tx.carrinho.upsert({
          where: { id: idUsuario },
          update: dadosParaUpsert,
          create: {
            id: idUsuario,
            lojaId: novaLojaId || carrinhoAtual?.lojaId,
            tipo: dadosParaUpsert.tipo || TipoPedido.ENTREGA,
          },
        });

        const carrinhoFinal = await this.buscarCarrinhoCompleto(idUsuario, tx);
        return { carrinho: carrinhoFinal, avisos: avisosAoUsuario };
      });

      return carrinhoAtualizado;
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('Loja (lojaId) é obrigatória')
      ) {
        throw error;
      }
      if (error.code === 'P2003') {
        throw new Error(`Loja com ID ${novosDados.lojaId} não encontrada.`);
      }
      console.error(
        `Erro ao atualizar o carrinho do usuário ${idUsuario}: `,
        error,
      );
      throw new Error(`Não foi possível atualizar o carrinho.`);
    }
  },

  async limparCarrinho(idUsuario) {
    try {
      const carrinhoExiste = await prisma.carrinho.findUnique({
        where: { id: idUsuario },
        select: { id: true },
      });

      if (!carrinhoExiste) {
        throw new Error(`Carrinho não encontrado para o usuário ${idUsuario}.`);
      }

      const { count } = await prisma.itemCarrinho.deleteMany({
        where: {
          carrinhoId: idUsuario,
        },
      });

      console.log(`Carrinho ${idUsuario} limpo. ${count} itens removidos.`);

      // eslint-disable-next-line no-useless-return
      return;
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        throw error;
      }
      console.error(
        `Erro ao limpar o carrinho do usuário ${idUsuario}: `,
        error,
      );
      throw new Error(`Não foi possível limpar o carrinho.`);
    }
  },
};

export default carrinhoServices;
