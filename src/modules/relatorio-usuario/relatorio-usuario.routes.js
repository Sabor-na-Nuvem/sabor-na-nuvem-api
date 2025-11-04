import express from 'express';
import relatorioController from './relatorio-usuario.controller.js';

const relatorioRouter = express.Router();

/**
 * @swagger
 * /relatorios/top-clientes/gastos-totais:
 *   get:
 *     summary: (Admin) Lista os top clientes por gastos totais
 *     tags: [Relatorios de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/limitQueryParam'
 *     responses:
 *       200:
 *         description: Lista dos top clientes (Relatorio + Usuario) ordenada por gastos totais.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RelatorioUsuarioDetalhado'
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
relatorioRouter.get(
  '/top-clientes/gastos-totais',
  relatorioController.listarTopClientesPorGastoTotal,
);

/**
 * @swagger
 * /relatorios/top-clientes/gastos-mensais:
 *   get:
 *     summary: (Admin) Lista os top clientes por gastos mensais
 *     tags: [Relatorios de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/limitQueryParam'
 *     responses:
 *       200:
 *         description: Lista dos top clientes (Relatorio + Usuario) ordenada por gastos mensais.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RelatorioUsuarioDetalhado'
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
relatorioRouter.get(
  '/top-clientes/gastos-mensais',
  relatorioController.listarTopClientesPorGastoMensal,
);

/**
 * @swagger
 * /relatorios/top-clientes/qtd-pedidos-total:
 *   get:
 *     summary: (Admin) Lista os top clientes por quantidade total de pedidos
 *     tags: [Relatorios de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/limitQueryParam'
 *     responses:
 *       200:
 *         description: Lista dos top clientes (Relatorio + Usuario) ordenada por quantidade total de pedidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RelatorioUsuarioDetalhado'
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
relatorioRouter.get(
  '/top-clientes/qtd-pedidos-total',
  relatorioController.listarTopClientesPorQtdPedidosTotal,
);

/**
 * @swagger
 * /relatorios/top-clientes/qtd-pedidos-mensal:
 *   get:
 *     summary: (Admin) Lista os top clientes por quantidade mensal de pedidos
 *     tags: [Relatorios de Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/limitQueryParam'
 *     responses:
 *       200:
 *         description: Lista dos top clientes (Relatorio + Usuario) ordenada por quantidade mensal de pedidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RelatorioUsuarioDetalhado'
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
relatorioRouter.get(
  '/top-clientes/qtd-pedidos-mensal',
  relatorioController.listarTopClientesPorQtdPedidosMensal,
);

export default relatorioRouter;
