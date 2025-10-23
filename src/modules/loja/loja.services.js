import prisma from '../../config/prisma.js';

const lojaServices = {
  async buscarTodasAsLojas() {
    try {
      const lojas = await prisma.loja.findMany();

      return lojas;
    } catch (error) {
      console.error('Erro ao buscar todas as lojas: ', error);
      throw new Error('Não foi possível buscar as lojas.');
    }
  },

  async buscarLoja(lojaId) {
    try {
      const loja = await prisma.loja.findUnique({ where: { id: lojaId } });

      return loja;
    } catch (error) {
      console.error(`Erro ao buscar a loja com ID ${lojaId}: `, error);
      throw new Error('Não foi possível buscar a loja.');
    }
  },

  async criarLoja(dadosLoja) {
    try {
      const novaLoja = await prisma.loja.create({
        data: dadosLoja,
      });

      return novaLoja;
    } catch (error) {
      console.error('Erro ao criar loja: ', error);
      throw new Error('Não foi possível criar a loja.');
    }
  },

  async atualizarLoja(lojaId, novosDados) {
    try {
      const lojaAtualizada = await prisma.loja.update({
        where: {
          id: lojaId,
        },
        data: novosDados,
      });

      return lojaAtualizada;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Loja com ID ${lojaId} não encontrada.`);
      }
      console.error(`Erro ao atualizar a loja com ID ${lojaId}: `, error);
      throw new Error('Não foi possível atualizar a loja.');
    }
  },

  async deletarLoja(lojaId) {
    try {
      const lojaDeletada = await prisma.loja.delete({
        where: {
          id: lojaId,
        },
      });

      return lojaDeletada;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Loja com ID ${lojaId} não encontrada.`);
      }
      console.error(`Erro ao deletar a loja com ID ${lojaId}: `, error);
      throw new Error('Não foi possível deletar a loja.');
    }
  },
};

export default lojaServices;
