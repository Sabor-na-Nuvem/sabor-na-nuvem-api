import express from 'express';
import produtosEmLojaController from './produtos-em-loja.controller.js';

const produtosEmLojaRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * /lojas/{lojaId}/produtos-loja:
 *   get:
 *     summary: Lista todos os produtos cadastrados para uma loja específica
 *     tags: [Produtos Em Loja]
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/emPromocaoQueryParam'
 *     # TODO: Add pagination parameters
 *     responses:
 *       200:
 *         description: Lista de produtos da loja com detalhes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProdutosEmLojaDetalhado'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja não encontrada.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtosEmLojaRouter.get('/', produtosEmLojaController.listarProdutosDaLoja);

/**
 * @swagger
 * /lojas/{lojaId}/produtos-loja/{produtoId}:
 *   get:
 *     summary: Busca os detalhes de um produto específico em uma loja específica
 *     tags: [Produtos Em Loja]
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *     responses:
 *       200:
 *         description: Detalhes do produto na loja.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutosEmLojaDetalhado'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Produto não encontrado nesta loja.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtosEmLojaRouter.get(
  '/:produtoId',
  produtosEmLojaController.buscarProdutoNaLoja,
);

/**
 * @swagger
 * /lojas/{lojaId}/produtos-loja:
 *   post:
 *     summary: Adiciona um produto ao catálogo de uma loja (Admin/Dono da Loja)
 *     tags: [Produtos Em Loja]
 *     # security:
 *     #   - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoProdutoEmLojaInput'
 *     responses:
 *       201:
 *         description: Produto adicionado à loja com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutosEmLoja'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou produto já existe na loja.
 *       # 401:
 *       #   $ref: '#/components/responses/UnauthorizedError'
 *       # 403:
 *       #   $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Produto base não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtosEmLojaRouter.post(
  '/',
  /* authenticate, authorizeAdminOrStoreOwner, */
  produtosEmLojaController.adicionarProdutoEmLoja,
);

/**
 * @swagger
 * /lojas/{lojaId}/produtos-loja/{produtoId}:
 *   put:
 *     summary: Atualiza os detalhes de um produto em uma loja (Admin/Dono da Loja)
 *     tags: [Produtos Em Loja]
 *     # security:
 *     #   - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarProdutoEmLojaInput'
 *     responses:
 *       200:
 *         description: Detalhes atualizados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutosEmLoja'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       # 401:
 *       #   $ref: '#/components/responses/UnauthorizedError'
 *       # 403:
 *       #   $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Produto não encontrado nesta loja.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtosEmLojaRouter.put(
  '/:produtoId',
  /* authenticate, authorizeAdminOrStoreOwner, */
  produtosEmLojaController.atualizarProdutoNaLoja,
);

/**
 * @swagger
 * /lojas/{lojaId}/produtos-loja/{produtoId}:
 *   delete:
 *     summary: Remove um produto do catálogo de uma loja (Admin/Dono da Loja)
 *     tags: [Produtos Em Loja]
 *     # security:
 *     #   - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *     responses:
 *       204:
 *         description: Produto removido da loja com sucesso.
 *       # 401:
 *       #   $ref: '#/components/responses/UnauthorizedError'
 *       # 403:
 *       #   $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Produto não encontrado nesta loja.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
produtosEmLojaRouter.delete(
  '/:produtoId',
  /* authenticate, authorizeAdminOrStoreOwner, */
  produtosEmLojaController.deletarProdutoDaLoja,
);

export default produtosEmLojaRouter;
