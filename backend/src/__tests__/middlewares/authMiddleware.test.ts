import { Request, Response } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { AuthService } from '../../services/AuthService';
import { AppError } from '../../utils/AppError';

jest.mock('../../services/AuthService');

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    mockAuthService = {
      validateToken: jest.fn()
    } as any;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('token validation', () => {
    it('should pass with valid bearer token', async () => {
      const validToken = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`
      };

      mockAuthService.validateToken.mockResolvedValue({
        userId: '123',
        username: 'testuser'
      });

      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAuthService.validateToken).toHaveBeenCalledWith(validToken);
      expect(mockRequest).toHaveProperty('user', {
        userId: '123',
        username: 'testuser'
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject requests without authorization header', async () => {
      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
      expect(mockAuthService.validateToken).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid bearer token format', async () => {
      mockRequest.headers = {
        authorization: 'Invalid-Format Token'
      };

      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
      expect(mockAuthService.validateToken).not.toHaveBeenCalled();
    });

    it('should reject empty bearer tokens', async () => {
      mockRequest.headers = {
        authorization: 'Bearer '
      };

      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AppError)
      );
      expect(mockAuthService.validateToken).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle token validation errors', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token'
      };

      mockAuthService.validateToken.mockRejectedValue(
        new Error('Invalid token')
      );

      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('unauthorized')
        })
      );
    });

    it('should handle unexpected auth service errors', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid.token'
      };

      mockAuthService.validateToken.mockRejectedValue(
        new Error('Unexpected error')
      );

      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('unauthorized')
        })
      );
    });
  });

  describe('request enrichment', () => {
    it('should properly enrich request with user data', async () => {
      const token = 'valid.jwt.token';
      const userData = {
        userId: '123',
        username: 'testuser',
        roles: ['user']
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      mockAuthService.validateToken.mockResolvedValue(userData);

      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest).toHaveProperty('user', userData);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle additional user properties', async () => {
      const token = 'valid.jwt.token';
      const userData = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
        preferences: { theme: 'dark' }
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      mockAuthService.validateToken.mockResolvedValue(userData);

      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest).toHaveProperty('user', userData);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});