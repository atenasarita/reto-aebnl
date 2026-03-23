import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ForbiddenError, UnauthorizedError } from '../errors/appError';
import { TokenPayload } from '../types/auth.types';

type AuthenticatedRequest = Request & { user?: TokenPayload };

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next(new UnauthorizedError('Token no proporcionado o formato invalido.'));
	}

	const token = authHeader.slice(7);

	try {
		const payload = verifyAccessToken(token);
		(req as AuthenticatedRequest).user = payload;
		next();
	} catch {
		return next(new UnauthorizedError('Token invalido o expirado.'));
	}
};

export const authorizeRoles = (...roles: TokenPayload['rol'][]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as AuthenticatedRequest).user;

		if (!user) {
			return next(new UnauthorizedError('No autenticado.'));
		}

		if (!roles.includes(user.rol)) {
			return next(new ForbiddenError('No tienes permisos para esta accion.'));
		}

		next();
	};
};
