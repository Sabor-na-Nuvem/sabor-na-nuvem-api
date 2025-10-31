import express from 'express';
import telefoneController from './telefone.controller.js';

const telefoneRouter = express.Router({ mergeParams: true });

// --- NOTA: Paths duplicados para documentar ambos os contextos (Usuário e Loja) ---

/**
 * @swagger
 * /usuarios/{usuarioId}/telefones:
 *   get:
 *     summary: Lista todos os telefones de um usuário
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *     responses:
 *       200:
 *         description: Lista de telefones do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Telefone'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Usuário não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /lojas/{lojaId}/telefones:
 *   get:
 *     summary: Lista todos os telefones de uma loja
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *     responses:
 *       200:
 *         description: Lista de telefones da loja.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Telefone'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja não encontrada.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
telefoneRouter.get('/', telefoneController.listarTelefonesDoPai);

/**
 * @swagger
 * /usuarios/{usuarioId}/telefones/{telefoneId}:
 *   get:
 *     summary: Busca um telefone específico de um usuário
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *       - $ref: '#/components/parameters/telefoneIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do telefone.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Telefone'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Usuário ou telefone não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /lojas/{lojaId}/telefones/{telefoneId}:
 *   get:
 *     summary: Busca um telefone específico de uma loja
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/telefoneIdPathParam'
 *     responses:
 *       200:
 *         description: Detalhes do telefone.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Telefone'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou telefone não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
telefoneRouter.get('/:telefoneId', telefoneController.buscarTelefoneDoPaiPorId);

/**
 * @swagger
 * /usuarios/{usuarioId}/telefones:
 *   post:
 *     summary: Adiciona um novo telefone a um usuário
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoTelefone'
 *     responses:
 *       201:
 *         description: Telefone adicionado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Telefone'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou telefone já existe.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Usuário não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /lojas/{lojaId}/telefones:
 *   post:
 *     summary: Adiciona um novo telefone a uma loja
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoTelefone'
 *     responses:
 *       201:
 *         description: Telefone adicionado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Telefone'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou telefone já existe.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja não encontrada.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
telefoneRouter.post('/', telefoneController.adicionarTelefoneAoPai);

/**
 * @swagger
 * /usuarios/{usuarioId}/telefones/{telefoneId}:
 *   put: # Ou PATCH
 *     summary: Atualiza um telefone específico de um usuário
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *       - $ref: '#/components/parameters/telefoneIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarTelefone'
 *     responses:
 *       200:
 *         description: Telefone atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Telefone'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou telefone já existe para outro registro.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Usuário ou telefone não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /lojas/{lojaId}/telefones/{telefoneId}:
 *   put: # Ou PATCH
 *     summary: Atualiza um telefone específico de uma loja
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/telefoneIdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarTelefone'
 *     responses:
 *       200:
 *         description: Telefone atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Telefone'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou telefone já existe para outro registro.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou telefone não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
telefoneRouter.put('/:telefoneId', telefoneController.atualizarTelefoneDoPai);

/**
 * @swagger
 * /usuarios/{usuarioId}/telefones/{telefoneId}:
 *   delete:
 *     summary: Deleta um telefone específico de um usuário
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *       - $ref: '#/components/parameters/telefoneIdPathParam'
 *     responses:
 *       204:
 *         description: Telefone deletado com sucesso.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Usuário ou telefone não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /lojas/{lojaId}/telefones/{telefoneId}:
 *   delete:
 *     summary: Deleta um telefone específico de uma loja
 *     tags: [Telefones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *       - $ref: '#/components/parameters/telefoneIdPathParam'
 *     responses:
 *       204:
 *         description: Telefone deletado com sucesso.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou telefone não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
telefoneRouter.delete('/:telefoneId', telefoneController.deletarTelefoneDoPai);

export default telefoneRouter;
