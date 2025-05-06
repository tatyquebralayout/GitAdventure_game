import { CacheService } from '../../services/CacheService';
import Redis from 'ioredis';
import { mock, MockProxy } from 'jest-mock-extended';

jest.mock('ioredis');

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: MockProxy<Redis>;

  beforeEach(() => {
    mockRedis = mock<Redis>();
    // @ts-ignore
    Redis.mockImplementation(() => mockRedis);
    cacheService = new CacheService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get value from cache', async () => {
      const key = 'test-key';
      const value = 'test-value';
      mockRedis.get.mockResolvedValue(value);

      const result = await cacheService.get(key);
      expect(result).toBe(value);
      expect(mockRedis.get).toHaveBeenCalledWith(key);
    });

    it('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      mockRedis.set.mockResolvedValue('OK');

      await cacheService.set(key, value);
      expect(mockRedis.set).toHaveBeenCalledWith(key, value);
    });

    it('should set value with TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.set(key, value, ttl);
      expect(mockRedis.setex).toHaveBeenCalledWith(key, ttl, value);
    });
  });

  describe('delete', () => {
    it('should delete key from cache', async () => {
      const key = 'test-key';
      mockRedis.del.mockResolvedValue(1);

      await cacheService.delete(key);
      expect(mockRedis.del).toHaveBeenCalledWith(key);
    });
  });

  describe('getObject', () => {
    it('should get and parse JSON object', async () => {
      const key = 'test-key';
      const obj = { name: 'test', value: 123 };
      mockRedis.get.mockResolvedValue(JSON.stringify(obj));

      const result = await cacheService.getObject(key);
      expect(result).toEqual(obj);
    });

    it('should return null for non-existent object', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.getObject('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('increment/decrement', () => {
    it('should increment value', async () => {
      const key = 'counter';
      mockRedis.incr.mockResolvedValue(1);

      const result = await cacheService.increment(key);
      expect(result).toBe(1);
      expect(mockRedis.incr).toHaveBeenCalledWith(key);
    });

    it('should decrement value', async () => {
      const key = 'counter';
      mockRedis.decr.mockResolvedValue(0);

      const result = await cacheService.decrement(key);
      expect(result).toBe(0);
      expect(mockRedis.decr).toHaveBeenCalledWith(key);
    });
  });
});