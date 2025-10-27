import express from 'express';
import produtoController from './produto.controller.js';
import personalizavelRouter from '../personalizavel/personalizavel.routes.js';

const produtoRouter = express.Router();

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Retorna a lista de todos os produtos
 *     tags: [Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/categoriaIdQueryParam'
 *       # TODO: Adicionar outros parâmetros (nome, paginação, ordenação)
 *     responses:
 *       200:
 *         description: A lista de produtos (pode incluir categoria e personalizáveis).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError' # Se categoriaId for inválido
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtoRouter.get('/', produtoController.buscarTodosOsProdutos);

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Busca um único produto pelo ID (incluindo personalizáveis)
 *     tags: [Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParam'
 *     responses:
 *       200:
 *         description: Os dados do produto com seus grupos de personalização.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtoRouter.get('/:id', produtoController.buscarProdutoPorId);

/**
 * @swagger
 * /produtos/buscar/por-nome:
 *   get:
 *     summary: Busca produtos pelo nome (case-insensitive, pode retornar múltiplos)
 *     tags: [Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/produtoNomeQueryParam'
 *     responses:
 *       200:
 *         description: Lista de produtos encontrados com o nome especificado (pode ser vazia).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtoRouter.get('/buscar/por-nome', produtoController.buscarProdutoPorNome);

/**
 * @swagger
 * /produtos/{produtoId}/lojas:
 *   get:
 *     summary: Lista todas as lojas que vendem um determinado produto
 *     tags: [Produtos]
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/somenteDisponiveisQueryParam'
 *     responses:
 *       200:
 *         description: Lista de lojas que vendem o produto com detalhes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProdutoEmLojaDetalhado'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtoRouter.get('/:produtoId/lojas', produtoController.buscarLojasPorProduto);

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cria um novo produto (Admin)
 *     tags: [Produtos]
 *     # security:
 *     #   - bearerAuth: [] # TODO: Adicionar segurança
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
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtoRouter.post(
  '/',
  /* authenticate, authorizeAdmin, */ produtoController.criarProduto,
);

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualiza um produto existente (Admin)
 *     tags: [Produtos]
 *     # security:
 *     #   - bearerAuth: [] # TODO: Adicionar segurança
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarProduto'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtoRouter.put(
  '/:id',
  /* authenticate, authorizeAdmin, */ produtoController.atualizarProduto,
);

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Deleta um produto (Admin)
 *     description: CUIDADO - Verifica se o produto está associado a itens de pedido antes de deletar.
 *     tags: [Produtos]
 *     # security:
 *     #   - bearerAuth: [] # TODO: Adicionar segurança
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParam'
 *     responses:
 *       204:
 *         description: Produto deletado com sucesso.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtoRouter.delete(
  '/:id',
  /* authenticate, authorizeAdmin, */ produtoController.deletarProduto,
);

// --- ROTAS ANINHADAS PARA PERSONALIZAVEIS ---
produtoRouter.use('/:produtoId/personalizaveis', personalizavelRouter);

export default produtoRouter;
