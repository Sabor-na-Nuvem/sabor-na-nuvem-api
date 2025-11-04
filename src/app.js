import express from 'express';

// --- IMPORTAÇÃO DE AUTH ---
import { RoleUsuario } from '@prisma/client';

// --- IMPORTAÇÃO DO SWAGGER ---
import swaggerUi from 'swagger-ui-express';

// --- IMPORTAÇÃO DE CONFIGS ---
import swaggerSpec from './config/swagger.js';
import { authRoutes, authMiddleware } from './config/authModule.js';

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

// --- ROTAS DA APLICACAO ---

// Rotas de autenticação (ex: /login, /register)
app.use('/api/auth', authRoutes);

// Todas as rotas de usuário, incluindo aninhadas, começam aqui
app.use('/api/usuarios', authMiddleware.ensureAuthenticated, usuarioRoutes);
// Todas as rotas de loja, incluindo aninhadas, começam aqui
app.use('/api/lojas', lojaRoutes);
// Todas as rotas de produto, incluindo aninhadas, começam aqui
app.use('/api/produtos', produtoRoutes);
// Rotas independentes
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/cupons', authMiddleware.ensureAuthenticated, cupomDescontoRouter);
app.use(
  '/api/relatorios',
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureRole([RoleUsuario.ADMIN]),
  relatorioRouter,
);
app.use('/api/categorias-produto', categoriaProdutoRouter);

// --- ROTA DA DOCUMENTACAO SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
