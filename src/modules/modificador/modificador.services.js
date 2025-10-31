import prisma from '../../config/prisma.js';

const modificadorServices = {
  async listarModificadoresDoPersonalizavel(idPersonalizavel) {
    try {
      const modificadores = await prisma.modificador.findMany({
        where: { personalizavelId: idPersonalizavel },
        orderBy: {
          ordemVisualizacao: 'asc',
        },
      });

      return modificadores;
    } catch (error) {
      console.error(
        `Erro ao buscar os modificadores do grupo de personalização com ID ${idPersonalizavel}: `,
        error,
      );
      throw new Error(
        'Não foi possível buscar os modificadores do grupo de personalização.',
      );
    }
  },

  async buscarModificadorPorId(idPersonalizavel, idModificador) {
    try {
      const modificador = await prisma.modificador.findFirst({
        where: { id: idModificador, personalizavelId: idPersonalizavel },
      });

      return modificador;
    } catch (error) {
      console.error(
        `Erro ao buscar o grupo de modificadores com ID ${idModificador}: `,
        error,
      );
      throw new Error(
        'Não foi possível buscar o grupo de modificadores do produto.',
      );
    }
  },

  async criarModificador(idProduto, idPersonalizavel, dadosModificador) {
    try {
      const personalizavelPai = await prisma.personalizavel.findUnique({
        where: { id: idPersonalizavel },
        select: { produtoId: true },
      });

      if (!personalizavelPai) {
        throw new Error(
          `Grupo de personalização com ID ${idPersonalizavel} não encontrado.`,
        );
      }
      if (personalizavelPai.produtoId !== idProduto) {
        throw new Error(
          `Grupo de personalização ${idPersonalizavel} não pertence ao produto ${idProduto}.`,
        );
      }

      const novoModificador = await prisma.modificador.create({
        data: {
          nome: dadosModificador.nome,
          personalizavelId: idPersonalizavel,
          descricao: dadosModificador.descricao,
          ordemVisualizacao: dadosModificador.ordemVisualizacao,
          isOpcaoPadrao: dadosModificador.isOpcaoPadrao ?? false,
        },
      });

      return novoModificador;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error(
          `Grupo de personalização com ID ${idPersonalizavel} não encontrado.`,
        );
      }

      if (
        error.message.includes('não encontrado') ||
        error.message.includes('não pertence')
      ) {
        throw error;
      }

      console.error(
        `Erro ao criar o modificador para o grupo de personalização com ID ${idPersonalizavel}: `,
        error,
      );
      throw new Error('Não foi possível criar o modificador.');
    }
  },

  async atualizarModificador(
    idProduto,
    idPersonalizavel,
    idModificador,
    novosDados,
  ) {
    try {
      const modificadorAtualizado = await prisma.modificador.update({
        where: {
          id: idModificador,
          personalizavelId: idPersonalizavel,
        },
        data: {
          nome: novosDados.nome,
          descricao: novosDados.descricao,
          isOpcaoPadrao: novosDados.isOpcaoPadrao,
          ordemVisualizacao: novosDados.ordemVisualizacao,
        },
      });

      return modificadorAtualizado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Modificador com ID ${idModificador} não encontrado para este grupo de personalização.`,
        );
      }

      console.error(
        `Erro ao atualizar o modificador com ID ${idModificador}: `,
        error,
      );
      throw new Error('Não foi possível atualizar o modificador.');
    }
  },

  async deletarModificador(idProduto, idPersonalizavel, idModificador) {
    try {
      const modificadorDeletado = await prisma.modificador.delete({
        where: {
          id: idModificador,
          personalizavelId: idPersonalizavel,
        },
      });

      return modificadorDeletado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Modificador com ID ${idModificador} não encontrado ou não pertence ao grupo de personalização com ID ${idPersonalizavel}.`,
        );
      }
      console.error(
        `Erro ao deletar o modificador com ID ${idModificador}: `,
        error,
      );
      throw new Error('Não foi possível deletar o modificador.');
    }
  },
};

export default modificadorServices;
