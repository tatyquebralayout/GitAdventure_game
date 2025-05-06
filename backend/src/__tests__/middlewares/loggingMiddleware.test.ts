import { Request, Response } from 'express';
import { loggingMiddleware } from '../../middlewares/loggingMiddleware';
import { LoggerService } from '../../services/LoggerService';

jest.mock('../../services/LoggerService');

describe('loggingMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockLoggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent',
        'x-request-id': 'test-request-id'
      },
      ip: '127.0.0.1'
    };

    mockResponse = {
      on: jest.fn(),
      statusCode: 200,
      getHeader: jest.fn(),
      get: jest.fn()
    };

    mockNext = jest.fn();
    mockLoggerService = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    jest.clearAllMocks();
  });

  describe('request logging', () => {
    it('should log incoming requests', () => {
      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          ip: '127.0.0.1'
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should include request ID if present', () => {
      mockRequest.headers['x-request-id'] = 'custom-request-id';

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          requestId: 'custom-request-id'
        })
      );
    });

    it('should handle requests without headers', () => {
      delete mockRequest.headers;

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.info).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('response logging', () => {
    it('should log successful responses', () => {
      // Simulate response 'finish' event
      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      });

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 200,
          responseTime: expect.any(Number)
        })
      );
    });

    it('should log response time accurately', () => {
      jest.useFakeTimers();
      
      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          jest.advanceTimersByTime(100); // Simulate 100ms delay
          callback();
        }
      });

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          responseTime: 100
        })
      );

      jest.useRealTimers();
    });

    it('should log error responses with warn level', () => {
      mockResponse.statusCode = 404;

      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      });

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'Request completed with error',
        expect.objectContaining({
          statusCode: 404
        })
      );
    });

    it('should log server error responses with error level', () => {
      mockResponse.statusCode = 500;

      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      });

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Request completed with server error',
        expect.objectContaining({
          statusCode: 500
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle errors in logging without affecting request', () => {
      mockLoggerService.info.mockImplementation(() => {
        throw new Error('Logging error');
      });

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue request processing if logging fails', () => {
      mockLoggerService.info.mockRejectedValue(new Error('Async logging error'));

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('request context enrichment', () => {
    it('should include user information if available', () => {
      mockRequest.user = { id: 'user123', username: 'testuser' };

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          userId: 'user123',
          username: 'testuser'
        })
      );
    });

    it('should handle query parameters', () => {
      mockRequest.query = { filter: 'test', page: '1' };

      loggingMiddleware(mockLoggerService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          query: { filter: 'test', page: '1' }
        })
      );
    });
  });
});