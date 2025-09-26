import express from 'express';
import dotenv from 'dotenv';

// Variaveis de rota
import usuarioRoutes from './modules/usuario/usuario.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api/usuarios', usuarioRoutes);

app.listen(PORT, () => {});
