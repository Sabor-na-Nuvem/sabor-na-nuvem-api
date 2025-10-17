import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Variaveis de rota
import categoriaProdutoRouter from './modules/categoria-produto/categoria-produto.routes.js';
// import usuarioRoutes from './modules/usuario/usuario.routes.js';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- ROTAS DA APLICACAO ---
// app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categoria-produto', categoriaProdutoRouter);

// --- ROTA DA DOCUMENTACAO SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {});
