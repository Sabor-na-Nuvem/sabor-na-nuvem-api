import express from 'express';

// --- IMPORTAÇÃO DE AUTH ---
import { RoleUsuario } from '@prisma/client';

// --- IMPORTAÇÃO DO SWAGGER ---
import swaggerUi from 'swagger-ui-express';

// --- IMPORTAÇÃO DE CONFIGS ---
import swaggerSpec from './config/swagger.js';
import {
  authRoutes,
  authMiddleware as realAuthMiddleware,
} from './config/authModule.js';

// --- IMPORTAÇÃO DAS ROTAS ---
import lojaRoutes from './modules/loja/loja.routes.js';
import pedidoRoutes from './modules/pedido/pedido.routes.js';
import produtoRoutes from './modules/produto/produto.routes.js';
import usuarioRoutes from './modules/usuario/usuario.routes.js';
import cupomDescontoRouter from './modules/cupom-desconto/cupom-desconto.routes.js';
import relatorioRouter from './modules/relatorio-usuario/relatorio-usuario.routes.js';
import categoriaProdutoRouter from './modules/categoria-produto/categoria-produto.routes.js';

// --- CONFIGURAÇÃO DO APP ---
const app = express();
app.use(express.json());

let activeAuthMiddleware = realAuthMiddleware;

// --- INÍCIO DA SEÇÃO DE MOCK DE AUTENTICAÇÃO ---
// Este middleware só será ativado em ambiente de teste
if (process.env.NODE_ENV === 'test') {
  console.log(
    '--- ATENÇÃO: Rodando em modo de TESTE. Mock de Autenticação ATIVADO. ---',
  );

  // 1. Cria um middleware de mock
  const mockEnsureAuthenticated = (req, res, next) => {
    const testUserId = req.headers['x-test-user-id'];
    if (testUserId) {
      // Injeta o objeto 'user'
      req.user = { id: testUserId, cargo: RoleUsuario.CLIENTE }; // Mock como cliente
    }
    // Se o header não existir, ele deixa passar (para testar rotas públicas)
    next();
  };

  const mockEnsureRole = (allowedRoles) => (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'Acesso negado (mock - sem usuário)' });
    }
    if (allowedRoles.includes(req.user.cargo)) {
      return next();
    }
    return res
      .status(403)
      .json({ message: 'Acesso negado (mock - cargo errado)' });
  };

  // 2. SOBRESCREVE o middleware pelo mock
  activeAuthMiddleware = {
    ensureAuthenticated: mockEnsureAuthenticated,
    ensureRole: mockEnsureRole,
  };
}
// --- FIM DA SEÇÃO DE MOCK ---

// --- ROTAS DA APLICACAO ---

// Rotas de autenticação (ex: /login, /register)
app.use('/api/auth', authRoutes);

// Todas as rotas de usuário, incluindo aninhadas, começam aqui
app.use(
  '/api/usuarios',
  activeAuthMiddleware.ensureAuthenticated,
  usuarioRoutes,
);
// Todas as rotas de loja, incluindo aninhadas, começam aqui
app.use('/api/lojas', lojaRoutes);
// Todas as rotas de produto, incluindo aninhadas, começam aqui
app.use('/api/produtos', produtoRoutes);
// Rotas independentes
app.use('/api/pedidos', pedidoRoutes);
app.use(
  '/api/cupons',
  activeAuthMiddleware.ensureAuthenticated,
  cupomDescontoRouter,
);
app.use('/api/relatorios', relatorioRouter);
app.use('/api/categorias-produto', categoriaProdutoRouter);

// --- ROTA DA DOCUMENTACAO SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
