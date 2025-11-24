import prisma from '../../config/prisma.js';

const telefoneServices = {
  async listarTelefonesDoPai(idDoPai, tipoDoPai) {
    try {
      const whereClause = {};

      if (tipoDoPai === 'usuario') {
        whereClause.usuarioId = idDoPai;
      } else {
        whereClause.lojaId = idDoPai;
      }

      const telefones = await prisma.telefone.findMany({
        where: whereClause,
      });

      return telefones;
    } catch (error) {
      console.error(
        `Erro ao buscar os telefones ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} com ID ${idDoPai}: `,
        error,
      );
      throw new Error(
        `Não foi possível buscar os telefones do proprietário especificado.`,
      );
    }
  },

  async buscarTelefoneDoPaiPorId(idDoPai, tipoDoPai, telefoneId) {
    try {
      const whereClause = { id: telefoneId };

      if (tipoDoPai === 'usuario') {
        whereClause.usuarioId = idDoPai;
      } else {
        whereClause.lojaId = idDoPai;
      }

      const telefone = await prisma.telefone.findFirst({
        where: whereClause,
      });

      return telefone;
    } catch (error) {
      console.error(
        `Erro ao buscar o telefone com ID ${telefoneId} ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} com ID ${idDoPai}: `,
        error,
      );
      throw new Error(`Não foi possível buscar o telefone especificado.`);
    }
  },

  async adicionarTelefoneAoPai(idDoPai, tipoDoPai, dadosTelefone) {
    try {
      const dadosParaInserir = {
        ddd: dadosTelefone.ddd,
        numero: dadosTelefone.numero,
      };

      if (tipoDoPai === 'usuario') {
        dadosParaInserir.usuarioId = idDoPai;
      } else {
        dadosParaInserir.lojaId = idDoPai;
      }

      const novoTelefone = await prisma.telefone.create({
        data: dadosParaInserir,
      });

      return novoTelefone;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error(
          `${tipoDoPai === 'usuario' ? 'Usuário' : 'Loja'} com ID ${idDoPai} não encontrado.`,
        );
      }

      if (error.code === 'P2002') {
        throw new Error(
          `O telefone (${dadosTelefone.ddd}) ${dadosTelefone.numero} já está cadastrado.`,
        );
      }

      console.error(
        `Erro ao adicionar o telefone ${tipoDoPai === 'usuario' ? 'ao' : 'à'} ${tipoDoPai} com ID ${idDoPai}: `,
        error,
      );
      throw new Error(`Não foi possível adicionar o telefone.`);
    }
  },

  async atualizarTelefoneDoPai(idDoPai, tipoDoPai, telefoneId, novosDados) {
    try {
      const dadosParaAtualizar = {
        ddd: novosDados.ddd,
        numero: novosDados.numero,
      };

      const telefoneExistente = await prisma.telefone.findFirst({
        where: {
          id: telefoneId,
          // Verifica dinamicamente se pertence ao usuário ou loja
          ...(tipoDoPai === 'usuario'
            ? { usuarioId: idDoPai }
            : { lojaId: idDoPai }),
        },
      });

      if (!telefoneExistente) {
        // Lança um erro manual simulando o erro P2025 do Prisma
        const error = new Error('Telefone não encontrado ou permissão negada.');
        error.code = 'P2025';
        throw error;
      }

      const novoTelefone = await prisma.telefone.update({
        where: {
          id: telefoneId,
        },
        data: dadosParaAtualizar,
      });

      return novoTelefone;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Telefone com ID ${telefoneId} não encontrado ou não pertence ${tipoDoPai === 'usuario' ? 'ao usuário' : 'à loja'} com ID ${idDoPai}.`,
        );
      }

      if (error.code === 'P2002') {
        throw new Error(
          `O telefone (${novosDados.ddd}) ${novosDados.numero} já está cadastrado.`,
        );
      }

      console.error(
        `Erro ao atualizar o telefone ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} com ID ${idDoPai}: `,
        error,
      );
      throw new Error(`Não foi possível atualizar o telefone.`);
    }
  },

  async deletarTelefoneDoPai(idDoPai, tipoDoPai, telefoneId) {
    try {
      const telefoneExistente = await prisma.telefone.findFirst({
        where: {
          id: telefoneId,
          ...(tipoDoPai === 'usuario'
            ? { usuarioId: idDoPai }
            : { lojaId: idDoPai }),
        },
      });

      if (!telefoneExistente) {
        const error = new Error('Telefone não encontrado ou permissão negada.');
        error.code = 'P2025'; // Simula erro de "Record not found"
        throw error;
      }

      // 2. DELEÇÃO SEGURA (Apenas pelo ID)
      const telefoneDeletado = await prisma.telefone.delete({
        where: {
          id: telefoneId,
        },
      });

      return telefoneDeletado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Telefone com ID ${telefoneId} não encontrado ${tipoDoPai === 'usuario' ? 'no' : 'na'} ${tipoDoPai} com ID ${idDoPai}.`,
        );
      }

      console.error(
        `Erro ao deletar o telefone ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} com ID ${idDoPai}: `,
        error,
      );
      throw new Error(`Não foi possível deletar o telefone.`);
    }
  },
};

export default telefoneServices;
