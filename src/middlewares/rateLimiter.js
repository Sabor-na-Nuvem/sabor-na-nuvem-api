import rateLimit from 'express-rate-limit';

/**
 * Limitador específico para rotas de Geocodificação.
 */
export const geocodingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // Janela de 1 minuto
  max: 10, // Limite de 10 requisições por IP por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      'Muitas tentativas de busca de endereço. Por favor, aguarde um momento.',
  },
});

/**
 * Limitador geral para rotas públicas de autenticação (login/register)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 tentativas por IP
  message: {
    message:
      'Muitas tentativas de login/registro. Tente novamente em 15 minutos.',
  },
});
