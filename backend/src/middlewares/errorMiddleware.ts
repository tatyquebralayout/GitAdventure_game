// backend/src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '@shared/types/api';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => { // Alterado para void
  console.error('Error caught by middleware:', err); // Log the error for debugging

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      error: {
        code: err.name, // Use AppError name as code
        details: err.details,
      },
    };
    res.status(err.statusCode).json(response); // Removido o return
    return; // Adicionado return explícito para clareza
  }

  // Handle unexpected errors
  const response: ApiResponse = {
    success: false,
    message: 'Erro interno do servidor',
    error: {
      code: 'InternalServerError',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Show stack in dev
    },
  };

  res.status(500).json(response); // Removido o return
};