import express from 'express';
import modificadorEmLojaController from './modificador-em-loja.controller.js';

const modificadorEmLojaRouter = express.Router({ mergeParams: true });

// --- ROTAS ANINHADAS SOB /api/lojas/:lojaId/modificadores-loja ---
// O prefixo será definido no index.js ou loja.routes.js

modificadorEmLojaRouter.get(
  '/',
  modificadorEmLojaController.listarModificadoresDaLoja,
);

modificadorEmLojaRouter.get(
  '/:modificadorId',
  modificadorEmLojaController.buscarModificadorNaLoja,
);

modificadorEmLojaRouter.post(
  '/',
  /* authenticate, authorizeAdminOrStoreOwner, */ modificadorEmLojaController.adicionarModificadorEmLoja,
);

modificadorEmLojaRouter.put(
  '/:modificadorId',
  /* authenticate, authorizeAdminOrStoreOwner, */
  modificadorEmLojaController.atualizarModificadorNaLoja,
);

modificadorEmLojaRouter.delete(
  '/:modificadorId',
  /* authenticate, authorizeAdminOrStoreOwner, */
  modificadorEmLojaController.deletarModificadorDaLoja,
);

export default modificadorEmLojaRouter;
