import express from 'express';
import cors from 'cors';

// --- IMPORTAÇÃO DE AUTH ---
import { RoleUsuario } from '@prisma/client';

// --- IMPORTAÇÃO DO SWAGGER ---
import swaggerUi from 'swagger-ui-express';

// --- IMPORTAÇÃO DE CONFIGS ---
import swaggerSpec from './config/swagger.js';
import { authRoutes, authMiddleware } from './config/authModule.js';

// --- IMPORTAÇÃO DE MIDDLEWARES ---
import { authLimiter } from './middlewares/rateLimiter.js';

// --- IMPORTAÇÃO DAS ROTAS ---
import lojaRoutes from './modules/loja/loja.routes.js';
import pedidoRoutes from './modules/pedido/pedido.routes.js';
import produtoRoutes from './modules/produto/produto.routes.js';
import usuarioRoutes from './modules/usuario/usuario.routes.js';
import geocodingRouter from './modules/geocoding/geocoding.routes.js';
import cupomDescontoRouter from './modules/cupom-desconto/cupom-desconto.routes.js';
import relatorioRouter from './modules/relatorio-usuario/relatorio-usuario.routes.js';
import categoriaProdutoRouter from './modules/categoria-produto/categoria-produto.routes.js';

// --- CONFIGURAÇÃO DO APP ---
const app = express();
// --- CONFIGURAÇÃO DO CORS ---
app.use(
  cors({
    origin: 'http://localhost:5173', // URL do Frontend
    credentials: true, // IMPORTANTE: Permite enviar/receber Cookies (Refresh Token)
  }),
);
app.use(express.json());

// --- ROTAS AUXILIARES ---

app.get('/api/auth/redirect-success', (req, res) => {
  return res
    .status(200)
    .json({ success: true, message: 'Operação concluída com sucesso.' });
});

app.get('/api/auth/redirect-error', (req, res) => {
  const errorMessage = req.query.error || 'Operação falhou.';
  return res.status(400).json({ success: false, message: errorMessage });
});

// --- ROTAS DA APLICACAO ---

// Rotas de autenticação (ex: /login, /register)
app.use('/api/auth', authLimiter, authRoutes);

// Todas as rotas de usuário, incluindo aninhadas, começam aqui
app.use('/api/usuarios', authMiddleware.ensureAuthenticated, usuarioRoutes);
// Todas as rotas de loja, incluindo aninhadas, começam aqui
app.use('/api/lojas', lojaRoutes);
// Todas as rotas de produto, incluindo aninhadas, começam aqui
app.use('/api/produtos', produtoRoutes);
// Rotas independentes
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/geocoding', geocodingRouter);
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
