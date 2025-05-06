import { Request, Response, NextFunction } from 'express';
import { validationMiddleware } from '../../middlewares/validationMiddleware';
import { authSchemas, progressSchemas, commandSchemas } from '../../validators/schemas';
import { AppError } from '../../utils/AppError';

describe('validationMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('auth validation', () => {
    const middleware = validationMiddleware(authSchemas.register);

    it('should pass valid registration data', async () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should reject invalid email format', async () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('email')
        })
      );
    });

    it('should reject missing required fields', async () => {
      mockRequest.body = {
        username: 'testuser'
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/required/)
        })
      );
    });
  });

  describe('progress validation', () => {
    const middleware = validationMiddleware(progressSchemas.saveProgress);

    it('should pass valid save progress data', async () => {
      mockRequest.body = {
        saveSlot: 1,
        saveName: 'Test Save',
        gameState: { level: 1, score: 100 }
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should reject invalid save slot number', async () => {
      mockRequest.body = {
        saveSlot: 11, // Max is 10
        saveName: 'Test Save',
        gameState: { level: 1 }
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('saveSlot')
        })
      );
    });
  });

  describe('command validation', () => {
    const middleware = validationMiddleware(commandSchemas.validateCommand);

    it('should pass valid command data', async () => {
      mockRequest.body = {
        command: 'git init',
        questId: '123e4567-e89b-12d3-a456-426614174000',
        currentStep: 1
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should reject invalid UUID format', async () => {
      mockRequest.body = {
        command: 'git init',
        questId: 'invalid-uuid',
        currentStep: 1
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('questId')
        })
      );
    });

    it('should accept request without optional currentStep', async () => {
      mockRequest.body = {
        command: 'git init',
        questId: '123e4567-e89b-12d3-a456-426614174000'
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('error handling', () => {
    const middleware = validationMiddleware(authSchemas.login);

    it('should handle unexpected validation errors gracefully', async () => {
      const schema = null;
      const badMiddleware = validationMiddleware(schema as any);

      await badMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('validation')
        })
      );
    });

    it('should provide clear error messages for multiple validation failures', async () => {
      mockRequest.body = {
        username: '',
        password: ''
      };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/username.*password/s)
        })
      );
    });
  });
});