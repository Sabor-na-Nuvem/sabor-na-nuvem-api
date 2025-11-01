import express from 'express';
import modificadorController from './modificador.controller.js';

// --- Importação do Auth ---
import { authMiddleware, RoleUsuario } from '../../config/authModule.js';

const modificadorRouter = express.Router({ mergeParams: true });

// --- ROTAS RELATIVAS AO PERSONALIZAVEL PAI ---
// Prefixo: /api/produtos/:produtoId/personalizaveis/:personalizavelId/modificadores

/*
 *==================================
 * ROTAS PÚBLICAS (CLIENTE/VISITANTE)
 *==================================
 */

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}/modificadores:
 *   get:
 *     summary: Lista todos os modificadores (opções) de um grupo de personalização
 *     tags: [Produtos - Modificadores]
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/personalizavelIdPathParamNested'
 *     responses:
 *       200:
 *         description: Lista de modificadores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Modificador'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Produto ou Grupo de Personalização não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorRouter.get(
  '/',
  modificadorController.listarModificadoresDoPersonalizavel,
);

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}/modificadores/{modificadorId}:
 *   get:
 *     summary: Busca um modificador específico pelo ID
 *     tags: [Produtos - Modificadores]
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/personalizavelIdPathParamNested'
 *       - $ref: '#/components/parameters/modificadorIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do modificador.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modificador'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Recurso (Produto, Personalizavel ou Modificador) não encontrado no contexto.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorRouter.get(
  '/:modificadorId',
  modificadorController.buscarModificadorPorId,
);

/*
 *==================================
 * ROTAS ADMINISTRATIVAS (ADMIN)
 * Proteção: ensureAuthenticated + ensureRole(ADMIN)
 *==================================
 */

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}/modificadores:
 *   post:
 *     summary: Cria um novo modificador (opção) para um grupo de personalização (Admin)
 *     tags: [Produtos - Modificadores (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/personalizavelIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoModificadorInput'
 *     responses:
 *       201:
 *         description: Modificador criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modificador'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Produto ou Grupo de Personalização não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorRouter.post(
  '/',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  modificadorController.criarModificador,
);

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}/modificadores/{modificadorId}:
 *   patch:
 *     summary: Atualiza (parcialmente) um modificador (Admin)
 *     tags: [Produtos - Modificadores (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/personalizavelIdPathParamNested'
 *       - $ref: '#/components/parameters/modificadorIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarModificadorInput'
 *     responses:
 *       200:
 *         description: Modificador atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modificador'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Recurso (Produto, Personalizavel ou Modificador) não encontrado no contexto.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorRouter.patch(
  '/:modificadorId',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  modificadorController.atualizarModificador,
);

/**
 * @swagger
 * /produtos/{produtoId}/personalizaveis/{personalizavelId}/modificadores/{modificadorId}:
 *   delete:
 *     summary: Deleta um modificador (Admin)
 *     description: ATENÇÃO - Pode deletar entradas em ModificadorEmLoja se onDelete=Cascade estiver configurado.
 *     tags: [Produtos - Modificadores (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/produtoIdPathParamNested'
 *       - $ref: '#/components/parameters/personalizavelIdPathParamNested'
 *       - $ref: '#/components/parameters/modificadorIdPathParam'
 *     responses:
 *       204:
 *         description: Modificador deletado com sucesso.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Recurso (Produto, Personalizavel ou Modificador) não encontrado no contexto.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorRouter.delete(
  '/:modificadorId',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  modificadorController.deletarModificador,
);

export default modificadorRouter;
