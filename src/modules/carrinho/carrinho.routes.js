import express from 'express';
import carrinhoController from './carrinho.controller.js';
import itemCarrinhoRouter from '../item-carrinho/item-carrinho.routes.js';

const carrinhoRouter = express.Router({ mergeParams: true });

// TODO: Aplicar autenticação a todas as rotas do carrinho
// carrinhoRouter.use(authenticate);

// Rotas que agem sobre o CARRINHO em si
carrinhoRouter.get('/', carrinhoController.buscarCarrinhoCompleto);
carrinhoRouter.patch('/', carrinhoController.atualizarCarrinho);
carrinhoRouter.delete('/', carrinhoController.limparCarrinho);

// <<< Monta o router de ITENS aninhado >>>
carrinhoRouter.use('/itens', itemCarrinhoRouter);

export default carrinhoRouter;
