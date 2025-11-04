import { RoleUsuario } from '../config/authModule.js';

/**
 * Middleware de AUTORIZAÇÃO.
 * Verifica se o usuário logado é o funcionário da loja que está tentando acessar
 * OU se é um Administrador.
 *
 * Deve ser usado APÓS o `authMiddleware.ensureAuthenticated`.
 */
export const authorizeAdminOrStoreOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message:
        'Usuário não autenticado. Este middleware deve ser usado após ensureAuthenticated.',
    });
  }

  const { cargo, funcionarioLojaId } = req.user;

  const lojaIdParam = req.params.id || req.params.lojaId;

  if (!lojaIdParam) {
    return res.status(500).json({
      message:
        'Erro de configuração de rota: ID da loja não encontrado nos parâmetros.',
    });
  }

  if (cargo === RoleUsuario.ADMIN) {
    return next();
  }

  if (
    cargo === RoleUsuario.FUNCIONARIO &&
    funcionarioLojaId === Number(lojaIdParam)
  ) {
    return next();
  }

  return res.status(403).json({
    message: 'Acesso negado. Você não tem permissão para gerenciar esta loja.',
  });
};

/**
 * Middleware de AUTORIZAÇÃO.
 * Verifica se o usuário logado é o dono do recurso (ex: seu próprio perfil, endereço)
 * OU se é um Administrador.
 *
 * Deve ser usado APÓS o `authMiddleware.ensureAuthenticated`.
 */
export const authorizeSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message:
        'Usuário não autenticado. Este middleware deve ser usado após ensureAuthenticated.',
    });
  }

  const { cargo, id: userId } = req.user;
  const usuarioIdParam = req.params.id || req.params.usuarioId;

  if (!usuarioIdParam) {
    return res.status(500).json({
      message:
        'Erro de configuração de rota: ID do usuário não encontrado nos parâmetros.',
    });
  }

  if (cargo === RoleUsuario.ADMIN) {
    return next();
  }

  if (userId === usuarioIdParam) {
    return next();
  }

  return res.status(403).json({
    message: 'Acesso negado. Você só pode gerenciar seus próprios recursos.',
  });
};
