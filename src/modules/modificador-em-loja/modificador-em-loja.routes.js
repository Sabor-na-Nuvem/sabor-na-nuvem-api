import express from 'express';
import modificadorEmLojaController from './modificador-em-loja.controller.js';

// --- Importação do Auth ---
import { authMiddleware, RoleUsuario } from '../../config/authModule.js';
// --- Importação do Middleware Customizado ---
import { authorizeAdminOrStoreOwner } from '../../middlewares/authorization.js';

const modificadorEmLojaRouter = express.Router({ mergeParams: true });

// --- ROTAS ANINHADAS SOB /api/lojas/:lojaId/modificadores-loja ---
// O prefixo será definido no index.js ou loja.routes.js

/*
 *==================================
 * ROTAS PÚBLICAS (CLIENTE/VISITANTE)
 *==================================
 */

/**
 * @swagger
 * /lojas/{lojaId}/modificadores-loja:
 *   get:
 *     summary: Lista todos os modificadores (opções) disponíveis para uma loja específica
 *     tags: [Modificador Em Loja]
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/disponivelQueryParam'
 *     # TODO: Add pagination parameters? Filter by personalizavel group?
 *     responses:
 *       200:
 *         description: Lista de modificadores da loja com seus detalhes (preço, disponibilidade, nome).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ModificadorEmLojaDetalhado'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja não encontrada.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorEmLojaRouter.get(
  '/',
  modificadorEmLojaController.listarModificadoresDaLoja,
);

/**
 * @swagger
 * /lojas/{lojaId}/modificadores-loja/{modificadorId}:
 *   get:
 *     summary: Busca os detalhes de um modificador específico em uma loja específica
 *     tags: [Modificador Em Loja]
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/modificadorIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do modificador na loja.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModificadorEmLojaDetalhado'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Modificador não encontrado nesta loja.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorEmLojaRouter.get(
  '/:modificadorId',
  modificadorEmLojaController.buscarModificadorNaLoja,
);

/*
 *==================================
 * ROTAS PROTEGIDAS (ADMIN / FUNCIONARIO)
 *==================================
 */

/**
 * @swagger
 * /lojas/{lojaId}/modificadores-loja:
 *   post:
 *     summary: Adiciona ou define a disponibilidade/preço de um modificador para uma loja (Admin/Dono da Loja)
 *     tags: [Modificador Em Loja (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoModificadorEmLojaInput'
 *     responses:
 *       201:
 *         description: Modificador adicionado/configurado na loja com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModificadorEmLoja'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou modificador já existe na loja.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Modificador base não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorEmLojaRouter.post(
  '/',
  authMiddleware.ensureAuthenticated,
  authorizeAdminOrStoreOwner,
  modificadorEmLojaController.adicionarModificadorEmLoja,
);

/**
 * @swagger
 * /lojas/{lojaId}/modificadores-loja/{modificadorId}:
 *   put:
 *     summary: Atualiza os detalhes de um modificador em uma loja (disponibilidade, preço) (Admin/Dono da Loja)
 *     tags: [Modificador Em Loja (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/modificadorIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarModificadorEmLojaInput'
 *     responses:
 *       200:
 *         description: Detalhes atualizados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModificadorEmLoja'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Modificador não encontrado nesta loja.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorEmLojaRouter.put(
  '/:modificadorId',
  authMiddleware.ensureAuthenticated,
  authorizeAdminOrStoreOwner,
  modificadorEmLojaController.atualizarModificadorNaLoja,
);

/**
 * @swagger
 * /lojas/{lojaId}/modificadores-loja/{modificadorId}:
 *   delete:
 *     summary: Remove a configuração de um modificador de uma loja (Admin/Dono da Loja)
 *     description: Remove a entrada da tabela ModificadorEmLoja, fazendo com que a opção não apareça mais no cardápio desta loja.
 *     tags: [Modificador Em Loja (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/modificadorIdPathParam'
 *     responses:
 *       204:
 *         description: Modificador removido da loja com sucesso.
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Modificador não encontrado nesta loja.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
modificadorEmLojaRouter.delete(
  '/:modificadorId',
  authMiddleware.ensureAuthenticated,
  authorizeAdminOrStoreOwner,
  modificadorEmLojaController.deletarModificadorDaLoja,
);

export default modificadorEmLojaRouter;
