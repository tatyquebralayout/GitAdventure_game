import { CacheService } from '../../services/CacheService';
import Redis from 'ioredis';
import { mockDeep } from 'jest-mock-extended';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockDeep<Redis>());
});

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService = new CacheService();
    mockRedis = new Redis() as jest.Mocked<Redis>;
    (cacheService as any).redis = mockRedis;
  });

  describe('get', () => {
    it('should return parsed data when key exists', async () => {
      const mockData = { id: 1, name: 'test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockData));

      const result = await cacheService.get('test-key');
      expect(result).toEqual(mockData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set cache with default expiration', async () => {
      const value = { data: 'test' };
      await cacheService.set('test-key', value);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(value),
        'EX',
        3600
      );
    });

    it('should set cache with custom expiration', async () => {
      const value = { data: 'test' };
      const customExpiration = 1800;
      
      await cacheService.set('test-key', value, customExpiration);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(value),
        'EX',
        customExpiration
      );
    });
  });

  describe('del', () => {
    it('should delete cache key', async () => {
      await cacheService.del('test-key');
      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('invalidatePattern', () => {
    it('should delete multiple keys matching pattern', async () => {
      const mockKeys = ['key1', 'key2', 'key3'];
      mockRedis.keys.mockResolvedValue(mockKeys);

      await cacheService.invalidatePattern('test*');

      expect(mockRedis.keys).toHaveBeenCalledWith('test*');
      expect(mockRedis.del).toHaveBeenCalledWith(...mockKeys);
    });

    it('should not call del if no keys match pattern', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await cacheService.invalidatePattern('test*');

      expect(mockRedis.keys).toHaveBeenCalledWith('test*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('getOrSet', () => {
    it('should return cached data if it exists', async () => {
      const cachedData = { id: 1, name: 'cached' };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const callback = jest.fn();
      const result = await cacheService.getOrSet('test-key', callback);

      expect(result).toEqual(cachedData);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback and cache result if no cached data exists', async () => {
      const newData = { id: 2, name: 'new' };
      mockRedis.get.mockResolvedValue(null);
      const callback = jest.fn().mockResolvedValue(newData);

      const result = await cacheService.getOrSet('test-key', callback);

      expect(result).toEqual(newData);
      expect(callback).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(newData),
        'EX',
        3600
      );
    });
  });
});