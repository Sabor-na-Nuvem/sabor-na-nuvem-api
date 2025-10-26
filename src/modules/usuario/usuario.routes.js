import express from 'express';
import usuarioController from './usuario.controller.js';

const usuarioRouter = express.Router();

// --- ROTAS PÚBLICAS ---
// --- (/api/usuario/) ---

// POST / -> Cria um novo usuário
usuarioRouter.post('/', usuarioController.criarUsuario);

/*
  ROTAS PARA USUARIO LOGADO (/me)
  TODO: Adicionar autenticação
*/
// GET / -> Busca os dados do usuário logado
usuarioRouter.get(
  '/me',
  /* authenticate, */ usuarioController.buscarUsuarioLogado,
);

// GET / -> Busca os cupons do usuário logado
usuarioRouter.get(
  '/me/cupons',
  /* authenticate, */ usuarioController.buscarCuponsDoUsuarioLogado,
);

// PATCH / -> Atualiza um usuário logado
usuarioRouter.patch('/me', usuarioController.atualizarUsuarioLogado);

// DELETE / -> Deleta um usuário logado
usuarioRouter.delete('/me', usuarioController.deletarUsuarioLogado);

/*
  ROTAS PARA ADMIN
  TODO: Adicionar autenticação
*/
// GET / -> Busca lista de usuários (filtro opcional de nome ou email)
usuarioRouter.get(
  '/',
  /* authenticate, authorizeAdmin, */ usuarioController.buscarTodosOsUsuarios,
);

// GET / -> Busca um usuário pelo Id
usuarioRouter.get(
  '/:id',
  /* authenticate, authorizeAdmin, */ usuarioController.buscarUsuarioPorId,
);

// PATCH / -> Rota separada para ADMIN atualizar QUALQUER usuário
usuarioRouter.patch(
  '/:id',
  /* authenticate, authorizeAdmin, */ usuarioController.atualizarUsuarioPorId,
);

// DELETE / -> Rota separada para ADMIN deletar QUALQUER usuário
usuarioRouter.delete(
  '/:id',
  /* authenticate, authorizeAdmin, */ usuarioController.deletarUsuarioPorId,
);

export default usuarioRouter;
