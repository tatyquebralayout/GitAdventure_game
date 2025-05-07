import { Request, Response } from 'express';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware';
import { CacheService } from '../../services/CacheService';

jest.mock('../../services/CacheService');

describe('rateLimitMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      path: '/api/test',
      method: 'GET'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };
    mockNext = jest.fn();
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn()
    } as any;
  });

  describe('request tracking', () => {
    it('should allow first request within window', async () => {
      mockCacheService.get.mockResolvedValue(null);

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      })(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('127.0.0.1'),
        expect.any(Number),
        15 * 60
      );
    });

    it('should block requests over limit', async () => {
      mockCacheService.get.mockResolvedValue(101); // Over the limit

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 100
      })(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Too many requests, please try again later.'
      });
    });

    it('should set proper rate limit headers', async () => {
      mockCacheService.get.mockResolvedValue(50); // Half the limit used

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 100
      })(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        100
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        50
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(Number)
      );
    });
  });

  describe('configuration options', () => {
    it('should respect custom window size', async () => {
      mockCacheService.get.mockResolvedValue(null);

      await rateLimitMiddleware({
        windowMs: 60 * 1000, // 1 minute
        max: 10
      })(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        60
      );
    });

    it('should handle zero remaining requests correctly', async () => {
      mockCacheService.get.mockResolvedValue(10); // At the limit

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 10
      })(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        0
      );
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(429);
    });
  });

  describe('error handling', () => {
    it('should handle cache service errors gracefully', async () => {
      mockCacheService.get.mockRejectedValue(new Error('Cache error'));

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 100
      })(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled(); // Should allow request through on error
    });

    it('should handle invalid request counts in cache', async () => {
      mockCacheService.get.mockResolvedValue('invalid'); // Invalid count in cache

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 100
      })(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalled(); // Should reset the counter
    });
  });

  describe('key generation', () => {
    it('should generate unique keys for different IPs', async () => {
      mockCacheService.get.mockResolvedValue(null);
      
      const req1 = { ...mockRequest, ip: '1.1.1.1' };
      const req2 = { ...mockRequest, ip: '2.2.2.2' };

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 100
      })(req1 as Request, mockResponse as Response, mockNext);

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 100
      })(req2 as Request, mockResponse as Response, mockNext);

      const setCalls = mockCacheService.set.mock.calls;
      expect(setCalls[0][0]).not.toBe(setCalls[1][0]);
    });

    it('should handle requests with undefined IP', async () => {
      mockCacheService.get.mockResolvedValue(null);
      const reqWithoutIp = { ...mockRequest, ip: undefined };

      await rateLimitMiddleware({
        windowMs: 15 * 60 * 1000,
        max: 100
      })(reqWithoutIp as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('unknown'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });
});