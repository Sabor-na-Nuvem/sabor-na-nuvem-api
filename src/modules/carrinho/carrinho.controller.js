import carrinhoServices from './carrinho.services.js';

const carrinhoController = {
  async buscarCarrinhoCompleto(req, res) {
    // TODO: Verificar se o middleware de auth realmente popular req.user
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const carrinho = await carrinhoServices.buscarCarrinhoCompleto(usuarioId);

      if (!carrinho) {
        return res.status(200).json({
          id: usuarioId,
          tipo: 'ENTREGA',
          lojaId: null,
          itensNoCarrinho: [],
          subtotal: 0.0,
        });
      }

      return res.status(200).json(carrinho);
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message || 'Erro ao buscar carrinho.' });
    }
  },

  async atualizarCarrinho(req, res) {
    const usuarioId = req.user?.id;
    const novosDados = req.body; // Ex: { tipo: 'RETIRADA', lojaId: 5 }

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const { carrinho, avisos } = await carrinhoServices.atualizarCarrinho(
        usuarioId,
        novosDados,
      );

      return res.status(200).json({ carrinho, avisos });
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: error.message || 'Erro ao atualizar carrinho.' });
    }
  },

  async limparCarrinho(req, res) {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      await carrinhoServices.limparCarrinho(usuarioId);

      return res.status(204).send();
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: error.message || 'Erro ao limpar carrinho.' });
    }
  },
};

export default carrinhoController;
