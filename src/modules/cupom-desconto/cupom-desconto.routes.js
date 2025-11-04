import express from 'express';
import cupomDescontoController from './cupom-desconto.controller.js';

// --- Importação do Auth ---
import { authMiddleware, RoleUsuario } from '../../config/authModule.js';

const cupomDescontoRouter = express.Router();

// -----------------------------------------------------------------------------
// ROTAS ADMINISTRATIVAS (GERENCIAMENTO)
// -----------------------------------------------------------------------------

/**
 * @swagger
 * /cupons:
 *   get:
 *     summary: Lista todos os cupons de desconto (Admin)
 *     tags: [Cupons de Desconto (Admin)]
 *     security:
 *       - bearerAuth: []
 *     # parameters: # TODO: Adicionar paginação e filtros (ativo, usuarioId, etc.)
 *     responses:
 *       200:
 *         description: Lista de cupons.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CupomDesconto'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
cupomDescontoRouter.get(
  '/',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  cupomDescontoController.listarCupons,
);

/**
 * @swagger
 * /cupons/buscar/por-codigo:
 *   get:
 *     summary: Busca um cupom de desconto pelo seu código (Admin)
 *     tags: [Cupons de Desconto (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/cupomCodigoQueryParam'
 *     responses:
 *       200:
 *         description: Detalhes do cupom encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CupomDesconto'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
cupomDescontoRouter.get(
  '/buscar/por-codigo',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  cupomDescontoController.buscarCupomPorCodigo,
);

/**
 * @swagger
 * /cupons/{id}:
 *   get:
 *     summary: Busca um cupom de desconto pelo ID (Admin)
 *     tags: [Cupons de Desconto (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/cupomIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do cupom.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CupomDesconto'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
cupomDescontoRouter.get(
  '/:id',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  cupomDescontoController.buscarCupomPorId,
);

/**
 * @swagger
 * /cupons:
 *   post:
 *     summary: Cria um novo cupom de desconto (Admin)
 *     tags: [Cupons de Desconto (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoCupomDesconto'
 *     responses:
 *       201:
 *         description: Cupom criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CupomDesconto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError' # Código já existe ou dados inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
cupomDescontoRouter.post(
  '/',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  cupomDescontoController.criarCupom,
);

/**
 * @swagger
 * /cupons/{id}:
 *   put: # Ou PATCH
 *     summary: Atualiza um cupom de desconto existente (Admin)
 *     tags: [Cupons de Desconto (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/cupomIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarCupomDesconto'
 *     responses:
 *       200:
 *         description: Cupom atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CupomDesconto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError' # Código duplicado ou dados inválidos
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
cupomDescontoRouter.put(
  '/:id',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  cupomDescontoController.atualizarCupom,
);

/**
 * @swagger
 * /cupons/{id}:
 *   delete:
 *     summary: Deleta um cupom de desconto (Admin)
 *     description: Use com cautela. Prefira desativar se o cupom já foi usado.
 *     tags: [Cupons de Desconto (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/cupomIdPathParam'
 *     responses:
 *       204:
 *         description: Cupom deletado com sucesso.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
cupomDescontoRouter.delete(
  '/:id',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  cupomDescontoController.deletarCupom,
);

// -----------------------------------------------------------------------------
// ROTA DE VALIDAÇÃO (USO PELO CLIENTE)
// -----------------------------------------------------------------------------

/**
 * @swagger
 * /cupons/validar:
 *   post:
 *     summary: Valida um código de cupom para uso no carrinho/checkout
 *     tags: [Cupons de Desconto]
 *     security:
 *       - bearerAuth: [] # Provavelmente requer autenticação do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidacaoCupomRequest'
 *     responses:
 *       200:
 *         description: Resultado da validação (pode ser válido ou inválido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidacaoCupomResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError' # Código do cupom não fornecido
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
cupomDescontoRouter.post(
  '/validar',
  cupomDescontoController.verificarValidadeCupom,
);

export default cupomDescontoRouter;
