import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { container } from 'tsyringe';
import { Redis } from 'ioredis';
import { AppError } from '../utils/AppError';

interface RateLimitConfig {
  points: number;      // Número de requisições permitidas
  duration: number;    // Período em segundos
  blockDuration?: number; // Tempo de bloqueio em segundos após exceder limite
}

export const RateLimitMiddleware = (config: RateLimitConfig) => {
  const redisClient = container.resolve<Redis>('RedisClient');

  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'ratelimit',
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.ip;
      await rateLimiter.consume(key);
      next();
    } catch (error) {
      if (error.remainingPoints === 0) {
        throw new AppError('Too many requests', 429, {
          retryAfter: error.msBeforeNext / 1000
        });
      }
      next(error);
    }
  };
};