import categoriaProdutoService from './categoria-produto.services.js';

const categoriaProdutoController = {
  async buscarTodasAsCategorias(req, res) {
    try {
      const categorias =
        await categoriaProdutoService.buscarTodasAsCategorias();

      return res.status(200).json(categorias);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarCategoriaPorId(req, res) {
    try {
      const { id } = req.params;

      const categoria = await categoriaProdutoService.buscarCategoriaPorId(
        Number(id),
      );

      if (!categoria) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      return res.status(200).json(categoria);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarCategoriaPorNome(req, res) {
    try {
      const nome = req.body;

      const categoria =
        await categoriaProdutoService.buscarCategoriaPorId(nome);

      if (!categoria) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      return res.status(200).json(categoria);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async criarCategoria(req, res) {
    try {
      const dadosCategoria = req.body;
      const novaCategoria =
        await categoriaProdutoService.criarCategoria(dadosCategoria);

      return res.status(201).json(novaCategoria);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async atualizarCategoria(req, res) {
    try {
      const { id } = req.params;
      const novosDados = req.body;

      const categoriaAtualizada =
        await categoriaProdutoService.atualizarCategoria(
          Number(id),
          novosDados,
        );

      return res.status(200).json(categoriaAtualizada);
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  },

  async deletarCategoria(req, res) {
    try {
      const { id } = req.params;

      await categoriaProdutoService.deletarCategoria(Number(id));

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },
};

export default categoriaProdutoController;
