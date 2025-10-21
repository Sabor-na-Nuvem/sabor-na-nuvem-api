import express from 'express';
import produtosEmLojaController from './produtos-em-loja.controller.js';

const produtosEmLojaRouter = express.Router({ mergeParams: true });

// --- ROTAS ANINHADAS SOB /api/lojas/:lojaId/produtos-loja ---

/**
 * @swagger
 * /api/lojas/{lojaId}/produtos-loja:
 *   get:
 *     summary: Lista todos os produtos cadastrados para uma loja específica
 *     tags: [ProdutosEmLoja]
 *     parameters:
 *       - in: path
 *         name: lojaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID da loja
 *       - in: query
 *         name: emPromocao
 *         schema:
 *           type: boolean
 *         description: Filtrar apenas por produtos em promoção (opcional)
 *     responses:
 *       200:
 *         description: Lista de produtos da loja com seus detalhes (preço, disponibilidade, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProdutosEmLojaDetalhado'
 */
produtosEmLojaRouter.get('/', produtosEmLojaController.listarProdutosDaLoja);

/**
 * @swagger
 * /api/lojas/{lojaId}/produtos-loja/{produtoId}:
 *   get:
 *     summary: Busca os detalhes de um produto específico em uma loja específica
 *     tags: [ProdutosEmLoja]
 *     parameters:
 *       - in: path
 *         name: lojaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID da loja
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do produto
 *     responses:
 *       200:
 *         description: Detalhes do produto na loja.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutosEmLojaDetalhado'
 *       404:
 *         description: Produto não encontrado nesta loja.
 */
produtosEmLojaRouter.get(
  '/:produtoId',
  produtosEmLojaController.buscarProdutoNaLoja,
);

/**
 * @swagger
 * /api/lojas/{lojaId}/produtos-loja:
 *   post:
 *     summary: Adiciona um produto ao catálogo de uma loja (cria a relação)
 *     tags: [ProdutosEmLoja]
 *     parameters:
 *       - in: path
 *         name: lojaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID da loja
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - produtoId
 *               - valorBase
 *               - disponivel
 *             properties:
 *               produtoId:
 *                 type: integer
 *               valorBase:
 *                 type: number
 *                 format: float
 *               disponivel:
 *                 type: boolean
 *               emPromocao:
 *                 type: boolean
 *               descontoPromocao:
 *                 type: integer
 *               validadePromocao:
 *                 type: string
 *                 format: date-time
 *             example:
 *               produtoId: 5
 *               valorBase: 25.50
 *               disponivel: true
 *               emPromocao: false
 *     responses:
 *       201:
 *         description: Produto adicionado à loja com sucesso.
 *       400:
 *         description: Dados inválidos ou produto já existe na loja.
 */
produtosEmLojaRouter.post('/', produtosEmLojaController.adicionarProdutoEmLoja);

/**
 * @swagger
 * /api/lojas/{lojaId}/produtos-loja/{produtoId}:
 *   put:
 *     summary: Atualiza os detalhes de um produto em uma loja (preço, promoção, disponibilidade)
 *     tags: [ProdutosEmLoja]
 *     parameters:
 *       - in: path
 *         name: lojaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID da loja
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valorBase:
 *                 type: number
 *                 format: float
 *               disponivel:
 *                 type: boolean
 *               emPromocao:
 *                 type: boolean
 *               descontoPromocao:
 *                 type: integer
 *               validadePromocao:
 *                 type: string
 *                 format: date-time
 *             example:
 *               valorBase: 26.00
 *               disponivel: true
 *               emPromocao: true
 *               descontoPromocao: 10
 *               validadePromocao: "2025-11-30T23:59:59Z"
 *     responses:
 *       200:
 *         description: Detalhes atualizados com sucesso.
 *       404:
 *         description: Produto não encontrado nesta loja.
 *       400:
 *         description: Dados inválidos.
 */
produtosEmLojaRouter.put(
  '/:produtoId',
  produtosEmLojaController.atualizarProdutoNaLoja,
);

/**
 * @swagger
 * /api/lojas/{lojaId}/produtos-loja/{produtoId}:
 *   delete:
 *     summary: Remove um produto do catálogo de uma loja (deleta a relação)
 *     tags: [ProdutosEmLoja]
 *     parameters:
 *       - in: path
 *         name: lojaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID da loja
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do produto
 *     responses:
 *       204:
 *         description: Produto removido da loja com sucesso.
 *       404:
 *         description: Produto não encontrado nesta loja.
 */
produtosEmLojaRouter.delete(
  '/:produtoId',
  produtosEmLojaController.deletarProdutoDaLoja,
);

export default produtosEmLojaRouter;
