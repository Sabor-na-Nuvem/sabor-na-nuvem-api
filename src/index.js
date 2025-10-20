import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Variaveis de rota
import produtoRoutes from './modules/produto/produto.routes.js';
import produtosEmLojaRoutes from './modules/produtos-em-loja/produtos-em-loja.routes.js';
import categoriaProdutoRouter from './modules/categoria-produto/categoria-produto.routes.js';
// import usuarioRoutes from './modules/usuario/usuario.routes.js';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- ROTAS DA APLICACAO ---
// app.use('/api/usuarios', usuarioRoutes);
app.use('/api/produto', produtoRoutes);
app.use('/api/categoria-produto', categoriaProdutoRouter);
app.use('/api/lojas/:lojaId/produtos-loja', produtosEmLojaRoutes);

// --- ROTA DA DOCUMENTACAO SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {});
