import express from 'express';
import enderecoController from './endereco.controller.js';

const enderecoRouter = express.Router({ mergeParams: true });

// --- ROTAS RELATIVAS AO PAI (/api/usuarios/:usuarioId/endereco ou /api/lojas/:lojaId/endereco) ---

// GET / -> Busca o endereço do pai
enderecoRouter.get('/', enderecoController.buscarEnderecoDoPai);

// POST / -> Cria e associa um novo endereço ao pai
enderecoRouter.post('/', enderecoController.criarEnderecoParaPai);

// PUT / -> Atualiza o endereço do pai
enderecoRouter.put('/', enderecoController.atualizarEnderecoDoPai);

// DELETE / -> Desassocia/Deleta o endereço do pai
enderecoRouter.delete('/', enderecoController.deletarEnderecoDoPai);

export default enderecoRouter;
