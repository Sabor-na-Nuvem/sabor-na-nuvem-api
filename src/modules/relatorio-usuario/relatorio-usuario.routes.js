import express from 'express';
import relatorioController from './relatorio-usuario.controller.js';

const relatorioRouter = express.Router();

// TODO: Aplicar 'authenticate' e 'authorizeAdmin' a todas estas rotas

relatorioRouter.get(
  '/top-clientes/gastos-totais',
  /* authenticate, authorizeAdmin, */
  relatorioController.listarTopClientesPorGastoTotal,
);

relatorioRouter.get(
  '/top-clientes/gastos-mensais',
  /* authenticate, authorizeAdmin, */
  relatorioController.listarTopClientesPorGastoMensal,
);

relatorioRouter.get(
  '/top-clientes/qtd-pedidos',
  /* authenticate, authorizeAdmin, */
  relatorioController.listarTopClientesPorQtdPedidosTotal,
);

relatorioRouter.get(
  '/top-clientes/qtd-pedidos',
  /* authenticate, authorizeAdmin, */
  relatorioController.listarTopClientesPorQtdPedidosMensal,
);

export default relatorioRouter;
