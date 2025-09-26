import prisma from '../../config/prisma.js';

const categoriaProdutoServices = {
  async buscarTodasAsCategorias() {
    try {
      const categorias = await prisma.categoriaProduto.findMany();

      return categorias;
    } catch (error) {
      console.error('Erro ao buscar todas as categorias: ', error);
      throw new Error('Não foi possível buscar as categorias.');
    }
  },

  async buscarCategoriaPorId(idCategoria) {
    try {
      const categoria = await prisma.categoriaProduto.findUnique({
        where: {
          id: idCategoria,
        },
      });

      return categoria;
    } catch (error) {
      console.error(
        `Erro ao buscar a categoria com ID ${idCategoria}: `,
        error,
      );
      throw new Error('Não foi possível buscar a categoria.');
    }
  },

  async criarCategoria(dadosCategoria) {
    try {
      const novaCategoria = await prisma.categoriaProduto.create({
        data: dadosCategoria,
      });

      return novaCategoria;
    } catch (error) {
      console.error('Erro ao criar categoria: ', error);
      throw new Error('Não foi possível criar a categoria.');
    }
  },

  async atualizarCategoria(idCategoria, novosDados) {
    try {
      const categoriaAtualizada = await prisma.categoriaProduto.update({
        where: {
          id: idCategoria,
        },
        data: novosDados,
      });

      return categoriaAtualizada;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Categoria com ID ${idCategoria} não encontrada.`);
      }
      console.error(
        `Erro ao atualizar a categoria com ID ${idCategoria}: `,
        error,
      );
      throw new Error('Não foi possível atualizar a categoria.');
    }
  },

  async deletarCategoria(idCategoria) {
    try {
      const categoriaDeletada = await prisma.categoriaProduto.delete({
        where: {
          id: idCategoria,
        },
      });

      return categoriaDeletada;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Categoria com ID ${idCategoria} não encontrada.`);
      }
      console.error(
        `Erro ao deletar a categoria com ID ${idCategoria}: `,
        error,
      );
      throw new Error('Não foi possível deletar a categoria.');
    }
  },
};

export default categoriaProdutoServices;
