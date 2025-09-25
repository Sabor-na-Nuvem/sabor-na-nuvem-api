import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Variaveis de rota
import usuarioRoutes from './modules/usuario/usuario.routes.js';

const PORT = process.env.PORT || 3000;

app.use('/api/usuarios', usuarioRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});

