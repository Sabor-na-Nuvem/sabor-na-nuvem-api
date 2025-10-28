import express from 'express';
import modificadorRouter from '../modificador/modificador.routes.js';
import personalizavelController from './personalizavel.controller.js';

const personalizavelRouter = express.Router({ mergeParams: true });

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

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis:
 *   post:
 *     summary: Cria um novo grupo de personalização para um produto (Admin)
 *     tags: [Produtos - Personalização]
 *     # security:
 *     #   - bearerAuth: []
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
  /* authenticate, authorizeAdmin, */
  personalizavelController.criarPersonalizavelParaProduto,
);

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}:
 *   patch:
 *     summary: Atualiza (parcialmente) um grupo de personalização (Admin)
 *     tags: [Produtos - Personalização]
 *     # security:
 *     #   - bearerAuth: []
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
  /* authenticate, authorizeAdmin, */
  personalizavelController.atualizarPersonalizavel,
);

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}:
 *   delete:
 *     summary: Deleta um grupo de personalização (Admin)
 *     description: ATENÇÃO - Isso também deletará todos os Modificadores dentro deste grupo.
 *     tags: [Produtos - Personalização]
 *     # security:
 *     #   - bearerAuth: []
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
  /* authenticate, authorizeAdmin, */
  personalizavelController.deletarPersonalizavel,
);

// --- MONTAGEM DAS ROTAS ANINHADAS DE MODIFICADOR ---
personalizavelRouter.use('/:personalizavelId/modificadores', modificadorRouter);

export default personalizavelRouter;
