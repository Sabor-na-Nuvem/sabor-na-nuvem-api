import express from 'express';
import pedidoController from './pedido.controller.js';

const pedidoRouter = express.Router();

// TODO: Adicionar middleware 'authenticate'

// --- ROTA PÚBLICA ---
// POST /api/pedidos -> Criar um pedido
pedidoRouter.post(
  '/',
  /* authenticate(optional), */ pedidoController.criarPedido,
);

// --- ROTAS DO CLIENTE (CLIENTE) ---

// GET /api/pedidos/me -> Lista o histórico de pedidos do usuário logado
pedidoRouter.get('/me', /* authenticate, */ pedidoController.listarMeusPedidos);

// GET /api/pedidos/me/:pedidoId -> Busca um pedido específico do usuário logado
pedidoRouter.get(
  '/me/:pedidoId',
  /* authenticate, authorizePedidoOwner, */ pedidoController.buscarMeuPedidoPorId,
);

// POST /api/pedidos/me/:pedidoId/cancelar -> Cliente cancela o próprio pedido
pedidoRouter.post(
  '/me/:pedidoId/cancelar',
  /* authenticate, authorizePedidoOwner, */ pedidoController.cancelarMeuPedido,
);

// --- ROTAS DA LOJA (FUNCIONÁRIO/ADMIN) ---

// GET /api/pedidos/loja/:lojaId -> Lista pedidos de uma loja específica (para o painel da loja)
// (Permite filtros por query, ex: ?status=PENDENTE&cliente=2)
pedidoRouter.get(
  '/loja/:lojaId',
  /* authenticate, authorizeFuncionario, */ pedidoController.listarPedidosDaLoja,
);

// GET /api/pedidos/loja/:lojaId/:pedidoId -> Busca um pedido específico no contexto da loja
pedidoRouter.get(
  '/loja/:lojaId/:pedidoId',
  /* authenticate, authorizeFuncionario, */ pedidoController.buscarPedidoDaLoja,
);

// PATCH /api/pedidos/loja/:lojaId/:pedidoId -> Atualiza o status de um pedido
// (Ex: PENDENTE -> EM_PREPARO)
pedidoRouter.patch(
  '/loja/:lojaId/:pedidoId',
  /* authenticate, authorizeFuncionario, */ pedidoController.atualizarStatusDoPedido,
);

// --- ROTAS DE ADMIN GLOBAL (ADMIN) ---

// GET /api/pedidos/admin -> Lista TODOS os pedidos de TODAS as lojas
// (Permite filtros por query, ex: ?lojaId=1&status=CANCELADO&cliente=2)
pedidoRouter.get(
  '/admin',
  /* authenticate, authorizeAdmin, */ pedidoController.listarTodosOsPedidos,
);

// GET /api/pedidos/admin/:pedidoId -> Busca qualquer pedido pelo ID
pedidoRouter.get(
  '/admin/:pedidoId',
  /* authenticate, authorizeAdmin, */ pedidoController.buscarPedidoPorIdAdmin,
);

export default pedidoRouter;
