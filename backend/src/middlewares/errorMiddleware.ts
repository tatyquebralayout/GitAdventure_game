// backend/src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ServiceError } from '../errors/ServiceError';
import { LoggerService } from '../services/LoggerService';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const logger = new LoggerService();

  // Handle ServiceError with proper status codes and formatting
  if (ServiceError.isServiceError(error)) {
    logger.error(`Service error: ${error.message}`, {
      code: error.code,
      path: req.path,
      method: req.method,
      ...(error.details || {})
    });

    return res.status(error.httpStatus).json(error.toResponse());
  }

  // Handle TypeORM errors
  if ((error as any).code === '23505') {
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists'
    });
  }

  if ((error as any).code === '23503') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid reference to related resource'
    });
  }

  // Handle JWT errors
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token has expired'
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  // Handle validation errors
  if ((error as any).isJoi) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: (error as any).details
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: (error as any).constraints
    });
  }

  // Log unhandled errors
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  // Return generic error in production, detailed error in development
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error'
    : error.message;

  return res.status(500).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  });
};