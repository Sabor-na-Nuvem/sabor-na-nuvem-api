import express from 'express';
import modificadorRouter from '../modificador/modificador.routes.js';
import personalizavelController from './personalizavel.controller.js';

// --- Importação do Auth ---
import { authMiddleware, RoleUsuario } from '../../config/authModule.js';

const personalizavelRouter = express.Router({ mergeParams: true });

/*
 *==================================
 * ROTAS PÚBLICAS (CLIENTE/VISITANTE)
 *==================================
 */

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis:
 *   get:
 *     summary: Lista todos os grupos de personalização de um produto
 *     tags: [Produtos - Personalização]
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *     responses:
 *       200:
 *         description: Lista dos grupos de personalização.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Personalizavel'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
personalizavelRouter.get(
  '/',
  personalizavelController.listarPersonalizaveisDoProduto,
);

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}:
 *   get:
 *     summary: Busca detalhes de um grupo de personalização específico
 *     tags: [Produtos - Personalização]
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/personalizavelIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do grupo de personalização (pode incluir modificadores).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personalizavel'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
personalizavelRouter.get(
  '/:personalizavelId',
  personalizavelController.buscarPersonalizavelPorId,
);

/*
 *==================================
 * ROTAS ADMINISTRATIVAS (ADMIN)
 * Proteção: ensureAuthenticated + ensureRole(ADMIN)
 *==================================
 */

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis:
 *   post:
 *     summary: Cria um novo grupo de personalização para um produto (Admin)
 *     tags: [Produtos - Personalização (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoPersonalizavel'
 *     responses:
 *       201:
 *         description: Grupo de personalização criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personalizavel'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
personalizavelRouter.post(
  '/',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  personalizavelController.criarPersonalizavelParaProduto,
);

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}:
 *   patch:
 *     summary: Atualiza (parcialmente) um grupo de personalização (Admin)
 *     tags: [Produtos - Personalização (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/personalizavelIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarPersonalizavel'
 *     responses:
 *       200:
 *         description: Grupo atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personalizavel'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
personalizavelRouter.patch(
  '/:personalizavelId',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  personalizavelController.atualizarPersonalizavel,
);

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}:
 *   delete:
 *     summary: Deleta um grupo de personalização (Admin)
 *     description: ATENÇÃO - Isso também deletará todos os Modificadores dentro deste grupo.
 *     tags: [Produtos - Personalização (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/personalizavelIdPathParam'
 *     responses:
 *       204:
 *         description: Grupo deletado com sucesso.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
personalizavelRouter.delete(
  '/:personalizavelId',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  personalizavelController.deletarPersonalizavel,
);

// --- Montagem Aninhada (Nível 3) ---

// Monta o router de ItemCarrinho sob um Carrinho específico
// Path: /api/produtos/:produtoId/personalizaveis/:personalizavelId/modificadores
personalizavelRouter.use('/:personalizavelId/modificadores', modificadorRouter);

export default personalizavelRouter;
