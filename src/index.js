import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Variaveis de rota
import lojaRoutes from './modules/loja/loja.routes.js';
import usuarioRoutes from './modules/usuario/usuario.routes.js';
import produtoRoutes from './modules/produto/produto.routes.js';
import enderecoRoutes from './modules/endereco/endereco.routes.js';
import telefoneRoutes from './modules/telefone/telefone.routes.js';
import produtosEmLojaRoutes from './modules/produtos-em-loja/produtos-em-loja.routes.js';
import categoriaProdutoRouter from './modules/categoria-produto/categoria-produto.routes.js';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- ROTAS DA APLICACAO ---

// Rotas Principais
app.use('/api/lojas', lojaRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias-produto', categoriaProdutoRouter);

// Rotas aninhadas para ProdutoEmLoja
app.use('/api/lojas/:lojaId/produtos-loja', produtosEmLojaRoutes);

// Rotas aninhandas para Endereco
app.use('/api/lojas/:lojaId/endereco', enderecoRoutes);
app.use('/api/usuarios/:usuarioId/endereco', enderecoRoutes);

// Rotas aninhandas para Telefone
app.use('/api/lojas/:lojaId/telefones', telefoneRoutes);
app.use('/api/usuarios/:usuarioId/telefones', telefoneRoutes);

// --- ROTA DA DOCUMENTACAO SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {});
