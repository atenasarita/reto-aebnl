import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types';

const getJwtSecret = (): string => {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw new Error('JWT_SECRET no esta configurado en variables de entorno.');
	}

	return secret;
};

export const createAccessToken = (payload: TokenPayload): string => {
	const secret: jwt.Secret = getJwtSecret();
	const expiresIn = (process.env.JWT_EXPIRES_IN) as jwt.SignOptions['expiresIn'];

	return jwt.sign(payload, secret, { expiresIn });
};

export const verifyAccessToken = (token: string): TokenPayload => {
	return jwt.verify(token, getJwtSecret()) as TokenPayload;
};
