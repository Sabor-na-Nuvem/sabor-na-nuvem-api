import itemCarrinhoServices from './item-carrinho.services.js';

const itemCarrinhoController = {
  async adicionarItemAoCarrinho(req, res) {
    const usuarioId = req.user?.id;
    // Body esperado: { idProduto: 1, qtdProduto: 1, modificadores: [{ modificadorId: 101 }, ...] }
    const dadosItem = req.body;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!dadosItem.produtoId || !dadosItem.qtdProduto) {
      return res
        .status(400)
        .json({ message: 'ProdutoID e Quantidade são obrigatórios.' });
    }

    try {
      const carrinhoAtualizado =
        await itemCarrinhoServices.adicionarItemAoCarrinho(
          usuarioId,
          dadosItem,
        );

      return res.status(201).json(carrinhoAtualizado);
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('inválido')
      ) {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes('indisponível') ||
        error.message.includes('deve ser definida')
      ) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({
        message: error.message || 'Erro ao adicionar item ao carrinho.',
      });
    }
  },

  async atualizarItemNoCarrinho(req, res) {
    const usuarioId = req.user?.id;
    const { itemCarrinhoId } = req.params;
    const novosDados = req.body; // Ex: { qtdProduto: 2 }

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    if (Number.isNaN(Number(itemCarrinhoId))) {
      return res
        .status(400)
        .json({ message: 'O ID do item do carrinho deve ser um número.' });
    }

    if (!novosDados.qtdProduto || Number(novosDados.qtdProduto) <= 0) {
      return res
        .status(400)
        .json({ message: 'Quantidade inválida. Deve ser 1 ou mais.' });
    }

    try {
      const carrinhoAtualizado =
        await itemCarrinhoServices.atualizarItemNoCarrinho(
          usuarioId,
          Number(itemCarrinhoId),
          novosDados,
        );

      return res.status(200).json(carrinhoAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({
        message: error.message || 'Erro ao atualizar item no carrinho.',
      });
    }
  },

  async removerItemDoCarrinho(req, res) {
    const usuarioId = req.user?.id;
    const { itemCarrinhoId } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    if (Number.isNaN(Number(itemCarrinhoId))) {
      return res
        .status(400)
        .json({ message: 'O ID do item do carrinho deve ser um número.' });
    }

    try {
      const carrinhoAtualizado =
        await itemCarrinhoServices.removerItemDoCarrinho(
          usuarioId,
          Number(itemCarrinhoId),
        );

      return res.status(200).json(carrinhoAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({
        message: error.message || 'Erro ao remover item do carrinho.',
      });
    }
  },
};

export default itemCarrinhoController;
