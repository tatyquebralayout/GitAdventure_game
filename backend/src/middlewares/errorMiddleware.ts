// backend/src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ValidationError } from 'class-validator';
import { QueryFailedError } from 'typeorm';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface ApiResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    details?: any;
  };
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error caught by middleware:', err);

  let statusCode = 500;
  const response: ApiResponse = {
    success: false,
    message: 'Erro interno do servidor',
    error: {
      code: 'InternalServerError',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  };

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.message = err.message;
    response.error.code = 'AppError';
    response.error.details = err.details;
  } 
  else if (err instanceof ValidationError || err.name === 'ValidationError') {
    statusCode = 400;
    response.message = 'Erro de validação';
    response.error.code = 'ValidationError';
    response.error.details = err.toString();
  }
  else if (err instanceof QueryFailedError) {
    const pgerror = err as any;
    if (pgerror.code === '23505') { // unique violation
      statusCode = 409;
      response.message = 'Recurso já existe';
      response.error.code = 'UniqueViolation';
    }
    else if (pgerror.code === '23503') { // foreign key violation
      statusCode = 400;
      response.message = 'Referência inválida';
      response.error.code = 'ForeignKeyViolation';
    }
  }
  else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    response.message = 'Token expirado';
    response.error.code = 'TokenExpired';
  }
  else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    response.message = 'Token inválido';
    response.error.code = 'InvalidToken';
  }

  res.status(statusCode).json(response);
}