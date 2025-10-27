import express from 'express';
import lojaController from './loja.controller.js';

const lojaRouter = express.Router();

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
// IMPORTANTE: Definir ANTES de '/:id'
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

/**
 * @swagger
 * /lojas:
 *   post:
 *     summary: Cria uma nova loja (incluindo seu endereço)
 *     tags: [Lojas]
 *     # security:
 *     #   - bearerAuth: [] # TODO: Adicionar segurança (Admin)
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
  /* authenticate, authorizeAdmin, */ lojaController.criarLoja,
);

/**
 * @swagger
 * /lojas/{id}:
 *   put:
 *     summary: Atualiza uma loja existente
 *     tags: [Lojas]
 *     # security:
 *     #   - bearerAuth: [] # TODO: Adicionar segurança (Admin ou Dono?)
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
  /* authenticate, authorizeAdmin, */ lojaController.atualizarLoja,
);

/**
 * @swagger
 * /lojas/{id}:
 *   delete:
 *     summary: Deleta uma loja
 *     tags: [Lojas]
 *     # security:
 *     #   - bearerAuth: [] # TODO: Adicionar segurança (Admin)
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
  /* authenticate, authorizeAdmin, */ lojaController.deletarLoja,
);

export default lojaRouter;
