import produtosEmLojaServices from './produtos-em-loja.services.js';

// TODO: adicionar validação se a loja existe ou não em todas essas funções?
const produtosEmLojaController = {
  async listarProdutosDaLoja(req, res) {
    try {
      const { lojaId } = req.params;
      const somenteEmPromocao = req.query.emPromocao === 'true';

      if (Number.isNaN(Number(lojaId))) {
        return res
          .status(400)
          .json({ message: 'O ID da loja deve ser um número.' });
      }

      const produtos = await produtosEmLojaServices.listarProdutosDaLoja(
        Number(lojaId),
        somenteEmPromocao,
      );

      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarProdutoNaLoja(req, res) {
    try {
      const { idLoja, idProduto } = req.params;

      if (Number.isNaN(Number(idLoja)) || Number.isNaN(Number(idProduto))) {
        return res
          .status(400)
          .json({ message: 'O ID do produto e da loja devem ser números.' });
      }

      const produto = await produtosEmLojaServices.buscarProdutoNaLoja(
        Number(idLoja),
        Number(idProduto),
      );

      if (!produto) {
        return res
          .status(404)
          .json({ message: 'Produto não encontrado nesta loja.' });
      }

      return res.status(200).json(produto);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async adicionarProdutoEmLoja(req, res) {
    try {
      const { idLoja } = req.params;
      const dadosProdutoEmLoja = req.body;

      if (
        Number.isNaN(Number(idLoja)) ||
        Number.isNaN(Number(dadosProdutoEmLoja.produtoId))
      ) {
        return res
          .status(400)
          .json({ message: 'O ID do produto e da loja devem ser números.' });
      }

      const novoProdutoNaLoja =
        await produtosEmLojaServices.adicionarProdutoEmLoja(
          Number(idLoja),
          dadosProdutoEmLoja,
        );

      return res.status(201).json(novoProdutoNaLoja);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async atualizarProdutoNaLoja(req, res) {
    try {
      const { idLoja, idProduto } = req.params;
      const novosDados = req.body;

      if (Number.isNaN(Number(idLoja)) || Number.isNaN(Number(idProduto))) {
        return res
          .status(400)
          .json({ message: 'O ID do produto e da loja devem ser números.' });
      }

      const produtoAtualizado =
        await produtosEmLojaServices.atualizarProdutoNaLoja(
          Number(idLoja),
          Number(idProduto),
          novosDados,
        );

      return res.status(200).json(produtoAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  },

  async deletarProdutoDaLoja(req, res) {
    try {
      const { idLoja, idProduto } = req.params;

      if (Number.isNaN(Number(idLoja)) || Number.isNaN(Number(idProduto))) {
        return res
          .status(400)
          .json({ message: 'O ID do produto deve ser um número.' });
      }

      await produtosEmLojaServices.deletarProdutoDaLoja(
        Number(idLoja),
        Number(idProduto),
      );

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

export default produtosEmLojaController;
