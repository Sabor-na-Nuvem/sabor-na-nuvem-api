import prisma from '../../config/prisma.js';

const produtosEmLojaServices = {
  async listarProdutosDaLoja(idLoja, somenteEmPromocao) {
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
      if (somenteEmPromocao) {
        whereClause.emPromocao = true;
      }

      const produtosNaLoja = await prisma.produtosEmLoja.findMany({
        where: whereClause,
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              imagemUrl: true,
              descricao: true,
              categoria: true,
            },
          },
        },
      });

      const resultadoFormatado = produtosNaLoja.map((item) => ({
        lojaId: item.lojaId,
        produtoId: item.produtoId,
        nomeProduto: item.produto.nome,
        imagemUrl: item.produto.imagemUrl,
        descricaoProduto: item.produto.descricao,
        categoriaId: item.produto.categoria.id,
        categoriaNome: item.produto.categoria.nome,
        disponivel: item.disponivel,
        valorBase: item.valorBase,
        emPromocao: item.emPromocao,
        descontoPromocao: item.descontoPromocao,
        validadePromocao: item.validadePromocao,
      }));

      return resultadoFormatado;
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        throw error;
      }
      console.error(
        `Erro ao buscar os produtos da loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(`Não foi possível buscar os produtos da loja.`);
    }
  },

  async buscarProdutoNaLoja(idLoja, idProduto) {
    try {
      const produtoNaLoja = await prisma.produtosEmLoja.findUnique({
        where: {
          lojaId_produtoId: {
            lojaId: idLoja,
            produtoId: idProduto,
          },
        },
        include: {
          // Inclui o objeto Produto base
          produto: {
            include: {
              // Inclui a categoria do produto
              categoria: true,
              // Inclui a lista de GRUPOS de personalização
              personalizacao: {
                include: {
                  // Dentro de cada grupo, inclui a lista de OPÇÕES (Modificadores)
                  modificadores: {
                    orderBy: { ordemVisualizacao: 'asc' },
                    include: {
                      lojasQueDisponibilizam: {
                        where: { lojaId: idLoja },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!produtoNaLoja) {
        return null;
      }

      const produtoFormatado = {
        // Dados da relação ProdutosEmLoja (preço na loja, etc.)
        lojaId: produtoNaLoja.lojaId,
        produtoId: produtoNaLoja.produtoId,
        disponivel: produtoNaLoja.disponivel,
        valorBase: produtoNaLoja.valorBase,
        emPromocao: produtoNaLoja.emPromocao,
        descontoPromocao: produtoNaLoja.descontoPromocao,
        validadePromocao: produtoNaLoja.validadePromocao,

        // Dados do Produto base
        nome: produtoNaLoja.produto.nome,
        descricao: produtoNaLoja.produto.descricao,
        imagemUrl: produtoNaLoja.produto.imagemUrl,
        categoria: produtoNaLoja.produto.categoria, // Objeto categoria

        // Lista de Grupos de Personalização
        personalizacao: produtoNaLoja.produto.personalizacao.map((grupo) => ({
          id: grupo.id,
          nome: grupo.nome,
          selecaoMinima: grupo.selecaoMinima,
          selecaoMaxima: grupo.selecaoMaxima,
          // Lista de Modificadores DENTRO deste grupo
          modificadores: grupo.modificadores
            .filter(
              (modificador) =>
                modificador.lojasQueDisponibilizam &&
                modificador.lojasQueDisponibilizam.length > 0,
            )
            .map((modificador) => {
              // Pega os dados do modificador na loja atual (disponiblidade e valor adicional)
              const modificadorEmLoja = modificador.lojasQueDisponibilizam[0];
              return {
                id: modificador.id,
                nome: modificador.nome,
                descricao: modificador.descricao,
                isOpcaoPadrao: modificador.isOpcaoPadrao,
                ordemVisualizacao: modificador.ordemVisualizacao,
                disponivelNaLoja: modificadorEmLoja.disponivel,
                valorAdicional: modificadorEmLoja.valorAdicional,
              };
            }),
        })),
      };

      return produtoFormatado;
    } catch (error) {
      console.error(
        `Erro ao buscar o produto com ID ${idProduto} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível buscar o produto especificado na loja.`,
      );
    }
  },

  async adicionarProdutoEmLoja(idLoja, dadosProdutoEmLoja) {
    try {
      const [lojaExiste, produtoBaseExiste] = await Promise.all([
        prisma.loja.findUnique({ where: { id: idLoja }, select: { id: true } }),
        prisma.produto.findUnique({
          where: { id: dadosProdutoEmLoja.produtoId },
          select: { id: true },
        }),
      ]);

      if (!lojaExiste) throw new Error(`Loja com ID ${idLoja} não encontrada.`);
      if (!produtoBaseExiste)
        throw new Error(
          `Produto base com ID ${dadosProdutoEmLoja.produtoId} não encontrado.`,
        );

      const produtoNaLoja = await prisma.produtosEmLoja.create({
        data: {
          lojaId: idLoja,
          produtoId: dadosProdutoEmLoja.produtoId,
          valorBase: dadosProdutoEmLoja.valorBase,
          disponivel: dadosProdutoEmLoja.disponivel,
          emPromocao: false,
        },
      });

      return produtoNaLoja;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(
          `O produto com ID ${dadosProdutoEmLoja.produtoId} já existe na loja com ID ${idLoja}.`,
        );
      }
      if (error.code === 'P2003' || error.message.includes('não encontrad')) {
        throw error;
      }

      console.error(
        `Erro ao adicionar o produto com ID ${dadosProdutoEmLoja.produtoId} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível adicionar o produto especificado na loja.`,
      );
    }
  },

  async atualizarProdutoNaLoja(idLoja, idProduto, novosDados) {
    try {
      const produtoAtualizadoNaLoja = await prisma.produtosEmLoja.update({
        where: {
          lojaId_produtoId: {
            lojaId: idLoja,
            produtoId: idProduto,
          },
        },
        data: novosDados,
      });

      return produtoAtualizadoNaLoja;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Produto com ID ${idProduto} não encontrado na loja com ID ${idLoja}.`,
        );
      }
      console.error(
        `Erro ao atualizar o produto com ID ${idProduto} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error(
        `Não foi possível atualizar o produto especificado na loja.`,
      );
    }
  },

  async deletarProdutoDaLoja(idLoja, idProduto) {
    try {
      const produtoRemovido = await prisma.produtosEmLoja.delete({
        where: {
          lojaId_produtoId: {
            lojaId: idLoja,
            produtoId: idProduto,
          },
        },
      });

      return produtoRemovido;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(
          `Produto com ID ${idProduto} não encontrado na loja com ID ${idLoja}.`,
        );
      }
      console.error(
        `Erro ao deletar o produto com ID ${idProduto} na loja com ID ${idLoja}: `,
        error,
      );
      throw new Error('Não foi possível remover o produto da loja.');
    }
  },
};

export default produtosEmLojaServices;
