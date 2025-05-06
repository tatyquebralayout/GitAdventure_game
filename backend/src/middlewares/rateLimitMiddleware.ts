import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { AppError } from '../utils/AppError';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Configuração base do rate limit
const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs,
    max,
    handler: (_req: Request, _res: Response) => {
      throw new AppError(message, 429);
    },
  });
};

// Rate limit para autenticação
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutos
  5, // 5 tentativas
  'Muitas tentativas de login. Tente novamente em 15 minutos.'
);

// Rate limit para validação de comandos Git
export const gitCommandRateLimiter = createRateLimiter(
  60 * 1000, // 1 minuto
  30, // 30 tentativas
  'Muitas tentativas de comando. Aguarde um minuto.'
);

// Rate limit geral da API
export const generalRateLimiter = createRateLimiter(
  60 * 1000, // 1 minuto
  100, // 100 requisições
  'Muitas requisições. Tente novamente em um minuto.'
);