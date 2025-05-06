import { Request, Response } from 'express';
import { errorMiddleware } from '../../middlewares/errorMiddleware';
import { AppError } from '../../utils/AppError';
import { LoggerService } from '../../services/LoggerService';

jest.mock('../../services/LoggerService');

describe('errorMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockLoggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    mockLoggerService = {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400);
    
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Test error'
    });
    expect(mockLoggerService.error).toHaveBeenCalled();
  });

  it('should handle validation errors', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Validation failed'
    });
  });

  it('should handle TypeORM errors', () => {
    const error = new Error('Database error');
    error.name = 'QueryFailedError';
    
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error'
    });
  });

  it('should handle JWT errors', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid token'
    });
  });

  it('should handle unknown errors in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Unknown error');
    
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error'
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should include error details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Development error');
    error.stack = 'Error stack trace';
    
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Development error',
      stack: 'Error stack trace'
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle errors with custom status codes', () => {
    const error = new AppError('Resource not found', 404);
    
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Resource not found'
    });
  });

  it('should log errors with context', () => {
    const error = new AppError('Test error', 500);
    const req = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent'
      }
    };
    
    errorMiddleware(error, req as Request, mockResponse as Response, mockNext);

    expect(mockLoggerService.error).toHaveBeenCalledWith(
      'Test error',
      error,
      expect.objectContaining({
        method: 'GET',
        url: '/api/test'
      })
    );
  });
});