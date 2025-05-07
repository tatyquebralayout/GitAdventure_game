import { Request, Response } from 'express';
import { validationMiddleware } from '../../middlewares/validationMiddleware';
import { authSchemas, commandSchemas, progressSchemas } from '../../validators/schemas';

describe('validationMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Auth Validation', () => {
    it('should pass valid registration data', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      validationMiddleware(authSchemas.register)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      validationMiddleware(authSchemas.register)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].details).toBeDefined();
      expect(mockNext.mock.calls[0][0].details[0].path).toContain('email');
    });

    it('should reject short username', () => {
      mockRequest.body = {
        username: 'te',
        email: 'test@example.com',
        password: 'password123'
      };

      validationMiddleware(authSchemas.register)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].details).toBeDefined();
      expect(mockNext.mock.calls[0][0].details[0].path).toContain('username');
    });

    it('should validate login credentials', () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'password123'
      };

      validationMiddleware(authSchemas.login)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined();
    });
  });

  describe('Command Validation', () => {
    it('should validate valid command request', () => {
      mockRequest.body = {
        command: 'git init',
        questId: '123e4567-e89b-12d3-a456-426614174000',
        currentStep: 1
      };

      validationMiddleware(commandSchemas.validateCommand)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined();
    });

    it('should reject invalid UUID format', () => {
      mockRequest.body = {
        command: 'git init',
        questId: 'invalid-uuid',
        currentStep: 1
      };

      validationMiddleware(commandSchemas.validateCommand)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].details).toBeDefined();
      expect(mockNext.mock.calls[0][0].details[0].path).toContain('questId');
    });

    it('should allow missing currentStep', () => {
      mockRequest.body = {
        command: 'git init',
        questId: '123e4567-e89b-12d3-a456-426614174000'
      };

      validationMiddleware(commandSchemas.validateCommand)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined();
    });
  });

  describe('Progress Validation', () => {
    it('should validate save progress request', () => {
      mockRequest.body = {
        saveSlot: 1,
        saveName: 'My Save',
        gameState: { level: 1, score: 100 }
      };

      validationMiddleware(progressSchemas.saveProgress)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeUndefined();
    });

    it('should reject invalid save slot', () => {
      mockRequest.body = {
        saveSlot: 11, // Max is 10
        saveName: 'My Save',
        gameState: { level: 1 }
      };

      validationMiddleware(progressSchemas.saveProgress)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].details).toBeDefined();
      expect(mockNext.mock.calls[0][0].details[0].path).toContain('saveSlot');
    });

    it('should reject missing required fields', () => {
      mockRequest.body = {
        saveSlot: 1
        // Missing saveName and gameState
      };

      validationMiddleware(progressSchemas.saveProgress)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].details).toBeDefined();
      expect(mockNext.mock.calls[0][0].details).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request body', () => {
      mockRequest.body = {};

      validationMiddleware(authSchemas.register)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].details).toBeDefined();
    });

    it('should handle null values', () => {
      mockRequest.body = {
        username: null,
        email: null,
        password: null
      };

      validationMiddleware(authSchemas.register)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].details).toBeDefined();
    });

    it('should handle undefined values', () => {
      mockRequest.body = {
        username: undefined,
        email: undefined,
        password: undefined
      };

      validationMiddleware(authSchemas.register)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].details).toBeDefined();
    });
  });
});