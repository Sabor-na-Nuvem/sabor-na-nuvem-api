import express from 'express';
import lojaController from './loja.controller.js';

const lojaRouter = express.Router({ mergeParams: true });

// --- ROTAS RELATIVAS AO PAI (/api/lojas/) ---

// GET / -> Busca todas as lojas
lojaRouter.get('/', lojaController.buscarTodasAsLojas);

// GET / -> Busca uma loja
lojaRouter.get('/:id', lojaController.buscarLoja);

// POST / -> Cria uma nova loja
lojaRouter.post('/', lojaController.criarLoja);

// PUT / -> Atualiza uma loja
lojaRouter.put('/:id', lojaController.atualizarLoja);

// DELETE / -> Deleta uma loja
lojaRouter.delete('/:id', lojaController.deletarLoja);

export default lojaRouter;
