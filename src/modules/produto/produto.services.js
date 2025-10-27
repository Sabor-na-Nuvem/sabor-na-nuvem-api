import prisma from '../../config/prisma.js';

const produtoServices = {
  async buscarTodosOsProdutos(categoriaId) {
    try {
      const whereClause = {};
      if (categoriaId !== undefined) {
        whereClause.categoriaId = categoriaId;
      }

      const produtos = await prisma.produto.findMany({
        where: whereClause,
        include: {
          categoria: true,
        },
      });

      return produtos;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Não foi possível buscar os produtos.');
    }
  },

  async buscarProdutoPorId(idProduto) {
    try {
      const produto = await prisma.produto.findUnique({
        where: {
          id: idProduto,
        },
        include: {
          personalizacao: true,
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
      // TODO: Após decidir como organizar o banco por redes, decidir se o nome é atributo único ou não.
      const produto = await prisma.produto.findMany({
        where: {
          nome: nomeProduto,
          mode: 'insensitive',
        },
        include: {
          personalizacao: true,
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

  async buscarLojasPorProduto(idProduto, somenteDisponiveis = false) {
    try {
      const whereClause = {
        produtoId: idProduto,
      };
      if (somenteDisponiveis) {
        whereClause.disponivel = true;
      }

      const produtosEmLojas = await prisma.produtosEmLoja.findMany({
        where: whereClause,
        select: {
          lojaId: true,
          valorBase: true,
          disponivel: true,
          emPromocao: true,
          descontoPromocao: true,
          validadePromocao: true,
          loja: {
            select: {
              nome: true,
              // Adicionar outros campos da loja aqui se precisar
              // ex: id: true, latitude: true, longitude: true
            },
          },
        },
      });

      const resultadoFormatado = produtosEmLojas.map((item) => ({
        lojaId: item.lojaId,
        nomeLoja: item.loja.nome,
        valorBase: item.valorBase,
        disponivel: item.disponivel,
        emPromocao: item.emPromocao,
        descontoPromocao: item.descontoPromocao,
        validadePromocao: item.validadePromocao,
      }));

      return resultadoFormatado;
    } catch (error) {
      console.error(
        `Erro ao buscar lojas para o produto com ID ${idProduto}: `,
        error,
      );
      throw new Error('Não foi possível buscar as lojas para este produto.');
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
        throw new Error(`Produto com ID ${idProduto} não encontrado.`);
      }
      console.error(`Erro ao deletar o produto com ID ${idProduto}: `, error);
      throw new Error('Não foi possível deletar o produto.');
    }
  },
};

export default produtoServices;
