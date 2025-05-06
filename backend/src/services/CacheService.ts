import Redis from 'ioredis';
import { injectable } from 'tsyringe';

@injectable()
export class CacheService {
  private redis: Redis;
  private readonly DEFAULT_EXPIRATION = 3600; // 1 hour

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3
    });

    this.redis.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  async set(key: string, value: unknown, expireInSeconds = this.DEFAULT_EXPIRATION): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', expireInSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    expireInSeconds = this.DEFAULT_EXPIRATION
  ): Promise<T> {
    const cachedData = await this.get<T>(key);
    if (cachedData) return cachedData;

    const freshData = await callback();
    await this.set(key, freshData, expireInSeconds);
    return freshData;
  }
}