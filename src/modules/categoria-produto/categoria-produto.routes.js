import express from 'express';
import categoriaProdutoController from './categoria-produto.controller.js';

const categoriaProdutoRouter = express.Router();

// MÉTODO: GET, Endpoint: /api/categoria-produto/
categoriaProdutoRouter.get(
  '/',
  categoriaProdutoController.buscarTodasAsCategorias,
);

// MÉTODO: GET, Endpoint: /api/categoria-produto/:id
categoriaProdutoRouter.get(
  '/:id',
  categoriaProdutoController.buscarCategoriaPorId,
);

// MÉTODO: GET, Endpoint: /api/categoria-produto/nome
categoriaProdutoRouter.get(
  '/nome',
  categoriaProdutoController.buscarCategoriaPorNome,
);

// MÉTODO: POST, Endpoint: /api/categoria-produto/
categoriaProdutoRouter.post('/', categoriaProdutoController.criarCategoria);

// MÉTODO: PUT, Endpoint: /api/categoria-produto/:id
categoriaProdutoRouter.put(
  '/:id',
  categoriaProdutoController.atualizarCategoria,
);

// MÉTODO: DELETE, Endpoint: /api/categoria-produto/:id
categoriaProdutoRouter.delete(
  '/:id',
  categoriaProdutoController.deletarCategoria,
);

export default categoriaProdutoRouter;
