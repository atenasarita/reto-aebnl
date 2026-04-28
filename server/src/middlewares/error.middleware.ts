import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors/appError';

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ZodError) {
    const zodError = error as ZodError;

    const validationError = new ValidationError(
      'Payload invalido.',
      zodError.flatten()
    );

    return res.status(validationError.statusCode).json({
      message: validationError.message,
      code: validationError.code,
      details: validationError.details,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  console.error('Unhandled error:', error);
  return res.status(500).json({
    message: 'Error interno del servidor.',
    code: 'INTERNAL_SERVER_ERROR',
  });
};