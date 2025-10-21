import prisma from '../../config/prisma.js';

const enderecoServices = {
  async buscarEnderecoDoPai(idDoPai, tipoDoPai) {
    try {
      let paiComEndereco;

      if (tipoDoPai === 'usuario') {
        paiComEndereco = await prisma.usuario.findUnique({
          where: { id: idDoPai },
          select: {
            endereco: true,
          },
        });
      } else if (tipoDoPai === 'loja') {
        paiComEndereco = await prisma.loja.findUnique({
          where: { id: idDoPai },
          select: {
            endereco: true,
          },
        });
      }

      if (!paiComEndereco) {
        return null;
      }

      return paiComEndereco.endereco;
    } catch (error) {
      console.error(
        `Erro ao buscar o endereço ${tipoDoPai === 'usuario' ? 'do' : 'da'} ${tipoDoPai} com ID ${idDoPai}: `,
        error,
      );
      throw new Error(`Não foi possível buscar o endereço especificado.`);
    }
  },

  async criarEnderecoParaPai(idDoPai, tipoDoPai, dadosEndereco) {
    try {
      const novoEndereco = await prisma.$transaction(async (tx) => {
        let pai;

        if (tipoDoPai === 'usuario') {
          pai = await tx.usuario.findUnique({
            where: { id: idDoPai },
            select: { enderecoId: true },
          });
        } else if (tipoDoPai === 'loja') {
          pai = await tx.loja.findUnique({
            where: { id: idDoPai },
            select: { enderecoId: true },
          });
        }

        if (!pai) {
          throw new Error(
            `${tipoDoPai === 'usuario' ? 'Usuário' : 'Loja'} com ID ${idDoPai} não encontrado.`,
          );
        }

        if (pai.enderecoId) {
          throw new Error(
            `${tipoDoPai === 'usuario' ? 'Usuário' : 'Loja'} já possui um endereço cadastrado. Utilize a rota de atualização.`,
          );
        }

        const enderecoCriado = await tx.endereco.create({
          data: {
            cep: dadosEndereco.cep,
            estado: dadosEndereco.estado,
            cidade: dadosEndereco.cidade,
            bairro: dadosEndereco.bairro,
            logradouro: dadosEndereco.logradouro,
            numero: dadosEndereco.numero,
            complemento: dadosEndereco.complemento,
            pontoReferencia: dadosEndereco.pontoReferencia,
            latitude: dadosEndereco.latitude,
            longitude: dadosEndereco.longitude,
          },
        });

        if (tipoDoPai === 'usuario') {
          await tx.usuario.update({
            where: { id: idDoPai },
            data: { enderecoId: enderecoCriado.id },
          });
        } else {
          await tx.loja.update({
            where: { id: idDoPai },
            data: { enderecoId: enderecoCriado.id },
          });
        }

        return enderecoCriado;
      });

      return novoEndereco;
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('já possui um endereço')
      ) {
        throw error;
      }

      console.error(
        `Erro ao criar endereço para ${tipoDoPai} com ID ${idDoPai}: `,
        error,
      );
      throw new Error(`Não foi possível criar o endereço.`);
    }
  },

  async atualizarEnderecoDoPai(idDoPai, tipoDoPai, novosDados) {
    try {
      let pai;

      if (tipoDoPai === 'usuario') {
        pai = await prisma.usuario.findUnique({
          where: { id: idDoPai },
          select: { enderecoId: true },
        });
      } else {
        pai = await prisma.loja.findUnique({
          where: { id: idDoPai },
          select: { enderecoId: true },
        });
      }

      const enderecoAtualizado = await prisma.endereco.update({
        where: {
          id: pai.enderecoId,
        },
        data: {
          cep: novosDados.cep,
          estado: novosDados.estado,
          cidade: novosDados.cidade,
          bairro: novosDados.bairro,
          logradouro: novosDados.logradouro,
          numero: novosDados.numero,
          complemento: novosDados.complemento,
          pontoReferencia: novosDados.pontoReferencia,
          latitude: novosDados.latitude,
          longitude: novosDados.longitude,
        },
      });

      return enderecoAtualizado;
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('não possui um endereço')
      ) {
        throw error;
      }

      if (error.code === 'P2025') {
        throw new Error(`Endereço não encontrado no banco de dados.`);
      }

      console.error(
        `Erro ao atualizar o endereço para ${tipoDoPai} com ID ${idDoPai}: `,
        error,
      );
      throw new Error(`Não foi possível atualizar o endereço.`);
    }
  },

  async deletarEnderecoDoPai(idDoPai, tipoDoPai) {
    try {
      if (tipoDoPai === 'loja') {
        throw new Error(
          'Não é possível deletar o endereço de uma loja, pois ele é obrigatório. Considere atualizar o endereço.',
        );
      }

      const enderecoDeletado = await prisma.$transaction(async (tx) => {
        const pai = await tx.usuario.findUnique({
          where: { id: idDoPai },
          select: { enderecoId: true },
        });

        if (!pai) {
          throw new Error(`Usuário com ID ${idDoPai} não encontrado.`);
        }
        if (!pai.enderecoId) {
          throw new Error(
            `Usuário não possui um endereço cadastrado para ser deletado.`,
          );
        }

        const enderecoIdParaDeletar = pai.enderecoId;

        await tx.usuario.update({
          where: { id: idDoPai },
          data: { enderecoId: null },
        });

        const deletado = await tx.endereco.delete({
          where: {
            id: enderecoIdParaDeletar,
          },
        });

        return deletado;
      });

      return enderecoDeletado;
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('não possui um endereço')
      ) {
        throw error;
      }

      if (error.code === 'P2025') {
        throw new Error(
          `Endereço associado não pôde ser encontrado para exclusão.`,
        );
      }

      console.error(
        `Erro ao deletar o endereco do usuário com ID ${idDoPai}: `,
        error,
      );
      throw new Error(`Não foi possível deletar o endereço.`);
    }
  },
};

export default enderecoServices;
