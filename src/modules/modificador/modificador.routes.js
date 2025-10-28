import express from 'express';
import modificadorController from './modificador.controller.js';

const modificadorRouter = express.Router({ mergeParams: true });

// --- ROTAS RELATIVAS AO PERSONALIZAVEL PAI ---
// Prefixo: /api/produtos/:produtoId/personalizaveis/:personalizavelId/modificadores

// POST / -> Cria um Modificador neste grupo Personalizavel
modificadorRouter.post(
  '/',
  /* authenticate, authorizeAdmin, */ modificadorController.criarModificador,
);

// GET / -> Lista todos os Modificadores deste grupo Personalizavel
modificadorRouter.get(
  '/',
  modificadorController.listarModificadoresDoPersonalizavel,
);

// GET /:modificadorId -> Busca um Modificador específico
modificadorRouter.get(
  '/:modificadorId',
  modificadorController.buscarModificadorPorId,
);

// PATCH /:modificadorId -> Atualiza um Modificador específico
modificadorRouter.patch(
  '/:modificadorId',
  /* authenticate, authorizeAdmin, */ modificadorController.atualizarModificador,
);

// DELETE /:modificadorId -> Deleta um Modificador específico
modificadorRouter.delete(
  '/:modificadorId',
  /* authenticate, authorizeAdmin, */ modificadorController.deletarModificador,
);

export default modificadorRouter;
