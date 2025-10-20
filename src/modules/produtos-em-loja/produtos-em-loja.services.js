import prisma from '../../config/prisma.js';

const produtosEmLojaServices = {
  async listarProdutosDaLoja(idLoja, somenteEmPromocao) {
    try {
      const whereClause = {
        lojaId: idLoja,
      };
      if (somenteEmPromocao) {
        whereClause.emPromocao = true;
      }

      const produtosNaLoja = await prisma.produtosEmLoja.findMany({
        where: whereClause,
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              imagemUrl: true,
              descricao: true,
              categoria: true,
            },
          },
        },
      });

      const resultadoFormatado = produtosNaLoja.map((item) => ({
        lojaId: item.lojaId,
        produtoId: item.produtoId,
        nomeProduto: item.produto.nome,
        imagemUrl: item.produto.imagemUrl,
        descricaoProduto: item.produto.descricao,
        categoriaId: item.produto.categoria.id,
        categoriaNome: item.produto.categoria.nome,
        disponivel: item.disponivel,
        valorBase: item.valorBase,
        emPromocao: item.emPromocao,
        descontoPromocao: item.descontoPromocao,
        validadePromocao: item.validadePromocao,
      }));

      return resultadoFormatado;
    } catch (error) {
      console.error(
        `Erro ao buscar os produtos da loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível buscar os produtos da loja com ID ${idLoja}: `,
      );
    }
  },

  async buscarProdutoNaLoja(idLoja, idProduto) {
    try {
      const produtoNaLoja = await prisma.produtosEmLoja.findUnique({
        where: {
          lojaId_produtoId: {
            lojaId: idLoja,
            produtoId: idProduto,
          },
        },
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              imagemUrl: true,
              descricao: true,
              categoria: true,
            },
          },
        },
      });

      if (!produtoNaLoja) {
        return null;
      }

      const resultadoFormatado = {
        lojaId: produtoNaLoja.lojaId,
        produtoId: produtoNaLoja.produtoId,
        nomeProduto: produtoNaLoja.produto.nome,
        imagemUrl: produtoNaLoja.produto.imagemUrl,
        descricaoProduto: produtoNaLoja.produto.descricao,
        categoriaId: produtoNaLoja.produto.categoria.id,
        categoriaNome: produtoNaLoja.produto.categoria.nome,
        disponivel: produtoNaLoja.disponivel,
        valorBase: produtoNaLoja.valorBase,
        emPromocao: produtoNaLoja.emPromocao,
        descontoPromocao: produtoNaLoja.descontoPromocao,
        validadePromocao: produtoNaLoja.validadePromocao,
      };

      return resultadoFormatado;
    } catch (error) {
      console.error(
        `Erro ao buscar o produto com ID ${idProduto} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível buscar o produto com ID ${idProduto} na loja com ID ${idLoja}: `,
      );
    }
  },

  async adicionarProdutoEmLoja(idLoja, dadosProdutoEmLoja) {
    try {
      const produtoNaLoja = await prisma.produtosEmLoja.create({
        data: {
          lojaId: idLoja,
          produtoId: dadosProdutoEmLoja.produtoId,
          valorBase: dadosProdutoEmLoja.valorBase,
          disponivel: dadosProdutoEmLoja.disponivel,
          emPromocao: false,
        },
      });

      return produtoNaLoja;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(
          `O produto com ID ${dadosProdutoEmLoja.produtoId} já existe na loja com ID ${idLoja}.`,
        );
      }

      console.error(
        `Erro ao adicionar o produto com ID ${dadosProdutoEmLoja.produtoId} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível adicionar o produto com ID ${dadosProdutoEmLoja.produtoId} na loja com ID ${idLoja}: `,
      );
    }
  },

  async atualizarProdutoNaLoja(idLoja, idProduto, novosDados) {
    try {
      const produtoAtualizadoNaLoja = await prisma.produtosEmLoja.update({
        where: {
          lojaId_produtoId: {
            lojaId: idLoja,
            produtoId: idProduto,
          },
        },
        data: novosDados,
      });

      return produtoAtualizadoNaLoja;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Produto com ID ${idProduto} não encontrado na loja com ID ${idLoja}.`,
        );
      }
      console.error(
        `Erro ao atualizar o produto com ID ${idProduto} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível atualizar o produto com ID ${idProduto} na loja com ID ${idLoja}: `,
      );
    }
  },

  async deletarProdutoDaLoja(idLoja, idProduto) {
    try {
      const produtoRemovido = await prisma.produtosEmLoja.delete({
        where: {
          lojaId_produtoId: {
            lojaId: idLoja,
            produtoId: idProduto,
          },
        },
      });

      return produtoRemovido;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Produto com ID ${idProduto} não encontrado na loja com ID ${idLoja}.`,
        );
      }
      console.error(
        `Erro ao deletar o produto com ID ${idProduto} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error('Não foi possível remover o produto da loja.');
    }
  },
};

export default produtosEmLojaServices;
