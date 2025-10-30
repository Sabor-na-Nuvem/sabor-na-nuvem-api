import express from 'express';

// --- IMPORTAÇÃO DO SWAGGER ---
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// --- IMPORTAÇÃO DAS ROTAS ---
import lojaRoutes from './modules/loja/loja.routes.js';
import pedidoRoutes from './modules/pedido/pedido.routes.js';
import produtoRoutes from './modules/produto/produto.routes.js';
import usuarioRoutes from './modules/usuario/usuario.routes.js';
import cupomDescontoRouter from './modules/cupom-desconto/cupom-desconto.routes.js';
import relatorioRouter from './modules/relatorio-usuario/relatorio-usuario.routes.js';
import categoriaProdutoRouter from './modules/categoria-produto/categoria-produto.routes.js';

const app = express();
app.use(express.json());

// --- INÍCIO DA SEÇÃO DE MOCK DE AUTENTICAÇÃO ---
// Este middleware só será ativado em ambiente de teste
if (process.env.NODE_ENV === 'test') {
  console.log(
    '--- ATENÇÃO: Rodando em modo de TESTE. Mock de Autenticação ATIVADO. ---',
  );
  app.use((req, res, next) => {
    const testUserId = req.headers['x-test-user-id'];
    if (testUserId) {
      // Injeta o objeto 'user' na requisição
      req.user = { id: testUserId };
    }
    next();
  });
}
// --- FIM DA SEÇÃO DE MOCK ---

// --- ROTAS DA APLICACAO ---

// Rotas Principais
// Todas as rotas de usuário, incluindo aninhadas, começam aqui
app.use('/api/usuarios', usuarioRoutes);
// Todas as rotas de loja, incluindo aninhadas, começam aqui
app.use('/api/lojas', lojaRoutes);
// Todas as rotas de produto, incluindo aninhadas, começam aqui
app.use('/api/produtos', produtoRoutes);
// Rotas independentes
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/cupons', cupomDescontoRouter);
app.use('/api/relatorios', relatorioRouter);
app.use('/api/categorias-produto', categoriaProdutoRouter);

// --- ROTA DA DOCUMENTACAO SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
