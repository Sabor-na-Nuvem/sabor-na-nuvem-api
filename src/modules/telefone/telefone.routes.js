import express from 'express';
import telefoneController from './telefone.controller.js';

const telefoneRouter = express.Router({ mergeParams: true });

// --- ROTAS RELATIVAS AO PAI (/api/usuarios/:usuarioId/telefones ou /api/lojas/:lojaId/telefones) ---

// GET / -> Lista todos os telefones do pai
telefoneRouter.get('/', telefoneController.listarTelefonesDoPai);

// GET /:telefoneId -> Busca um telefone específico do pai
telefoneRouter.get('/:telefoneId', telefoneController.buscarTelefoneDoPaiPorId);

// POST / -> Adiciona um novo telefone ao pai
telefoneRouter.post('/', telefoneController.adicionarTelefoneAoPai);

// PUT /:telefoneId -> Atualiza um telefone específico do pai
telefoneRouter.put('/:telefoneId', telefoneController.atualizarTelefoneDoPai);

// DELETE /:telefoneId -> Deleta um telefone específico do pai
telefoneRouter.delete('/:telefoneId', telefoneController.deletarTelefoneDoPai);

export default telefoneRouter;
