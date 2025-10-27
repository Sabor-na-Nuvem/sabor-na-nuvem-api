import prisma from '../../config/prisma.js';

const personalizavelServices = {
  async listarPersonalizaveisDoProduto(idProduto) {
    try {
      const produto = await prisma.produto.findUnique({
        where: { id: idProduto },
      });

      if (!produto) {
        throw new Error(`Produto com ID ${idProduto} não encontrado.`);
      }

      const personalizaveis = await prisma.personalizavel.findMany({
        where: { produtoId: idProduto },
        include: {
          modificadores: true,
        },
      });

      return personalizaveis;
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        throw error;
      }

      console.error(
        `Erro ao buscar os personalizáveis do produto com ID ${idProduto}: `,
        error,
      );
      throw new Error('Não foi possível buscar os personalizáveis do produto.');
    }
  },

  async buscarPersonalizavelPorId(idProduto, idPersonalizavel) {
    try {
      const personalizavel = await prisma.personalizavel.findFirst({
        where: { id: idPersonalizavel, produtoId: idProduto },
        include: { modificadores: true },
      });

      return personalizavel;
    } catch (error) {
      console.error(
        `Erro ao buscar o grupo de personalizáveis com ID ${idPersonalizavel}: `,
        error,
      );
      throw new Error(
        'Não foi possível buscar o grupo de personalizáveis do produto.',
      );
    }
  },

  async criarPersonalizavelParaProduto(idProduto, dadosPersonalizavel) {
    try {
      const novoPersonalizavel = await prisma.personalizavel.create({
        data: {
          nome: dadosPersonalizavel.nome,
          produtoId: idProduto,
          selecaoMinima: dadosPersonalizavel.selecaoMinima,
          selecaoMaxima: dadosPersonalizavel.selecaoMaxima,
        },
      });

      return novoPersonalizavel;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error(`Produto com ID ${idProduto} não encontrado.`);
      }

      console.error(
        `Erro ao criar o grupo de personalizáveis para o produto ${idProduto}: `,
        error,
      );
      throw new Error(
        'Não foi possível criar o grupo de personalizáveis do produto.',
      );
    }
  },

  async atualizarPersonalizavel(idProduto, idPersonalizavel, novosDados) {
    try {
      const personalizavelAtualizado = await prisma.personalizavel.update({
        where: {
          id: idPersonalizavel,
          produtoId: idProduto,
        },
        data: novosDados,
      });

      return personalizavelAtualizado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Personalizável com ID ${idPersonalizavel} não encontrado para este produto.`,
        );
      }

      console.error(
        `Erro ao atualizar o grupo de personalizáveis com ID ${idPersonalizavel}: `,
        error,
      );
      throw new Error(
        'Não foi possível atualizar o grupo de personalizáveis do produto.',
      );
    }
  },

  async deletarPersonalizavel(idProduto, idPersonalizavel) {
    try {
      const personalizavelDeletado = await prisma.personalizavel.delete({
        where: {
          id: idPersonalizavel,
          produtoId: idProduto,
        },
      });

      return personalizavelDeletado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Personalizável com ID ${idPersonalizavel} não encontrado para este produto.`,
        );
      }
      console.error(
        `Erro ao deletar o grupo de personalizáveis com ID ${idPersonalizavel}: `,
        error,
      );
      throw new Error('Não foi possível deletar o grupo de personalizáveis.');
    }
  },
};

export default personalizavelServices;
