import { Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { LoggerService } from '../services/LoggerService';

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = container.resolve(LoggerService);
  const start = Date.now();

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logApiRequest(req, duration);
  });

  next();
};