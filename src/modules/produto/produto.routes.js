import express from 'express';
import produtoController from './produto.controller.js';

const produtoRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Produto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: O ID auto-gerado do produto.
 *         nome:
 *           type: string
 *           description: O nome do produto.
 *         descricao:
 *           type: string
 *           description: A descrição detalhada do produto.
 *         imagemUrl:
 *           type: string
 *           description: URL da imagem do produto.
 *         categoriaId:
 *           type: integer
 *           description: O ID da categoria à qual o produto pertence.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: A data de criação do produto.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: A data da última atualização do produto.
 *       example:
 *         id: 1
 *         nome: "X-Burger Clássico"
 *         descricao: "Pão, carne, queijo e salada."
 *         imagemUrl: "http://example.com/burger.jpg"
 *         categoriaId: 1
 *         createdAt: "2025-10-17T17:30:00.000Z"
 *         updatedAt: "2025-10-17T17:30:00.000Z"
 *
 *     NovoProduto:
 *       type: object
 *       required:
 *         - nome
 *         - categoriaId
 *       properties:
 *         nome:
 *           type: string
 *           description: O nome do produto.
 *         descricao:
 *           type: string
 *           description: Uma breve descrição do produto.
 *         imagemUrl:
 *           type: string
 *           description: URL da imagem do produto.
 *         categoriaId:
 *           type: integer
 *           description: O ID da categoria do produto.
 *       example:
 *         nome: "X-Burger Clássico"
 *         descricao: "Pão, carne, queijo e salada."
 *         imagemUrl: "http://example.com/burger.jpg"
 *         categoriaId: 1
 */

/**
 * @swagger
 * tags:
 *   - name: Produtos
 *     description: API para gerenciamento de produtos.
 */

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     summary: Retorna a lista de todos os produtos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: A lista de produtos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 */
produtoRouter.get('/', produtoController.buscarTodosOsProdutos);

/**
 * @swagger
 * /api/produtos/{id}:
 *   get:
 *     summary: Busca um único produto pelo ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: O ID do produto
 *     responses:
 *       200:
 *         description: Os dados do produto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado.
 */
produtoRouter.get('/:id', produtoController.buscarProdutoPorId);

/**
 * @swagger
 * /api/produtos/buscar/por-nome:
 *   get:
 *     summary: Busca um único produto pelo nome
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *         description: O nome exato do produto para buscar
 *     responses:
 *       200:
 *         description: Os dados do produto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado.
 */
produtoRouter.get('/buscar/por-nome', produtoController.buscarProdutoPorNome);

/**
 * @swagger
 * /api/produtos:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Produtos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoProduto'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos.
 */
produtoRouter.post('/', produtoController.criarProduto);

/**
 * @swagger
 * /api/produtos/{id}:
 *   put:
 *     summary: Atualiza um produto existente
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: O ID do produto a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoProduto'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado.
 *       400:
 *         description: Dados inválidos.
 */
produtoRouter.put('/:id', produtoController.atualizarProduto);

/**
 * @swagger
 * /api/produtos/{id}:
 *   delete:
 *     summary: Deleta um produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: O ID do produto a ser deletado
 *     responses:
 *       204:
 *         description: Produto deletado com sucesso (sem conteúdo).
 *       404:
 *         description: Produto não encontrado.
 */
produtoRouter.delete('/:id', produtoController.deletarProduto);

export default produtoRouter;
