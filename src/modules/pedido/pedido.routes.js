import express from 'express';
import pedidoController from './pedido.controller.js';

// --- Importação do Auth ---
import {
  authMiddleware,
  RoleUsuario,
  authenticateOptional,
} from '../../config/authModule.js';

const pedidoRouter = express.Router();

/*
 *==================================
 * ROTA PÚBLICA (CRIAÇÃO)
 * Proteção: Nenhuma (Autenticação é opcional no controller)
 *==================================
 */

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Cria um novo pedido (logado ou anônimo)
 *     tags: [Pedidos (Cliente)]
 *     description: |
 *       Cria um novo pedido.
 *       - Se autenticado, usa o carrinho salvo no banco (ignora `carrinho` do body).
 *       - Se anônimo, o `carrinho` (mockado) é obrigatório no body.
 *       Revalida todos os preços e disponibilidade no momento da criação.
 *     security:
 *       - bearerAuth: [] # Autenticação é OPCIONAL aqui
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarPedidoInput'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso. Retorna o pedido detalhado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetalhado'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Erro de validação (carrinho vazio, loja não definida, item indisponível, regra de cupom falhou, etc.).
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja, produto ou modificador não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.post('/', authenticateOptional, pedidoController.criarPedido);

/*
 *==================================
 * ROTAS DO CLIENTE (CLIENTE)
 * Proteção: ensureAuthenticated
 *==================================
 */

/**
 * @swagger
 * /pedidos/me:
 *   get:
 *     summary: Lista o histórico de pedidos do usuário logado
 *     tags: [Pedidos (Cliente)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/statusQueryParam'
 *       - $ref: '#/components/parameters/lojaIdQueryParam'
 *       - $ref: '#/components/parameters/tipoQueryParam'
 *       - $ref: '#/components/parameters/dataDeQueryParam'
 *       - $ref: '#/components/parameters/dataAteQueryParam'
 *       - $ref: '#/components/parameters/pageQueryParam'
 *       - $ref: '#/components/parameters/limitQueryParam'
 *     responses:
 *       200:
 *         description: Lista de pedidos do usuário com paginação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaPedidosResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.get(
  '/me',
  authMiddleware.ensureAuthenticated,
  pedidoController.listarMeusPedidos,
);

/**
 * @swagger
 * /pedidos/me/{pedidoId}:
 *   get:
 *     summary: Busca um pedido específico do usuário logado
 *     tags: [Pedidos (Cliente)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pedidoIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do pedido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetalhado'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *         description: Pedido não pertence a este usuário.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.get(
  '/me/:pedidoId',
  authMiddleware.ensureAuthenticated,
  pedidoController.buscarMeuPedidoPorId,
);

/**
 * @swagger
 * /pedidos/me/{pedidoId}/cancelar:
 *   post:
 *     summary: Cliente cancela o próprio pedido
 *     tags: [Pedidos (Cliente)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pedidoIdPathParam'
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso. Retorna o pedido atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetalhado'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Pedido não pode mais ser cancelado (status avançado).
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *         description: Pedido não pertence a este usuário.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.post(
  '/me/:pedidoId/cancelar',
  authMiddleware.ensureAuthenticated,
  pedidoController.cancelarMeuPedido,
);

/*
 *==================================
 * ROTAS DA LOJA (FUNCIONÁRIO/ADMIN)
 * Proteção: ensureAuthenticated + ensureRole(FUNCIONARIO ou ADMIN)
 *==================================
 */

// Middleware reutilizável para proteger rotas de gerenciamento de loja
const authorizeFuncionario = authMiddleware.ensureRole([
  RoleUsuario.ADMIN,
  RoleUsuario.FUNCIONARIO,
]);

/**
 * @swagger
 * /pedidos/loja/{lojaId}:
 *   get:
 *     summary: Lista pedidos de uma loja específica (Painel da Loja)
 *     tags: [Pedidos (Loja)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParam'
 *       - $ref: '#/components/parameters/statusQueryParam'
 *       - $ref: '#/components/parameters/clienteIdQueryParam'
 *       - $ref: '#/components/parameters/tipoQueryParam'
 *       - $ref: '#/components/parameters/dataDeQueryParam'
 *       - $ref: '#/components/parameters/dataAteQueryParam'
 *       - $ref: '#/components/parameters/pageQueryParam'
 *       - $ref: '#/components/parameters/limitQueryParam'
 *     responses:
 *       200:
 *         description: Lista de pedidos da loja com paginação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaPedidosResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *         description: Usuário não tem permissão para ver pedidos desta loja.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja não encontrada.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.get(
  '/loja/:lojaId',
  authMiddleware.ensureAuthenticated,
  authorizeFuncionario,
  pedidoController.listarPedidosDaLoja,
);

/**
 * @swagger
 * /pedidos/loja/{lojaId}/{pedidoId}:
 *   get:
 *     summary: Busca um pedido específico no contexto da loja (Painel da Loja)
 *     tags: [Pedidos (Loja)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParam'
 *       - $ref: '#/components/parameters/pedidoIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do pedido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetalhado'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Pedido não encontrado ou não pertence a esta loja.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.get(
  '/loja/:lojaId/:pedidoId',
  authMiddleware.ensureAuthenticated,
  authorizeFuncionario,
  pedidoController.buscarPedidoDaLoja,
);

/**
 * @swagger
 * /pedidos/loja/{lojaId}/{pedidoId}:
 *   patch:
 *     summary: Atualiza o status de um pedido (Painel da Loja)
 *     tags: [Pedidos (Loja)]
 *     description: Move o pedido no fluxo (PENDENTE -> EM_PREPARO, por exemplo). Valida a transição de status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParam'
 *       - $ref: '#/components/parameters/pedidoIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarStatusPedidoInput'
 *     responses:
 *       200:
 *         description: Status atualizado. Retorna o pedido completo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetalhado'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Status inválido ou transição de status não permitida.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Pedido não encontrado ou não pertence a esta loja.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.patch(
  '/loja/:lojaId/:pedidoId',
  authMiddleware.ensureAuthenticated,
  authorizeFuncionario,
  pedidoController.atualizarStatusDoPedido,
);

/*
 *==================================
 * ROTAS DE ADMIN GLOBAL (ADMIN)
 * Proteção: ensureAuthenticated + ensureRole(ADMIN)
 *==================================
 */

/**
 * @swagger
 * /pedidos/admin:
 *   get:
 *     summary: Lista TODOS os pedidos de TODAS as lojas (Admin Global)
 *     tags: [Pedidos (Admin Global)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdQueryParam'
 *       - $ref: '#/components/parameters/clienteIdQueryParam'
 *       - $ref: '#/components/parameters/statusQueryParam'
 *       - $ref: '#/components/parameters/tipoQueryParam'
 *       - $ref: '#/components/parameters/dataDeQueryParam'
 *       - $ref: '#/components/parameters/dataAteQueryParam'
 *       - $ref: '#/components/parameters/pageQueryParam'
 *       - $ref: '#/components/parameters/limitQueryParam'
 *     responses:
 *       200:
 *         description: Lista de pedidos com paginação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaPedidosResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.get(
  '/admin',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  pedidoController.listarTodosOsPedidos,
);

/**
 * @swagger
 * /pedidos/admin/{pedidoId}:
 *   get:
 *     summary: Busca qualquer pedido pelo ID (Admin Global)
 *     tags: [Pedidos (Admin Global)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pedidoIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do pedido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetalhado'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.get(
  '/admin/:pedidoId',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  pedidoController.buscarPedidoPorIdAdmin,
);

export default pedidoRouter;
