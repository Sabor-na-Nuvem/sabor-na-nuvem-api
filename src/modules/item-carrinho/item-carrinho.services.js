import { TipoPedido } from '@prisma/client';
import prisma from '../../config/prisma.js';
import carrinhoServices from '../carrinho/carrinho.services.js';

const itemCarrinhoServicess = {
  async adicionarItemAoCarrinho(idUsuario, dadosItem) {
    const {
      idProduto,
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
            lojaId_produtoId: { lojaId, idProduto },
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

        // eslint-disable-next-line no-restricted-syntax
        const modificadoresValidos = await Promise.all(
          idModificadoresSelecionados.map(async (modId) => {
            // eslint-disable-next-line no-await-in-loop
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

            // eslint-disable-next-line no-await-in-loop
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

        // eslint-disable-next-line no-restricted-syntax
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
            produtoId: idProduto,
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
