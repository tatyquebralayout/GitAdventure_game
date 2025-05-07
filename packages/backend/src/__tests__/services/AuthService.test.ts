import { AuthService } from '../../services/AuthService';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import { UserToken } from '../../entities/UserToken';
import { AppError } from '../../utils/AppError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockTokenRepo: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn()
    };

    mockTokenRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock)
      .mockImplementation((entity) => {
        if (entity === User) return mockUserRepo;
        if (entity === UserToken) return mockTokenRepo;
        return null;
      });

    authService = new AuthService();
  });

  describe('register', () => {
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully register a new user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepo.create.mockReturnValue({ ...registerData, id: '1' });
      mockUserRepo.save.mockResolvedValue({ id: '1', ...registerData });

      const result = await authService.register(registerData);

      expect(result).toHaveProperty('id');
      expect(result.username).toBe(registerData.username);
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should throw error if username already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ username: registerData.username });

      await expect(authService.register(registerData))
        .rejects
        .toThrow('Username or email already exists');
    });
  });

  describe('login', () => {
    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    const mockUser = {
      id: '1',
      username: 'testuser',
      password: 'hashedPassword'
    };

    it('should successfully login a user', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockedToken');

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockTokenRepo.save).toHaveBeenCalled();
    });

    it('should throw error with invalid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const mockToken = 'validToken';
      const mockDecodedToken = { userId: '1', iat: 123456 };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      mockUserRepo.findOne.mockResolvedValue({ id: '1', username: 'testuser' });

      const result = await authService.validateToken(mockToken);

      expect(result).toHaveProperty('userId', '1');
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    });

    it('should throw error with invalid token', async () => {
      const mockToken = 'invalidToken';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.validateToken(mockToken))
        .rejects
        .toThrow('Invalid token');
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const mockRefreshToken = 'validRefreshToken';
      const mockUserToken = {
        userId: '1',
        refreshToken: mockRefreshToken
      };
      
      mockTokenRepo.findOne.mockResolvedValue(mockUserToken);
      mockUserRepo.findOne.mockResolvedValue({ id: '1', username: 'testuser' });
      (jwt.sign as jest.Mock).mockReturnValue('newToken');

      const result = await authService.refreshToken(mockRefreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockTokenRepo.save).toHaveBeenCalled();
    });

    it('should throw error with invalid refresh token', async () => {
      mockTokenRepo.findOne.mockResolvedValue(null);

      await expect(authService.refreshToken('invalidToken'))
        .rejects
        .toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const userId = '1';
      mockTokenRepo.delete.mockResolvedValue({ affected: 1 });

      await authService.logout(userId);

      expect(mockTokenRepo.delete).toHaveBeenCalledWith({ userId });
    });
  });
});