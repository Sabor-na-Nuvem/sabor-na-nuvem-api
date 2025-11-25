import express from 'express';
import geocodingController from './geocoding.controller.js';
import { geocodingLimiter } from '../../middlewares/rateLimiter.js';

const geocodingRouter = express.Router();

/**
 * @swagger
 * /geocoding/search:
 *   get:
 *     summary: Converte um endereço em coordenadas (Latitude/Longitude)
 *     tags: [Geocoding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: endereco
 *         schema:
 *           type: string
 *         required: true
 *         description: O endereço completo para busca ("Av Paulista, 1000, São Paulo, ...", por exemplo)
 *     responses:
 *       200:
 *         description: Coordenadas encontradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *                 display_name:
 *                   type: string
 *       404:
 *         description: Endereço não encontrado.
 *       500:
 *         description: Erro interno ou falha na API de mapas.
 */

geocodingRouter.get(
  '/search',
  geocodingLimiter,
  geocodingController.buscarCoordenadas,
);

/**
 * @swagger
 * /geocoding/reverse:
 *  get:
 *    summary: Converte coordenadas em endereço (Reverse Geocoding)
 *    tags: [Geocoding]
 *    parameters:
 *      - in: query
 *        name: lat
 *        required: true
 *      - in: query
 *        name: lon
 *        required: true
 *    responses:
 *      200:
 *        description: Endereço encontrado.
 *      404:
 *        description: Não encontrado.
 */
geocodingRouter.get(
  '/reverse',
  geocodingLimiter,
  geocodingController.buscarEnderecoReverso,
);

export default geocodingRouter;
