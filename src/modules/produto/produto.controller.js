import produtoServices from './produto.services.js';

const produtoController = {
  async buscarTodosOsProdutos(req, res) {
    try {
      const produtos = await produtoServices.buscarTodosOsProdutos();

      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarProdutosPorCategoria(req, res) {
    try {
      const { id } = req.params;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID da categoria deve ser um número.' });
      }

      const produtos = await produtoServices.buscarProdutosPorCategoria(
        Number(id),
      );

      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarProdutoPorId(req, res) {
    try {
      const { id } = req.params;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID do produto deve ser um número.' });
      }

      const produto = await produtoServices.buscarProdutoPorId(Number(id));

      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrada.' });
      }

      return res.status(200).json(produto);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarProdutoPorNome(req, res) {
    try {
      const { nome } = req.query;

      if (!nome) {
        return res
          .status(400)
          .json({ message: 'O parâmetro "nome" na query é obrigatório.' });
      }

      const produto = await produtoServices.buscarProdutoPorNome(nome);

      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      return res.status(200).json(produto);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async criarProduto(req, res) {
    try {
      const dadosProduto = req.body;
      const novoProduto = await produtoServices.criarProduto(dadosProduto);

      return res.status(201).json(novoProduto);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async atualizarProduto(req, res) {
    try {
      const { id } = req.params;
      const novosDados = req.body;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID do produto deve ser um número.' });
      }

      const ProdutoAtualizado = await produtoServices.atualizarProduto(
        Number(id),
        novosDados,
      );

      return res.status(200).json(ProdutoAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  },

  async deletarProduto(req, res) {
    try {
      const { id } = req.params;

      if (Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ message: 'O ID do produto deve ser um número.' });
      }

      await produtoServices.deletarProduto(Number(id));

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

export default produtoController;
