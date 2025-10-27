import express from 'express';
import personalizavelController from './personalizavel.controller.js';

const personalizavelRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Personalizavel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do grupo de personalização.
 *         nome:
 *           type: string
 *           description: Nome do grupo (ex: Adicionais, Ponto da Carne).
 *         produtoId:
 *           type: integer
 *           description: ID do produto ao qual pertence.
 *         selecaoMinima:
 *           type: integer
 *           description: Mínimo de opções que devem ser selecionadas.
 *         selecaoMaxima:
 *           type: integer
 *           description: Máximo de opções que podem ser selecionadas.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         nome: "Adicionais"
 *         produtoId: 10
 *         selecaoMinima: 0
 *         selecaoMaxima: 3
 *         createdAt: "2025-10-27T10:00:00Z"
 *         updatedAt: "2025-10-27T10:00:00Z"
 *
 *     NovoPersonalizavel:
 *       type: object
 *       required:
 *         - nome
 *         - selecaoMinima
 *         - selecaoMaxima
 *       properties:
 *         nome:
 *           type: string
 *         selecaoMinima:
 *           type: integer
 *         selecaoMaxima:
 *           type: integer
 *       example:
 *         nome: "Molhos Extras"
 *         selecaoMinima: 0
 *         selecaoMaxima: 2
 *
 *     AtualizarPersonalizavel:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *         selecaoMinima:
 *           type: integer
 *         selecaoMaxima:
 *           type: integer
 *       example:
 *         nome: "Molhos Especiais"
 *         selecaoMaxima: 1
 */

/**
 * @swagger
 * tags:
 *   - name: Produtos - Personalização
 *     description: Gerenciamento dos grupos de personalização de produtos
 */

// --- ROTAS RELATIVAS AO PRODUTO PAI ---
// O prefixo /api/produtos/:produtoId/personalizaveis é aplicado no produto.routes.js

/**
 * @swagger
 * /api/produtos/{produtoId}/personalizaveis:
 *   get:
 *     summary: Lista todos os grupos de personalização de um produto
 *     tags: [Produtos - Personalização]
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do produto pai
 *     responses:
 *       200:
 *         description: Lista dos grupos de personalização.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Personalizavel'
 *       404:
 *         description: Produto pai não encontrado.
 */
personalizavelRouter.get(
  '/',
  personalizavelController.listarPersonalizaveisDoProduto,
);

/**
 * @swagger
 * /api/produtos/{produtoId}/personalizaveis/{personalizavelId}:
 *   get:
 *     summary: Busca detalhes de um grupo de personalização específico
 *     tags: [Produtos - Personalização]
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do produto pai
 *       - in: path
 *         name: personalizavelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do grupo de personalização
 *     responses:
 *       200:
 *         description: Detalhes do grupo de personalização.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personalizavel' # Pode incluir Modificadores aqui
 *       404:
 *         description: Produto pai ou grupo de personalização não encontrado.
 */
personalizavelRouter.get(
  '/:personalizavelId',
  personalizavelController.buscarPersonalizavelPorId,
);

/**
 * @swagger
 * /api/produtos/{produtoId}/personalizaveis:
 *   post:
 *     summary: Cria um novo grupo de personalização para um produto
 *     tags: [Produtos - Personalização]
 *     security:
 *       - bearerAuth: [] # TODO: Adicionar segurança real
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do produto pai
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoPersonalizavel'
 *     responses:
 *       201:
 *         description: Grupo de personalização criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personalizavel'
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autenticado.
 *       403:
 *         description: Não autorizado.
 *       404:
 *         description: Produto pai não encontrado.
 */
personalizavelRouter.post(
  '/',
  /* authenticate, authorizeAdmin, */
  personalizavelController.criarPersonalizavelParaProduto,
);

/**
 * @swagger
 * /api/produtos/{produtoId}/personalizaveis/{personalizavelId}:
 *   patch:
 *     summary: Atualiza (parcialmente) um grupo de personalização
 *     tags: [Produtos - Personalização]
 *     security:
 *       - bearerAuth: [] # TODO: Adicionar segurança real
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do produto pai
 *       - in: path
 *         name: personalizavelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do grupo de personalização a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarPersonalizavel'
 *     responses:
 *       200:
 *         description: Grupo atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personalizavel'
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autenticado.
 *       403:
 *         description: Não autorizado.
 *       404:
 *         description: Produto pai ou grupo de personalização não encontrado.
 */
personalizavelRouter.patch(
  '/:personalizavelId',
  /* authenticate, authorizeAdmin, */
  personalizavelController.atualizarPersonalizavel,
);

/**
 * @swagger
 * /api/produtos/{produtoId}/personalizaveis/{personalizavelId}:
 *   delete:
 *     summary: Deleta um grupo de personalização
 *     tags: [Produtos - Personalização]
 *     security:
 *       - bearerAuth: [] # TODO: Adicionar segurança real
 *     parameters:
 *       - in: path
 *         name: produtoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do produto pai
 *       - in: path
 *         name: personalizavelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do grupo de personalização a ser deletado
 *     responses:
 *       204:
 *         description: Grupo deletado com sucesso.
 *       401:
 *         description: Não autenticado.
 *       403:
 *         description: Não autorizado.
 *       404:
 *         description: Produto pai ou grupo de personalização não encontrado.
 */
personalizavelRouter.delete(
  '/:personalizavelId',
  /* authenticate, authorizeAdmin, */
  personalizavelController.deletarPersonalizavel,
);

export default personalizavelRouter;
