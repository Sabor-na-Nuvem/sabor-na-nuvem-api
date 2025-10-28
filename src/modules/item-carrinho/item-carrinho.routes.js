import express from 'express';
import itemCarrinhoController from './item-carrinho.controller.js';

const itemCarrinhoRouter = express.Router({ mergeParams: true });

// --- Rotas relativas a /api/usuarios/me/carrinho/itens ---

/**
 * @swagger
 * /usuarios/me/carrinho/itens:
 *   post:
 *     summary: Adiciona um item (com personalizações) ao carrinho
 *     tags: [Itens do Carrinho]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Adiciona um produto e suas personalizações selecionadas ao carrinho do usuário.
 *       1. Requer `lojaId`, `produtoId` e `qtdProduto`.
 *       2. Se o carrinho não existir, ele será criado associado a esta `lojaId`.
 *       3. Se o carrinho já existir, a `lojaId` do item DEVE ser a mesma do carrinho (senão retorna erro 400).
 *       4. Valida a disponibilidade do produto e de todos os modificadores na loja.
 *       5. Valida as regras de seleção min/max dos grupos de personalização.
 *       6. Retorna o objeto 'CarrinhoCompleto' atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoItemCarrinhoInput'
 *     responses:
 *       201:
 *         description: Item adicionado com sucesso. Retorna o carrinho completo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarrinhoCompleto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos (IDs faltando, item de outra loja, regras de personalização violadas, etc.).
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Produto base, modificador ou loja não encontrados.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
itemCarrinhoRouter.post('/', itemCarrinhoController.adicionarItemAoCarrinho);

/**
 * @swagger
 * /usuarios/me/carrinho/itens/{itemCarrinhoId}:
 *   patch:
 *     summary: Atualiza a quantidade de um item no carrinho
 *     tags: [Itens do Carrinho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/itemCarrinhoIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarItemCarrinhoInput'
 *     responses:
 *       200:
 *         description: Quantidade atualizada. Retorna o carrinho completo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarrinhoCompleto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Quantidade inválida (menor que 1).
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Item não encontrado no carrinho deste usuário.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
itemCarrinhoRouter.patch(
  '/:itemCarrinhoId',
  itemCarrinhoController.atualizarItemNoCarrinho,
);

/**
 * @swagger
 * /usuarios/me/carrinho/itens/{itemCarrinhoId}:
 *   delete:
 *     summary: Remove um item do carrinho
 *     tags: [Itens do Carrinho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/itemCarrinhoIdPathParam'
 *     responses:
 *       200:
 *         description: Item removido com sucesso. Retorna o carrinho completo atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarrinhoCompleto'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Item não encontrado no carrinho deste usuário.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
itemCarrinhoRouter.delete(
  '/:itemCarrinhoId',
  itemCarrinhoController.removerItemDoCarrinho,
);

export default itemCarrinhoRouter;
