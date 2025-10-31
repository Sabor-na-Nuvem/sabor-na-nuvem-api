import { StatusPedido } from '@prisma/client';
import pedidoServices from './pedido.services.js';

const pedidoController = {
  // --- ROTA DE CRIAÇÃO (Pública ou Autenticada) ---

  async criarPedido(req, res) {
    try {
      const usuarioId = req.user?.id || null; // Pega ID do usuário logado (se houver)
      const dadosInput = req.body; // Pode conter o carrinho mockado ou apenas observações

      if (!usuarioId && !dadosInput.carrinho) {
        return res.status(400).json({
          message: 'Dados do carrinho são obrigatórios para pedidos anônimos.',
        });
      }

      const novoPedido = await pedidoServices.criarPedido(
        usuarioId,
        dadosInput,
      );

      return res.status(201).json(novoPedido);
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('inválido')
      ) {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes('indisponível') ||
        error.message.includes('obrigatória') ||
        error.message.includes('carrinho')
      ) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: error.message || 'Erro ao criar pedido.' });
    }
  },

  // --- ROTAS DO CLIENTE (AUTENTICADO) ---

  async listarMeusPedidos(req, res) {
    const usuarioId = req.user?.id;
    const filtros = req.query; // Para paginação (page, limit) ou status

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
      const pedidos = await pedidoServices.listarMeusPedidos(
        usuarioId,
        filtros,
      );

      return res.status(200).json(pedidos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarMeuPedidoPorId(req, res) {
    const usuarioId = req.user?.id;
    const { pedidoId } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    if (Number.isNaN(Number(pedidoId))) {
      return res
        .status(400)
        .json({ message: 'O ID do pedido deve ser um número.' });
    }

    try {
      const pedido = await pedidoServices.buscarMeuPedidoPorId(
        Number(pedidoId),
        usuarioId,
      );

      if (!pedido) {
        return res.status(404).json({
          message: 'Pedido não encontrado ou não pertence a este usuário.',
        });
      }

      return res.status(200).json(pedido);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async cancelarMeuPedido(req, res) {
    const usuarioId = req.user?.id;
    const { pedidoId } = req.params;
    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    if (Number.isNaN(Number(pedidoId))) {
      return res
        .status(400)
        .json({ message: 'O ID do pedido deve ser um número.' });
    }

    try {
      const pedidoCancelado = await pedidoServices.cancelarMeuPedido(
        Number(pedidoId),
        usuarioId,
      );

      return res.status(200).json(pedidoCancelado);
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('não pertence')
      ) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('não pode ser cancelado')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  // --- ROTAS DA LOJA (FUNCIONÁRIO/ADMIN) ---

  async listarPedidosDaLoja(req, res) {
    // TODO: Adicionar autorização
    const { lojaId } = req.params;
    const filtros = req.query; // ex: ?status=PENDENTE&page=1

    if (Number.isNaN(Number(lojaId))) {
      return res
        .status(400)
        .json({ message: 'O ID da loja deve ser um número.' });
    }

    try {
      const pedidos = await pedidoServices.listarPedidosDaLoja(
        Number(lojaId),
        filtros,
      );

      return res.status(200).json(pedidos);
    } catch (error) {
      if (error.message.includes('Loja não encontrada')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarPedidoDaLoja(req, res) {
    // TODO: Adicionar autorização
    const { lojaId, pedidoId } = req.params;

    if (Number.isNaN(Number(lojaId)) || Number.isNaN(Number(pedidoId))) {
      return res
        .status(400)
        .json({ message: 'IDs da loja e do pedido devem ser números.' });
    }

    try {
      const pedido = await pedidoServices.buscarPedidoDaLoja(
        Number(pedidoId),
        Number(lojaId),
      );

      if (!pedido) {
        return res.status(404).json({
          message: 'Pedido não encontrado ou não pertence a esta loja.',
        });
      }

      return res.status(200).json(pedido);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async atualizarStatusDoPedido(req, res) {
    // TODO: Adicionar autorização
    const { lojaId, pedidoId } = req.params;
    const { status } = req.body; // { "status": "EM_PREPARO" }

    if (Number.isNaN(Number(lojaId)) || Number.isNaN(Number(pedidoId))) {
      return res
        .status(400)
        .json({ message: 'IDs da loja e do pedido devem ser números.' });
    }

    if (!status || !(status in StatusPedido)) {
      return res.status(400).json({
        message: `Status inválido. Status deve ser um de: ${Object.keys(StatusPedido).join(', ')}`,
      });
    }

    try {
      const pedidoAtualizado = await pedidoServices.atualizarStatusDoPedido(
        Number(pedidoId),
        Number(lojaId),
        status,
      );

      return res.status(200).json(pedidoAtualizado);
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('Transição de status inválida')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  // --- ROTAS DE ADMIN ---

  async listarTodosOsPedidos(req, res) {
    // TODO: Adicionar autorização (Admin Global)
    const filtros = req.query; // ex: ?lojaId=1&status=ENTREGUE

    try {
      const pedidos = await pedidoServices.listarTodosOsPedidos(filtros);

      return res.status(200).json(pedidos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async buscarPedidoPorIdAdmin(req, res) {
    // TODO: Adicionar autorização (Admin Global)
    const { pedidoId } = req.params;

    if (Number.isNaN(Number(pedidoId))) {
      return res
        .status(400)
        .json({ message: 'O ID do pedido deve ser um número.' });
    }

    try {
      const pedido = await pedidoServices.buscarPedidoPorIdAdmin(
        Number(pedidoId),
      );

      if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado.' });
      }

      return res.status(200).json(pedido);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

export default pedidoController;
