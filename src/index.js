import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Variaveis de rota
import lojaRoutes from './modules/loja/loja.routes.js';
import pedidoRoutes from './modules/pedido/pedido.routes.js';
import produtoRoutes from './modules/produto/produto.routes.js';
import usuarioRoutes from './modules/usuario/usuario.routes.js';
import cupomDescontoRouter from './modules/cupom-desconto/cupom-desconto.routes.js';
import relatorioRouter from './modules/relatorio-usuario/relatorio-usuario.routes.js';
import categoriaProdutoRouter from './modules/categoria-produto/categoria-produto.routes.js';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {});
