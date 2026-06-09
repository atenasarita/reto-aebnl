import rateLimit from 'express-rate-limit';

const tooManyRequests = (message: string) => ({
  message,
  code: 'TOO_MANY_REQUESTS',
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      tooManyRequests('Demasiados intentos fallidos de inicio de sesion. Intenta de nuevo en 15 minutos.')
    );
  },
});

export const preregistroRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      tooManyRequests('Demasiados envios de preregistro. Intenta de nuevo en 1 hora.')
    );
  },
});
