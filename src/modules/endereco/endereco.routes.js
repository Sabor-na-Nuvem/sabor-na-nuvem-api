import express from 'express';
import enderecoController from './endereco.controller.js';

const enderecoRouter = express.Router({ mergeParams: true });

// --- NOTA: Os paths completos dependem de como este router é montado no index.js ---
// Ex: Se montado como '/api/usuarios/:usuarioId/endereco', o path aqui é '/'
// Ex: Se montado como '/api/lojas/:lojaId/endereco', o path aqui também é '/'

/**
 * @swagger
 * /usuarios/{usuarioId}/endereco:
 *   get:
 *     summary: Busca o endereço associado a um usuário
 *     tags: [Enderecos (Usuario)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *     responses:
 *       200:
 *         description: Dados do endereço do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Usuário ou Endereço não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /lojas/{lojaId}/endereco:
 *   get:
 *     summary: Busca o endereço associado a uma loja
 *     tags: [Enderecos (Loja)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *     responses:
 *       200:
 *         description: Dados do endereço da loja.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou Endereço não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
enderecoRouter.get('/', enderecoController.buscarEnderecoDoPai);

/**
 * @swagger
 * /usuarios/{usuarioId}/endereco:
 *   post:
 *     summary: Cria e associa um novo endereço a um usuário
 *     tags: [Enderecos (Usuario)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoEndereco'
 *     responses:
 *       201:
 *         description: Endereço criado e associado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou usuário já possui endereço.
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
 * /lojas/{lojaId}/endereco:
 *   post:
 *     summary: Cria e associa um novo endereço a uma loja
 *     tags: [Enderecos (Loja)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoEndereco'
 *     responses:
 *       201:
 *         description: Endereço criado e associado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou loja já possui endereço.
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
enderecoRouter.post('/', enderecoController.criarEnderecoParaPai);

/**
 * @swagger
 * /usuarios/{usuarioId}/endereco:
 *   put:
 *     summary: Atualiza o endereço associado a um usuário
 *     tags: [Enderecos (Usuario)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarEndereco'
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Usuário ou endereço associado não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /lojas/{lojaId}/endereco:
 *   put:
 *     summary: Atualiza o endereço associado a uma loja
 *     tags: [Enderecos (Loja)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarEndereco'
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja ou endereço associado não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
enderecoRouter.put('/', enderecoController.atualizarEnderecoDoPai);

/**
 * @swagger
 * /usuarios/{usuarioId}/endereco:
 *   delete:
 *     summary: Desassocia (e deleta, se possível) o endereço de um usuário
 *     tags: [Enderecos (Usuario)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/usuarioIdPathParamNested'
 *     responses:
 *       204:
 *         description: Endereço desassociado/deletado com sucesso.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Usuário ou endereço associado não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /lojas/{lojaId}/endereco:
 *   delete:
 *     summary: Operação não permitida - Endereço de loja é obrigatório
 *     tags: [Enderecos (Loja)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/lojaIdPathParamNested'
 *     responses:
 *       400:
 *         description: Não é possível deletar o endereço de uma loja.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
enderecoRouter.delete('/', enderecoController.deletarEnderecoDoPai);

export default enderecoRouter;
