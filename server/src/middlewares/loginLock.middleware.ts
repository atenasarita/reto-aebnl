import { NextFunction, Request, Response } from 'express';
import { isLoginLocked } from '../utils/loginAttempts';

export const checkLoginLock = (req: Request, res: Response, next: NextFunction) => {
  const usuario = req.body?.usuario;

  if (typeof usuario === 'string' && isLoginLocked(usuario)) {
    return res.status(429).json({
      message: 'Cuenta bloqueada temporalmente por demasiados intentos fallidos. Intenta en 15 minutos.',
      code: 'TOO_MANY_REQUESTS',
    });
  }

  next();
};
