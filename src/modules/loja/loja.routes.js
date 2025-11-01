import express from 'express';
import lojaController from './loja.controller.js';

// Imports dos routers aninhados
import enderecoRouter from '../endereco/endereco.routes.js';
import telefoneRouter from '../telefone/telefone.routes.js';
import produtosEmLojaRouter from '../produtos-em-loja/produtos-em-loja.routes.js';
import modificadorEmLojaRouter from '../modificador-em-loja/modificador-em-loja.routes.js';

// --- Importação do Auth ---
import { authMiddleware, RoleUsuario } from '../../config/authModule.js';
// --- Importação do Middleware Customizado ---
import { authorizeAdminOrStoreOwner } from '../../middlewares/authorization.js';

const lojaRouter = express.Router();

/*
 *==================================
 * ROTAS PÚBLICAS (CLIENTE/VISITANTE)
 * Proteção: Nenhuma
 *==================================
 */

/**
 * @swagger
 * /lojas:
 *   get:
 *     summary: Lista todas as lojas cadastradas
 *     tags: [Lojas]
 *     parameters:
 *       - $ref: '#/components/parameters/nomeLojaQueryParam' # Referência filtro de nome
 *       # TODO: Adicionar parâmetros de paginação aqui
 *     responses:
 *       200:
 *         description: Lista de lojas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Loja'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
lojaRouter.get('/', lojaController.buscarTodasAsLojas);

/**
 * @swagger
 * /lojas/proximas:
 *   get:
 *     summary: Busca lojas próximas por coordenadas e raio
 *     tags: [Lojas]
 *     parameters:
 *       - $ref: '#/components/parameters/latitudeQueryParam'
 *       - $ref: '#/components/parameters/longitudeQueryParam'
 *       - $ref: '#/components/parameters/raioKmQueryParam'
 *       - $ref: '#/components/parameters/usarRaioDeEntregaQueryParam'
 *     responses:
 *       200:
 *         description: Lista de lojas próximas ordenadas por distância.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LojaComDistancia'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Parâmetros inválidos.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
lojaRouter.get('/proximas', lojaController.buscarLojasProximas);

/**
 * @swagger
 * /lojas/{id}:
 *   get:
 *     summary: Busca uma loja específica pelo ID
 *     tags: [Lojas]
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes da loja (pode incluir endereço).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loja'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
lojaRouter.get('/:id', lojaController.buscarLoja);

/*
 *==================================
 * ROTAS ADMINISTRATIVAS (ADMIN)
 * Proteção: ensureAuthenticated + ensureRole(ADMIN)
 *==================================
 */

/**
 * @swagger
 * /lojas:
 *   post:
 *     summary: Cria uma nova loja (incluindo seu endereço)
 *     tags: [Lojas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaLoja'
 *     responses:
 *       201:
 *         description: Loja criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loja'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos (CNPJ duplicado, por exemplo).
 *       # 401: { $ref: '#/components/responses/UnauthorizedError' }
 *       # 403: { $ref: '#/components/responses/ForbiddenError' }
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
lojaRouter.post(
  '/',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  lojaController.criarLoja,
);

/**
 * @swagger
 * /lojas/{id}:
 *   put:
 *     summary: Atualiza uma loja existente
 *     tags: [Lojas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarLoja'
 *     responses:
 *       200:
 *         description: Loja atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Loja'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos (CNPJ duplicado, por exemplo).
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       # 401: { $ref: '#/components/responses/UnauthorizedError' }
 *       # 403: { $ref: '#/components/responses/ForbiddenError' }
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
lojaRouter.put(
  '/:id',
  authMiddleware.ensureAuthenticated,
  authorizeAdminOrStoreOwner,
  lojaController.atualizarLoja,
);

/**
 * @swagger
 * /lojas/{id}:
 *   delete:
 *     summary: Deleta uma loja
 *     tags: [Lojas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParam'
 *     responses:
 *       204:
 *         description: Loja deletada com sucesso.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Não é possível deletar (existem pedidos associados, por exemplo).
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       # 401: { $ref: '#/components/responses/UnauthorizedError' }
 *       # 403: { $ref: '#/components/responses/ForbiddenError' }
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
lojaRouter.delete(
  '/:id',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  lojaController.deletarLoja,
);

/*
 *==================================
 * ROTAS ANINHADAS (ADMIN / FUNCIONARIO)
 * Proteção: ensureAuthenticated + ensureRole(ADMIN ou FUNCIONARIO)
 *==================================
 */

// Monta o router de Endereço sob uma loja específica
// Path: /api/lojas/:lojaId/endereco
lojaRouter.use(
  '/:lojaId/endereco',
  authMiddleware.ensureAuthenticated,
  authorizeAdminOrStoreOwner,
  enderecoRouter,
);

// Monta o router de Telefone sob uma loja específica
// Path: /api/lojas/:lojaId/telefones
lojaRouter.use(
  '/:lojaId/telefones',
  authMiddleware.ensureAuthenticated,
  authorizeAdminOrStoreOwner,
  telefoneRouter,
);

// Monta o router de ProdutosEmLoja (catálogo da loja)
// Path: /api/lojas/:lojaId/produtos-loja
lojaRouter.use('/:lojaId/produtos-loja', produtosEmLojaRouter);

// Monta o router de ModificadorEmLoja (opções da loja)
// Path: /api/lojas/:lojaId/modificadores-loja
lojaRouter.use('/:lojaId/modificadores-loja', modificadorEmLojaRouter);

export default lojaRouter;
