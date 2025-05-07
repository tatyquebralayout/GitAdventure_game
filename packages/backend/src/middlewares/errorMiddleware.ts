// backend/src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ServiceError } from '../errors/ServiceError';
import { LoggerService } from '../services/LoggerService';

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const logger = new LoggerService();

  // Handle ServiceError com type guard
  if (ServiceError.isServiceError(error)) {
    logger.error(`Service error at ${String(req.method)} ${String(req.path)}`, error);
    res.status(error.httpStatus).json(error.toResponse());
    return;
  }

  // TypeORM errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code === '23505') {
      res.status(409).json({ status: 'error', message: 'Resource already exists' });
      return;
    }
    if (code === '23503') {
      res.status(400).json({ status: 'error', message: 'Invalid reference to related resource' });
      return;
    }
  }

  // JWT errors
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const name = (error as { name?: string }).name;
    if (name === 'TokenExpiredError') {
      res.status(401).json({ status: 'error', message: 'Token has expired' });
      return;
    }
    if (name === 'JsonWebTokenError') {
      res.status(401).json({ status: 'error', message: 'Invalid token' });
      return;
    }
    if (name === 'ValidationError') {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details: (error as { constraints?: unknown }).constraints
      });
      return;
    }
  }

  // Joi validation errors
  if (typeof error === 'object' && error !== null && 'isJoi' in error && (error as { isJoi?: boolean }).isJoi) {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: (error as { details?: unknown }).details
    });
    return;
  }

  // Log unhandled errors
  const method = typeof req.method === 'string' ? req.method : '';
  const path = typeof req.path === 'string' ? req.path : '';
  logger.error(`Unhandled error at ${method} ${path}`, error);

  const responseMessage = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : 'Unknown error');

  res.status(500).json({
    status: 'error',
    message: responseMessage,
    ...(process.env.NODE_ENV === 'development' && typeof error === 'object' && error !== null && 'stack' in error ? { stack: (error as { stack?: string }).stack } : {})
  });
};