import express from 'express';
import usuarioController from './usuario.controller.js';

const router = express.Router();

// Rota GET para /usuario/
router.get('/', usuarioController.getAllUsuarios);

export default router;
