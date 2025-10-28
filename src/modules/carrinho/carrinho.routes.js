import express from 'express';
import carrinhoController from './carrinho.controller.js';
import itemCarrinhoRouter from '../item-carrinho/item-carrinho.routes.js';

const carrinhoRouter = express.Router({ mergeParams: true });

// TODO: Aplicar autenticação a todas as rotas do carrinho
// carrinhoRouter.use(authenticate);

// --- Rotas que agem sobre o CARRINHO em si ---
// O path base é /api/usuarios/me/carrinho (definido no usuario.routes.js)

/**
 * @swagger
 * /usuarios/me/carrinho:
 *   get:
 *     summary: Busca o carrinho completo do usuário autenticado
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Retorna o carrinho completo do usuário, com itens, modificadores e subtotal calculado.
 *       Se o carrinho não existir no banco (usuário nunca adicionou um item), retorna um objeto de carrinho vazio padrão.
 *     responses:
 *       200:
 *         description: O carrinho completo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarrinhoCompleto'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
carrinhoRouter.get('/', carrinhoController.buscarCarrinhoCompleto);

/**
 * @swagger
 * /usuarios/me/carrinho:
 *   patch:
 *     summary: Atualiza propriedades do carrinho (tipo ou loja)
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Atualiza o tipo de pedido (ENTREGA/RETIRADA) ou a loja associada.
 *       **ATENÇÃO:** Mudar a `lojaId` para uma loja diferente da atual revalidará todos os itens e modificadores.
 *       Itens indisponíveis ou com opções obrigatórias indisponíveis na nova loja serão ajustados ou removidos.
 *       Esta rota também cria o carrinho (`upsert`) se for a primeira interação (ex: primeira vez definindo a lojaId).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarCarrinhoInput'
 *     responses:
 *       200:
 *         description: Carrinho atualizado. A resposta inclui o carrinho final e avisos sobre ajustes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AtualizarCarrinhoResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *         description: Dados inválidos ou lojaId obrigatória não fornecida na criação.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Loja (lojaId) não encontrada.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
carrinhoRouter.patch('/', carrinhoController.atualizarCarrinho);

/**
 * @swagger
 * /usuarios/me/carrinho:
 *   delete:
 *     summary: Limpa todos os itens do carrinho do usuário
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Remove todos os itens (e seus modificadores) do carrinho, mas preserva o registro 'Carrinho'
 *       (mantendo a lojaId e tipo selecionados).
 *     responses:
 *       204:
 *         description: Carrinho limpo com sucesso.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *         description: Carrinho não encontrado.
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
carrinhoRouter.delete('/', carrinhoController.limparCarrinho);

// --- Monta o router de ITENS aninhado ---
// A documentação para /api/usuarios/me/carrinho/itens/*
// estará em item-carrinho.routes.js
carrinhoRouter.use('/itens', itemCarrinhoRouter);

export default carrinhoRouter;
