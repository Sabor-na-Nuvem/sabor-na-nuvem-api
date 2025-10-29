import { Prisma, RoleUsuario } from '@prisma/client';
import prisma from '../../config/prisma.js';

const usuarioServices = {
  async criarUsuario(dadosPerfil) {
    if (
      !dadosPerfil ||
      !dadosPerfil.id ||
      !dadosPerfil.email ||
      !dadosPerfil.nome
    ) {
      throw new Error(
        'Dados essenciais do perfil (ID, Email, Nome) são obrigatórios.',
      );
    }

    let cargoDoUsuario = RoleUsuario.CLIENTE;
    if (dadosPerfil.cargo && typeof dadosPerfil.cargo === 'string') {
      const cargoFormatado = dadosPerfil.cargo.toUpperCase();
      if (cargoFormatado in RoleUsuario) {
        cargoDoUsuario = RoleUsuario[cargoFormatado];
      } else {
        console.warn(
          `Role inválida fornecida durante a criação do usuário: "${dadosPerfil.cargo}". Usando o padrão CLIENTE.`,
        );
      }
    }

    try {
      const novoUsuario = await prisma.usuario.create({
        data: {
          id: dadosPerfil.id,
          email: dadosPerfil.email,
          nome: dadosPerfil.nome,
          cargo: cargoDoUsuario,
          relatorio: {
            create: {
              gastosTotais: 0.0,
              gastosMensais: 0.0,
              qtdTotalPedidos: 0,
              qtdMensalPedidos: 0,
              gastoDesdeUltimoCupom: 0.0,
            },
          },
        },
        select: {
          id: true,
          nome: true,
          email: true,
          cargo: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return novoUsuario;
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        if (target.includes('PRIMARY') || target.includes('id')) {
          throw new Error(
            `Um perfil de usuário com o ID ${dadosPerfil.id} já existe.`,
          );
        }
        if (target.includes('email')) {
          throw new Error(
            `Um perfil de usuário com o email "${dadosPerfil.email}" já existe.`,
          );
        }
        throw new Error(
          'Já existe um perfil de usuário com este ID ou E-mail.',
        );
      }

      console.error(
        `Erro ao criar perfil de usuário para ID ${dadosPerfil.id}:`,
        error,
      );
      throw new Error('Não foi possível criar o perfil do usuário.');
    }
  },

  async buscarUsuarioPorId(id) {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          cargo: true,
          enderecoId: true,
          funcionarioLojaId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return usuario;
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${id}:`, error);
      throw new Error('Não foi possível buscar o usuário.');
    }
  },

  async buscarRelatorioPorUsuarioId(idUsuario) {
    try {
      const relatorio = await prisma.relatorioUsuario.findUnique({
        where: { usuarioId: idUsuario },
      });

      return relatorio;
    } catch (error) {
      console.error(
        `Erro ao buscar relatório para o usuário ${idUsuario}: `,
        error,
      );
      throw new Error('Não foi possível buscar o relatório do usuário.');
    }
  },

  async buscarTodosOsUsuarios(filtros) {
    try {
      const whereClause = {};
      if (filtros.nome) {
        whereClause.nome = { contains: filtros.nome, mode: 'insensitive' };
      }
      if (filtros.email) {
        whereClause.email = { equals: filtros.email, mode: 'insensitive' };
      }
      if (filtros.cargo && typeof filtros.cargo === 'string') {
        const cargoFiltroUpper = filtros.cargo.toUpperCase();
        if (cargoFiltroUpper in RoleUsuario) {
          whereClause.cargo = RoleUsuario[cargoFiltroUpper];
        } else {
          console.warn(
            `Filtro de cargo inválido recebido: "${filtros.cargo}". Ignorando filtro.`,
          );
        }
      }

      const usuarios = await prisma.usuario.findMany({
        where: whereClause,
        select: {
          id: true,
          nome: true,
          email: true,
          cargo: true,
          createdAt: true,
          updatedAt: true,
        },
        // Adicionar paginação se necessário
        // take: parseInt(filtros.limit || '10'),
        // skip: parseInt(filtros.page || '0') * parseInt(filtros.limit || '10'),
      });

      return usuarios;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error('Não foi possível listar usuários.');
    }
  },

  async atualizarUsuario(idUsuario, novosDados) {
    try {
      const dadosParaAtualizar = { ...novosDados };

      if (
        dadosParaAtualizar.cargo &&
        typeof dadosParaAtualizar.cargo === 'string'
      ) {
        const inputCargoUpper = dadosParaAtualizar.cargo.toUpperCase();
        if (inputCargoUpper in RoleUsuario) {
          dadosParaAtualizar.cargo = RoleUsuario[inputCargoUpper];
        } else {
          throw new Error(
            `Cargo inválido fornecido para atualização: "${novosDados.cargo}"`,
          );
        }
      }

      const usuarioAtualizado = await prisma.usuario.update({
        where: { id: idUsuario },
        data: dadosParaAtualizar,
      });

      return usuarioAtualizado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Usuário com ID ${idUsuario} não encontrado.`);
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new Error(`O email "${novosDados.email}" já está em uso.`);
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new Error('Dados inválidos fornecidos para atualização.');
      }
      console.error(`Erro ao atualizar usuário com ID ${idUsuario}:`, error);
      throw new Error('Não foi possível atualizar o usuário.');
    }
  },

  // TODO: Deletar em conjunto com a API de autenticação.
  async deletarUsuario(idUsuario) {
    try {
      const usuarioDeletado = await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.findUnique({
          where: { id: idUsuario },
          select: { enderecoId: true },
        });

        if (!usuario) {
          throw Object.assign(
            new Error(`Usuário com ID ${idUsuario} não encontrado.`),
            { code: 'P2025' },
          );
        }
        const enderecoIdDoUsuario = usuario.enderecoId;

        // Deletar o Usuario
        const deletado = await tx.usuario.delete({
          where: { id: idUsuario },
        });

        // Deletar o Endereço
        if (enderecoIdDoUsuario) {
          try {
            await tx.endereco.delete({ where: { id: enderecoIdDoUsuario } });
            console.log(
              `Endereço ${enderecoIdDoUsuario} deletado pois não era mais referenciado.`,
            );
          } catch (enderecoError) {
            console.warn(
              `Não foi possível deletar o endereço órfão ${enderecoIdDoUsuario}:`,
              enderecoError,
            );
          }
        }
        return deletado;
      });

      return usuarioDeletado;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          error.message ||
            `Recurso necessário não encontrado durante a exclusão do usuário ${idUsuario}.`,
        );
      }
      if (error.code === 'P2003') {
        throw new Error(
          `Não é possível deletar o usuário pois existem Pedidos associados que impedem a exclusão.`,
        );
      }
      if (error.message.includes('não encontrado')) {
        throw error;
      }
      console.error(`Erro ao deletar usuário com ID ${idUsuario}:`, error);
      throw new Error('Não foi possível deletar o usuário.');
    }
  },
};

export default usuarioServices;
