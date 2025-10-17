import prisma from '../../config/prisma.js';

const produtoServices = {
  async buscarTodosOsProdutos() {
    try {
      const produtos = await prisma.produto.findMany();

      return produtos;
    } catch (error) {
      console.error('Erro ao buscar todos os produtos: ', error);
      throw new Error('Não foi possível buscar os produtos.');
    }
  },

  async buscarProdutosPorCategoria(idCategoria) {
    try {
      const produtos = await prisma.produto.findMany({
        where: {
          categoriaId: idCategoria,
        },
      });

      return produtos;
    } catch (error) {
      console.error(
        `Erro ao buscar os produtos da categoria com ID ${idCategoria}: `,
        error,
      );
      throw new Error('Não foi possível buscar os produtos da categoria.');
    }
  },

  async buscarProdutoPorId(idProduto) {
    try {
      const produto = await prisma.produto.findUnique({
        where: {
          id: idProduto,
        },
      });

      return produto;
    } catch (error) {
      console.error(`Erro ao buscar o produto com ID ${idProduto}: `, error);
      throw new Error('Não foi possível buscar o produto.');
    }
  },

  async buscarProdutoPorNome(nomeProduto) {
    try {
      const produto = await prisma.produto.findUnique({
        where: {
          nome: nomeProduto,
        },
      });

      return produto;
    } catch (error) {
      console.error(
        `Erro ao buscar o produto com nome ${nomeProduto}: `,
        error,
      );
      throw new Error('Não foi possível buscar o produto.');
    }
  },

  async criarProduto(dadosProduto) {
    try {
      const novoProduto = await prisma.produto.create({
        data: dadosProduto,
      });

      return novoProduto;
    } catch (error) {
      console.error('Erro ao criar produto: ', error);
      throw new Error('Não foi possível criar o produto.');
    }
  },

  async atualizarProduto(idProduto, novosDados) {
    try {
      const produtoAtualizado = await prisma.produto.update({
        where: {
          id: idProduto,
        },
        data: novosDados,
      });

      return produtoAtualizado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Produto com ID ${idProduto} não encontrado.`);
      }
      console.error(`Erro ao atualizar o produto com ID ${idProduto}: `, error);
      throw new Error('Não foi possível atualizar o produto.');
    }
  },

  async deletarProduto(idProduto) {
    try {
      const produtoDeletado = await prisma.produto.delete({
        where: {
          id: idProduto,
        },
      });

      return produtoDeletado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Produto com ID ${idProduto} não encontrada.`);
      }
      console.error(`Erro ao deletar o produto com ID ${idProduto}: `, error);
      throw new Error('Não foi possível deletar o produto.');
    }
  },
};

export default produtoServices;
