import express from 'express';
import categoriaProdutoController from './categoria-produto.controller.js';

const categoriaProdutoRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaProduto:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: O ID auto-gerado da categoria.
 *         nome:
 *           type: string
 *           description: O nome da categoria (ex: Lanches, Bebidas).
 *         descricao:
 *           type: string
 *           description: Uma breve descrição da categoria.
 *       example:
 *         id: 1
 *         nome: "Lanches"
 *         descricao: "Os melhores sanduíches da casa."
 *     NovaCategoriaProduto:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           description: O nome da categoria.
 *         descricao:
 *           type: string
 *           description: Uma breve descrição da categoria.
 *       example:
 *         nome: "Bebidas"
 *         descricao: "Refrigerantes, sucos e águas."
 */

/**
 * @swagger
 * tags:
 *   - name: Categorias de Produto
 *     description: API para gerenciamento das categorias de produto.
 */

/**
 * @swagger
 * /api/categoria-produto:
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
 */
categoriaProdutoRouter.get(
  '/',
  categoriaProdutoController.buscarTodasAsCategorias,
);

/**
 * @swagger
 * /api/categoria-produto/{id}:
 *   get:
 *     summary: Busca uma única categoria pelo ID
 *     tags: [Categorias de Produto]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: O ID da categoria
 *     responses:
 *       200:
 *         description: Os dados da categoria.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriaProduto'
 *       404:
 *         description: Categoria não encontrada.
 */
categoriaProdutoRouter.get(
  '/:id',
  categoriaProdutoController.buscarCategoriaPorId,
);

/**
 * @swagger
 * /api/categoria-produto/buscar/por-nome:
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
 *         description: Categoria não encontrada.
 */

categoriaProdutoRouter.get(
  '/buscar/por-nome',
  categoriaProdutoController.buscarCategoriaPorNome,
);

/**
 * @swagger
 * /api/categoria-produto:
 *   post:
 *     summary: Cria uma nova categoria de produto
 *     tags: [Categorias de Produto]
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
 *         description: Dados inválidos.
 */
categoriaProdutoRouter.post('/', categoriaProdutoController.criarCategoria);

/**
 * @swagger
 * /api/categoria-produto/{id}:
 *   put:
 *     summary: Atualiza uma categoria de produto existente
 *     tags: [Categorias de Produto]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: O ID da categoria a ser atualizada
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
 *       404:
 *         description: Categoria não encontrada.
 *       400:
 *         description: Dados inválidos.
 */
categoriaProdutoRouter.put(
  '/:id',
  categoriaProdutoController.atualizarCategoria,
);

/**
 * @swagger
 * /api/categoria-produto/{id}:
 *   delete:
 *     summary: Deleta uma categoria de produto
 *     tags: [Categorias de Produto]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: O ID da categoria a ser deletada
 *     responses:
 *       204:
 *         description: Categoria deletada com sucesso (sem conteúdo).
 *       404:
 *         description: Categoria não encontrada.
 */
categoriaProdutoRouter.delete(
  '/:id',
  categoriaProdutoController.deletarCategoria,
);

export default categoriaProdutoRouter;
