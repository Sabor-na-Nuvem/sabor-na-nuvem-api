import express from 'express';
import pedidoController from './pedido.controller.js';

// --- Importação do Auth e Middlewares ---
import {
  authMiddleware,
  RoleUsuario,
  authenticateOptional,
} from '../../config/authModule.js';

const pedidoRouter = express.Router();

// Middlewares de autorização locais
const authorizeFuncionario = authMiddleware.ensureRole([
  RoleUsuario.ADMIN,
  RoleUsuario.FUNCIONARIO,
]);
const authorizeAdmin = authMiddleware.ensureRole([RoleUsuario.ADMIN]);

/* ==================================
 * ROTA PÚBLICA (CRIAÇÃO)
 * Proteção: Autenticação Opcional
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
 *       - **Usuário Logado:** O `carrinho` é ignorado (busca do banco). Deve enviar `enderecoEntrega` se o tipo for ENTREGA.
 *       - **Usuário Anônimo:** O objeto `carrinho` é obrigatório e deve conter os itens e o `enderecoEntrega` (se for ENTREGA).
 *       - O sistema cria um "Snapshot" do endereço no momento do pedido, garantindo histórico.
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.post('/', authenticateOptional, pedidoController.criarPedido);

/* ==================================
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
 *       - $ref: '#/components/parameters/limitQueryParam'
 *     responses:
 *       200:
 *         description: Lista de pedidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoParaLista'
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
 *         description: Pedido cancelado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetalhado'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.post(
  '/me/:pedidoId/cancelar',
  authMiddleware.ensureAuthenticated,
  pedidoController.cancelarMeuPedido,
);

/* ==================================
 * ROTAS DA LOJA (FUNCIONÁRIO/ADMIN)
 * Proteção: ensureAuthenticated + ensureRole
 *==================================
 */

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
 *     responses:
 *       200:
 *         description: Lista de pedidos da loja.
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
  '/loja/:lojaId',
  authMiddleware.ensureAuthenticated,
  authorizeFuncionario,
  pedidoController.listarPedidosDaLoja,
);

/**
 * @swagger
 * /pedidos/loja/{lojaId}/{pedidoId}:
 *   get:
 *     summary: Busca um pedido específico no contexto da loja
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
 *     summary: Atualiza o status de um pedido
 *     tags: [Pedidos (Loja)]
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
 *         description: Status atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoDetalhado'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
pedidoRouter.patch(
  '/loja/:lojaId/:pedidoId',
  authMiddleware.ensureAuthenticated,
  authorizeFuncionario,
  pedidoController.atualizarStatusDoPedido,
);

/* ==================================
 * ROTAS DE ADMIN GLOBAL (ADMIN)
 * Proteção: ensureAuthenticated + ensureRole
 *==================================
 */

/**
 * @swagger
 * /pedidos/admin:
 *   get:
 *     summary: Lista TODOS os pedidos de TODAS as lojas
 *     tags: [Pedidos (Admin Global)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos os pedidos.
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
  authorizeAdmin,
  pedidoController.listarTodosOsPedidos,
);

/**
 * @swagger
 * /pedidos/admin/{pedidoId}:
 *   get:
 *     summary: Busca qualquer pedido pelo ID
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
  authorizeAdmin,
  pedidoController.buscarPedidoPorIdAdmin,
);

export default pedidoRouter;
