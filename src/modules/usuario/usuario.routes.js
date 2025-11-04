import express from 'express';
import usuarioController from './usuario.controller.js';

// --- Importação dos Roteadores Filhos ---
import carrinhoRouter from '../carrinho/carrinho.routes.js';
import enderecoRouter from '../endereco/endereco.routes.js';
import telefoneRouter from '../telefone/telefone.routes.js';

// --- Importação do Auth (da nossa nova config) ---
import { authMiddleware, RoleUsuario } from '../../config/authModule.js';
// --- Importação do Middleware Customizado ---
import { authorizeSelfOrAdmin } from '../../middlewares/authorization.js';

const usuarioRouter = express.Router();

/*
 *==================================
 * ROTAS /me (CLIENTE LOGADO)
 * Proteção: `ensureAuthenticated`
 *==================================
 */

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Busca os dados do usuário autenticado
 *     tags: [Usuarios (Meu Perfil)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário logado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.get('/me', usuarioController.buscarUsuarioLogado);

/**
 * @swagger
 * /usuarios/me/cupons:
 *   get:
 *     summary: Busca os cupons ativos do usuário autenticado
 *     tags: [Usuarios (Meu Perfil)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cupons do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CupomDesconto'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.get('/me/cupons', usuarioController.buscarCuponsDoUsuarioLogado);

/**
 * @swagger
 * /usuarios/me/relatorio:
 *   get:
 *     summary: Busca o relatório de gastos do usuário autenticado
 *     tags: [Usuarios (Meu Perfil)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do relatório do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioUsuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: 'Relatório não encontrado.'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.get(
  '/me/relatorio',
  usuarioController.buscarRelatorioDoUsuarioLogado,
);

/**
 * @swagger
 * /usuarios/me:
 *   patch:
 *     summary: Atualiza (parcialmente) os dados do usuário autenticado
 *     tags: [Usuarios (Meu Perfil)]
 *     description: Permite atualizar campos como 'nome'. Outros são bloqueados.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarUsuarioLogadoInput'
 *     responses:
 *       200:
 *         description: Usuário atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.patch('/me', usuarioController.atualizarUsuarioLogado);

/**
 * @swagger
 * /usuarios/me:
 *   delete:
 *     summary: Deleta a conta do usuário autenticado
 *     tags: [Usuarios (Meu Perfil)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Usuário deletado com sucesso.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.delete('/me', usuarioController.deletarUsuarioLogado);

/*
 *=================================================
 * ROTAS / (ADMIN)
 * Proteção: `ensureAuthenticated` + `ensureRole`
 *=================================================
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários (Admin)
 *     tags: [Usuarios (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioNomeQueryParam'
 *       - $ref: '#/components/parameters/usuarioEmailQueryParam'
 *       - $ref: '#/components/parameters/usuarioCargoQueryParam'
 *       # TODO: Add pagination params refs
 *     responses:
 *       200:
 *         description: Lista de usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.get(
  '/',
  authMiddleware.ensureRole([RoleUsuario.ADMIN, RoleUsuario.FUNCIONARIO]),
  usuarioController.buscarTodosOsUsuarios,
);

/**
 * @swagger
 * /usuarios/{id}/relatorio:
 *   get:
 *     summary: Busca o relatório de um usuário específico pelo ID (Admin)
 *     tags: [Usuarios (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userIdPathParam'
 *     responses:
 *       200:
 *         description: Dados do relatório do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioUsuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: 'Usuário ou Relatório não encontrado.'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.get(
  '/:id/relatorio',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  usuarioController.buscarRelatorioDoUsuarioPorId,
);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Busca um usuário específico pelo ID (Admin)
 *     tags: [Usuarios (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.get(
  '/:id',
  authMiddleware.ensureRole([RoleUsuario.ADMIN, RoleUsuario.FUNCIONARIO]),
  usuarioController.buscarUsuarioPorId,
);

/**
 * @swagger
 * /usuarios/{id}:
 *   patch:
 *     summary: Atualiza (parcialmente) um usuário específico pelo ID (Admin)
 *     tags: [Usuarios (Admin)]
 *     description: Permite atualizar nome, cargo, associação com loja. Email não é atualizado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarUsuarioAdminInput'
 *     responses:
 *       200:
 *         description: Usuário atualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.patch(
  '/:id',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  usuarioController.atualizarUsuarioPorId,
);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Deleta um usuário específico pelo ID (Admin)
 *     tags: [Usuarios (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *     responses:
 *       204:
 *         description: Usuário deletado com sucesso.
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Não é possível deletar (usuário tem pedidos associados, por exemplo).
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usuarioRouter.delete(
  '/:id',
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  usuarioController.deletarUsuarioPorId,
);

// --- Montagem Aninhada (Nível 2) ---

// Monta o router de Carrinho sob o usuário logado
// Path: /api/usuarios/me/carrinho
usuarioRouter.use('/me/carrinho', carrinhoRouter);

// Monta o router de Endereço sob um usuário específico
// Path: /api/usuarios/:usuarioId/endereco
usuarioRouter.use('/:usuarioId/endereco', authorizeSelfOrAdmin, enderecoRouter);

// Monta o router de Telefone sob um usuário específico
// Path: /api/usuarios/:usuarioId/telefones
usuarioRouter.use(
  '/:usuarioId/telefones',
  authorizeSelfOrAdmin,
  telefoneRouter,
);

export default usuarioRouter;
