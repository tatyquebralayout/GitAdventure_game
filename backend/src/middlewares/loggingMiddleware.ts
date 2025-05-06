import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { LoggerService } from '../services/LoggerService';

export const LoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger = container.resolve(LoggerService);
  const requestId = req.headers['x-request-id'] || 'unknown';
  
  const logContext = {
    requestId,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    username: req.user?.username
  };

  // Log no início da requisição
  logger.info(`Iniciando requisição ${req.method} ${req.url}`, logContext);

  // Captura o timestamp inicial
  const start = Date.now();

  // Intercepta o método original de end do response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    // Calcula o tempo de resposta
    const responseTime = Date.now() - start;
    
    const responseLogContext = {
      ...logContext,
      statusCode: res.statusCode,
      responseTime
    };

    // Log no fim da requisição
    if (res.statusCode >= 400) {
      logger.error(`Erro na requisição: ${res.statusCode}`, responseLogContext);
    } else {
      logger.info(`Requisição completada: ${res.statusCode}`, responseLogContext);
    }

    // Chama o método original de end
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};