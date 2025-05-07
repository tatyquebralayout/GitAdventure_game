// backend/src/middlewares/errorMiddleware.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ServiceError } from '../errors/ServiceError';
import { LoggerService } from '../services/LoggerService';

export const errorMiddleware: ErrorRequestHandler = (
  error: any, // Keep as any for broader compatibility, type guards will handle specifics
  req: Request,
  res: Response,
  next: NextFunction // Add next to the signature, even if not always called
): void => { // Explicitly set return type to void
  const logger = new LoggerService();

  // Handle ServiceError with proper status codes and formatting
  if (ServiceError.isServiceError(error)) {
    // error is now confirmed to be ServiceError
    logger.error(`Service error at ${req.method} ${req.path}`, error);

    res.status(error.httpStatus).json(error.toResponse());
    return; // Explicit return to satisfy void
  }

  // Handle TypeORM errors
  if ((error as any).code === '23505') {
    res.status(409).json({
      status: 'error',
      message: 'Resource already exists'
    });
    return; // Explicit return
  }

  if ((error as any).code === '23503') {
    res.status(400).json({
      status: 'error',
      message: 'Invalid reference to related resource'
    });
    return; // Explicit return
  }

  // Handle JWT errors
  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token has expired'
    });
    return; // Explicit return
  }

  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
    return; // Explicit return
  }

  // Handle validation errors
  if ((error as any).isJoi) {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: (error as any).details
    });
    return; // Explicit return
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: (error as any).constraints
    });
    return; // Explicit return
  }

  // Log unhandled errors
  logger.error(`Unhandled error at ${req.method} ${req.path}`, error);

  // Return generic error in production, detailed error in development
  const responseMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error'
    : error.message;

  res.status(500).json({
    status: 'error',
    message: responseMessage,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  });
  // No explicit return here as it's the end of the function and matches void
};