import express from 'express';
import cupomDescontoController from './cupom-desconto.controller.js';

const cupomDescontoRouter = express.Router({ mergeParams: true });

cupomDescontoRouter.get('/', cupomDescontoController.listarCupons);

cupomDescontoRouter.get('/:id', cupomDescontoController.buscarCupomPorId);

cupomDescontoRouter.get(
  '/buscar/por-codigo',
  cupomDescontoController.buscarCupomPorCodigo,
);

cupomDescontoRouter.post('/', cupomDescontoController.criarCupom);

cupomDescontoRouter.post(
  '/validar',
  cupomDescontoController.verificarValidadeCupom,
);

cupomDescontoRouter.put('/:id', cupomDescontoController.atualizarCupom);

cupomDescontoRouter.delete('/:id', cupomDescontoController.deletarCupom);

export default cupomDescontoRouter;
