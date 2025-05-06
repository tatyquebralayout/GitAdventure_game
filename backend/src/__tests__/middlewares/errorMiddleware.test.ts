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
      json: jest.fn()
    };
    mockNext = jest.fn();
    mockLoggerService = {
      error: jest.fn(),
      warn: jest.fn()
    } as any;

    jest.clearAllMocks();
  });

  describe('AppError handling', () => {
    it('should handle AppError with custom status code', () => {
      const error = new AppError('Custom error', 422);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Custom error'
      });
      expect(mockLoggerService.warn).toHaveBeenCalled();
    });

    it('should include error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new AppError('Validation failed', 400, {
        field: 'username',
        constraint: 'required'
      });

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation failed',
        details: {
          field: 'username',
          constraint: 'required'
        }
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('TypeORM error handling', () => {
    it('should handle TypeORM unique constraint errors', () => {
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).code = '23505';

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Resource already exists'
      });
    });

    it('should handle TypeORM foreign key errors', () => {
      const error = new Error('foreign key violation');
      (error as any).code = '23503';

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid reference to related resource'
      });
    });
  });

  describe('JWT error handling', () => {
    it('should handle JWT expired error', () => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Token has expired'
      });
    });

    it('should handle invalid JWT', () => {
      const error = new Error('invalid token');
      error.name = 'JsonWebTokenError';

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid token'
      });
    });
  });

  describe('Default error handling', () => {
    it('should handle unknown errors with 500 status code', () => {
      const error = new Error('Unknown error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error'
      });
      expect(mockLoggerService.error).toHaveBeenCalled();
    });

    it('should mask error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Database connection failed');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Validation error handling', () => {
    it('should handle Joi validation errors', () => {
      const error = new Error('Validation error');
      (error as any).isJoi = true;
      (error as any).details = [
        { message: 'Field is required', path: ['username'] }
      ];

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        details: [{ message: 'Field is required', path: ['username'] }]
      });
    });

    it('should handle class-validator errors', () => {
      const error = new Error('Validation failed');
      (error as any).name = 'ValidationError';
      (error as any).constraints = {
        isNotEmpty: 'username should not be empty',
        minLength: 'username is too short'
      };

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation failed',
        details: {
          isNotEmpty: 'username should not be empty',
          minLength: 'username is too short'
        }
      });
    });
  });
});