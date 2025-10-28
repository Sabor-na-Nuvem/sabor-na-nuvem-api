import express from 'express';
import itemCarrinhoController from './item-carrinho.controller.js';

const itemCarrinhoRouter = express.Router({ mergeParams: true });

// --- Rotas relativas a /api/usuarios/me/carrinho/itens ---

// POST / -> Adiciona um novo item
itemCarrinhoRouter.post('/', itemCarrinhoController.adicionarItemAoCarrinho);

// PATCH /:itemCarrinhoId -> Atualiza a quantidade de um item
itemCarrinhoRouter.patch(
  '/:itemCarrinhoId',
  itemCarrinhoController.atualizarItemNoCarrinho,
);

// DELETE /:itemCarrinhoId -> Remove um item
itemCarrinhoRouter.delete(
  '/:itemCarrinhoId',
  itemCarrinhoController.removerItemDoCarrinho,
);

export default itemCarrinhoRouter;
