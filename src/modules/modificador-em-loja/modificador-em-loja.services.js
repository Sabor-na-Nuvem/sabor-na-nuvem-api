import prisma from '../../config/prisma.js';

const modificadorEmLojaServices = {
  async listarModificadoresDaLoja(idLoja, somenteDisponiveis) {
    try {
      const lojaExiste = await prisma.loja.findUnique({
        where: { id: idLoja },
        select: { id: true },
      });
      if (!lojaExiste) {
        throw new Error(`Loja com ID ${idLoja} não encontrada.`);
      }

      const whereClause = {
        lojaId: idLoja,
      };
      if (somenteDisponiveis) {
        whereClause.disponivel = true;
      }

      const modificadoresNaLoja = await prisma.modificadorEmLoja.findMany({
        where: whereClause,
        include: {
          modificador: {
            select: {
              id: true,
              nome: true,
              descricao: true,
              isOpcaoPadrao: true,
              ordemVisualizacao: true,
              personalizavelId: true,
            },
          },
        },
        orderBy: [
          { modificador: { personalizavelId: 'asc' } },
          { modificador: { ordemVisualizacao: 'asc' } },
          { modificador: { nome: 'asc' } },
        ],
      });

      // Formata a saída para o schema ModificadorEmLojaDetalhado
      const resultadoFormatado = modificadoresNaLoja.map((item) => ({
        lojaId: item.lojaId,
        modificadorId: item.modificadorId,
        disponivel: item.disponivel,
        valorAdicional: item.valorAdicional,
        modificador: {
          id: item.modificador.id,
          nome: item.modificador.nome,
          descricao: item.modificador.descricao,
          isOpcaoPadrao: item.modificador.isOpcaoPadrao,
          ordemVisualizacao: item.modificador.ordemVisualizacao,
          personalizavelId: item.modificador.personalizavelId,
        },
      }));

      return resultadoFormatado;
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        throw error;
      }
      console.error(
        `Erro ao buscar os modificadores da loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(`Não foi possível buscar os modificadores da loja.`);
    }
  },

  async buscarModificadorNaLoja(idLoja, idModificador) {
    try {
      const modificadorNaLoja = await prisma.modificadorEmLoja.findUnique({
        where: {
          lojaId_modificadorId: {
            lojaId: idLoja,
            modificadorId: idModificador,
          },
        },
        include: {
          modificador: {
            select: {
              id: true,
              nome: true,
              descricao: true,
              isOpcaoPadrao: true,
              ordemVisualizacao: true,
              personalizavelId: true,
            },
          },
        },
      });

      if (!modificadorNaLoja) {
        return null;
      }

      const resultadoFormatado = {
        lojaId: modificadorNaLoja.lojaId,
        modificadorId: modificadorNaLoja.modificadorId,
        disponivel: modificadorNaLoja.disponivel,
        valorAdicional: modificadorNaLoja.valorAdicional,
        modificador: {
          id: modificadorNaLoja.modificador.id,
          nome: modificadorNaLoja.modificador.nome,
          descricao: modificadorNaLoja.modificador.descricao,
          isDefault: modificadorNaLoja.modificador.isOpcaoPadrao,
          ordemVisualizacao: modificadorNaLoja.modificador.ordemVisualizacao,
          personalizavelId: modificadorNaLoja.modificador.personalizavelId,
        },
      };

      return resultadoFormatado;
    } catch (error) {
      console.error(
        `Erro ao buscar o modificador com ID ${idModificador} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível buscar o modificador especificado na loja.`,
      );
    }
  },

  async adicionarModificadorEmLoja(idLoja, dadosModificadorEmLoja) {
    try {
      const [lojaExiste, modificadorBaseExiste] = await Promise.all([
        prisma.loja.findUnique({ where: { id: idLoja }, select: { id: true } }),
        prisma.modificador.findUnique({
          where: { id: dadosModificadorEmLoja.modificadorId },
          select: { id: true },
        }),
      ]);

      if (!lojaExiste) throw new Error(`Loja com ID ${idLoja} não encontrada.`);
      if (!modificadorBaseExiste)
        throw new Error(
          `Modificador base com ID ${dadosModificadorEmLoja.modificadorId} não encontrado.`,
        );

      const modificadorNaLoja = await prisma.modificadorEmLoja.create({
        data: {
          lojaId: idLoja,
          modificadorId: dadosModificadorEmLoja.modificadorId,
          valorAdicional: dadosModificadorEmLoja.valorAdicional,
          disponivel: dadosModificadorEmLoja.disponivel ?? true,
        },
      });

      return modificadorNaLoja;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(
          `O modificador com ID ${dadosModificadorEmLoja.modificadorId} já está configurado para a loja com ID ${idLoja}. Use a rota de atualização (PUT/PATCH).`,
        );
      }
      if (error.code === 'P2003' || error.message.includes('não encontrad')) {
        throw error;
      }

      console.error(
        `Erro ao adicionar o modificador com ID ${dadosModificadorEmLoja.modificadorId} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível adicionar o modificador especificado na loja.`,
      );
    }
  },

  async atualizarModificadorNaLoja(idLoja, idModificador, novosDados) {
    try {
      const modificadorAtualizadoNaLoja = await prisma.modificadorEmLoja.update(
        {
          where: {
            lojaId_modificadorId: {
              lojaId: idLoja,
              modificadorId: idModificador,
            },
          },
          data: {
            valorAdicional: novosDados.valorAdicional,
            disponivel: novosDados.disponivel,
          },
        },
      );

      return modificadorAtualizadoNaLoja;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Modificador com ID ${idModificador} não encontrado na loja com ID ${idLoja}.`,
        );
      }
      console.error(
        `Erro ao atualizar o modificador com ID ${idModificador} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível atualizar o modificador especificado na loja.`,
      );
    }
  },

  async deletarModificadorDaLoja(idLoja, idModificador) {
    try {
      const modificadorRemovido = await prisma.modificadorEmLoja.delete({
        where: {
          lojaId_modificadorId: {
            lojaId: idLoja,
            modificadorId: idModificador,
          },
        },
      });

      return modificadorRemovido;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Modificador com ID ${idModificador} não encontrado na loja com ID ${idLoja}.`,
        );
      }
      console.error(
        `Erro ao deletar o modificador com ID ${idModificador} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error('Não foi possível remover o modificador da loja.');
    }
  },
};

export default modificadorEmLojaServices;
