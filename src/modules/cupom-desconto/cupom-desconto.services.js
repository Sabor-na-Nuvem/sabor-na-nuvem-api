import prisma from '../../config/prisma.js';

const cupomDescontoServices = {
  async listarCupons() {
    try {
      const cupons = await prisma.cupomDesconto.findMany();

      return cupons;
    } catch (error) {
      console.error('Erro ao listar cupons: ', error);
      throw new Error('Não foi possível listar os cupons.');
    }
  },

  async buscarCupomPorId(cupomId) {
    try {
      const cupom = await prisma.cupomDesconto.findUnique({
        where: { id: cupomId },
      });

      return cupom;
    } catch (error) {
      console.error(`Erro ao buscar cupom com ID ${cupomId}: `, error);
      throw new Error('Não foi possível buscar o cupom por ID.');
    }
  },

  async buscarCupomPorCodigo(codigoCupom) {
    try {
      const cupom = await prisma.cupomDesconto.findUnique({
        where: { codCupom: codigoCupom },
      });

      return cupom;
    } catch (error) {
      console.error(`Erro ao buscar cupom com código ${codigoCupom}: `, error);
      throw new Error('Não foi possível buscar o cupom por código.');
    }
  },

  async criarCupom(dadosCupom) {
    try {
      const novoCupom = await prisma.cupomDesconto.create({
        data: dadosCupom,
      });

      return novoCupom;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(
          `Já existe um cupom com o código "${dadosCupom.codCupom}".`,
        );
      }
      console.error('Erro ao criar cupom: ', error);
      throw new Error('Não foi possível criar o cupom.');
    }
  },

  async atualizarCupom(cupomId, novosDados) {
    try {
      const cupomAtualizado = await prisma.cupomDesconto.update({
        where: { id: cupomId },
        data: novosDados,
      });

      return cupomAtualizado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Cupom com ID ${cupomId} não encontrado.`);
      }
      if (error.code === 'P2002') {
        throw new Error(
          `Já existe outro cupom com o código "${novosDados.codCupom}".`,
        );
      }

      console.error(`Erro ao atualizar cupom com ID ${cupomId}: `, error);
      throw new Error('Não foi possível atualizar o cupom.');
    }
  },

  async deletarCupom(cupomId) {
    try {
      const cupomDeletado = await prisma.cupomDesconto.delete({
        where: { id: cupomId },
      });

      return cupomDeletado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Cupom com ID ${cupomId} não encontrado.`);
      }
      if (error.code === 'P2003') {
        throw new Error(
          `Cupom com ID ${cupomId} está relacionado com um ou mais pedidos e não pode ser deletado.`,
        );
      }

      console.error(`Erro ao deletar cupom com ID ${cupomId}: `, error);
      throw new Error('Não foi possível deletar o cupom.');
    }
  },

  async validarCupom(codigoCupom, usuarioId = null) {
    try {
      const cupom = await prisma.cupomDesconto.findUnique({
        where: { codCupom: codigoCupom },
      });

      // Validações
      if (!cupom) {
        return { valido: false, mensagem: 'Cupom não encontrado.' };
      }
      if (cupom.validade < new Date()) {
        return { valido: false, mensagem: 'Cupom expirado.' };
      }
      if (cupom.qtdUsos !== null && cupom.qtdUsos <= 0) {
        return { valido: false, mensagem: 'Cupom esgotado.' };
      }
      if (cupom.usuarioId !== null && cupom.usuarioId !== usuarioId) {
        return {
          valido: false,
          mensagem: 'Este cupom não é válido para este usuário.',
        };
      }

      return {
        valido: true,
        mensagem: 'Cupom válido!',
        cupomId: cupom.id,
      };
    } catch (error) {
      console.error(
        `Erro ao verificar validade do cupom ${codigoCupom}: `,
        error,
      );
      throw new Error('Erro interno ao verificar o cupom.');
    }
  },

  async validarEUsarCupom(codigoCupom, tx) {
    const cupom = await tx.cupomDesconto.findUnique({
      where: { codCupom: codigoCupom },
    });

    // Validações
    if (!cupom) {
      throw new Error(`Cupom "${codigoCupom}" não encontrado.`);
    }
    if (cupom.validade < new Date()) {
      throw new Error(`Cupom "${codigoCupom}" expirado.`);
    }
    if (cupom.qtdUsos !== null && cupom.qtdUsos <= 0) {
      throw new Error(`Cupom "${codigoCupom}" já atingiu o limite de usos.`);
    }
    // TODO: Adicionar outra validação (usuário específico)

    // Decrementa o uso
    let updatedCupom = cupom;
    if (cupom.qtdUsos !== null) {
      updatedCupom = await tx.cupomDesconto.update({
        where: { id: cupom.id },
        data: {
          qtdUsos: {
            decrement: 1,
          },
        },
      });
    }

    // Verifica se deve deletar após o uso (se qtdUsos chegou a 0)
    if (updatedCupom.qtdUsos !== null && updatedCupom.qtdUsos === 0) {
      await tx.cupomDesconto.delete({
        where: { id: updatedCupom.id },
      });
      console.log(
        `Cupom ${codigoCupom} (ID: ${updatedCupom.id}) deletado após último uso.`,
      );
    }

    return { valido: true, cupomId: cupom.id };
  },
};

export default cupomDescontoServices;
