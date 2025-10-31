import express from 'express';
import categoriaProdutoController from './categoria-produto.controller.js';

// --- Importação do Auth ---
import { authMiddleware, RoleUsuario } from '../../config/authModule.js';

const categoriaProdutoRouter = express.Router();

/*
 *==================================
 * ROTAS PÚBLICAS (CLIENTE/VISITANTE)
 * Proteção: Nenhuma
 *==================================
 */

/**
 * @swagger
 * /api/categorias-produto:
 *   get:
 *     summary: Retorna a lista de todas as categorias de produto
 *     tags: [Categorias de Produto]
 *     responses:
 *       200:
 *         description: A lista de categorias.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoriaProduto'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
categoriaProdutoRouter.get(
  '/',
  categoriaProdutoController.buscarTodasAsCategorias,
);

/**
 * @swagger
 * /api/categorias-produto/{id}:
 *   get:
 *     summary: Busca uma única categoria pelo ID
 *     tags: [Categorias de Produto]
 *     parameters:
 *       - $ref: '#/components/parameters/categoriaProdutoIdPathParam'
 *     responses:
 *       200:
 *         description: Os dados da categoria.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaProduto'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
categoriaProdutoRouter.get(
  '/:id',
  categoriaProdutoController.buscarCategoriaPorId,
);

/**
 * @swagger
 * /api/categorias-produto/buscar/por-nome:
 *   get:
 *     summary: Busca uma única categoria pelo nome
 *     tags: [Categorias de Produto]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *         description: O nome exato da categoria para buscar
 *     responses:
 *       200:
 *         description: Os dados da categoria.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaProduto'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

categoriaProdutoRouter.get(
  '/buscar/por-nome',
  categoriaProdutoController.buscarCategoriaPorNome,
);

/*
 *==================================
 * ROTAS ADMINISTRATIVAS (ADMIN)
 * Proteção: ensureAuthenticated + ensureRole(ADMIN)
 *==================================
 */

/**
 * @swagger
 * /api/categorias-produto:
 *   post:
 *     summary: Cria uma nova categoria de produto
 *     tags: [Categorias de Produto]
 *     security:
 *      - bearerAuth: [] # TODO: Adicionar segurança
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaCategoriaProduto'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaProduto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
categoriaProdutoRouter.post(
  '/',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  categoriaProdutoController.criarCategoria,
);

/**
 * @swagger
 * /api/categorias-produto/{id}:
 *   put:
 *     summary: Atualiza uma categoria de produto existente
 *     tags: [Categorias de Produto]
 *     security:
 *      - bearerAuth: [] # TODO: Adicionar segurança
 *     parameters:
 *       - $ref: '#/components/parameters/categoriaProdutoIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaCategoriaProduto'
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaProduto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
categoriaProdutoRouter.put(
  '/:id',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  categoriaProdutoController.atualizarCategoria,
);

/**
 * @swagger
 * /api/categorias-produto/{id}:
 *   delete:
 *     summary: Deleta uma categoria de produto
 *     tags: [Categorias de Produto]
 *     security:
 *      - bearerAuth: [] # TODO: Adicionar segurança
 *     parameters:
 *       - $ref: '#/components/parameters/categoriaProdutoIdPathParam'
 *     responses:
 *       204:
 *         description: Categoria deletada com sucesso (sem conteúdo).
 *       400:
 *         description: Não é possível deletar (categoria tem produtos associados, por exemplo).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
categoriaProdutoRouter.delete(
  '/:id',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  categoriaProdutoController.deletarCategoria,
);

export default categoriaProdutoRouter;
