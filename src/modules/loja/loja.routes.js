import express from 'express';
import lojaController from './loja.controller.js';

const lojaRouter = express.Router({ mergeParams: true });

// --- (/api/lojas/) ---

// GET / -> Busca todas as lojas
lojaRouter.get('/', lojaController.buscarTodasAsLojas);

// GET / -> Busca uma loja
lojaRouter.get('/:id', lojaController.buscarLoja);

// GET / -> Busca as lojas próximas ao usuário
lojaRouter.get('/proximas', lojaController.buscarLojasProximas);

// POST / -> Cria uma nova loja
lojaRouter.post('/', lojaController.criarLoja);

// PUT / -> Atualiza uma loja
lojaRouter.put('/:id', lojaController.atualizarLoja);

// DELETE / -> Deleta uma loja
lojaRouter.delete('/:id', lojaController.deletarLoja);

export default lojaRouter;
