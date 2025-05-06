import { injectable } from 'tsyringe';
import { BaseMockService } from './BaseMockService';
import { User } from '../../entities/User';
import { UserToken } from '../../entities/UserToken';
import { TokenResponse, TokenPayload } from '../../types/auth';
import { AppError } from '../../utils/AppError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Mock implementation of AuthService
 * Simulates authentication operations with in-memory storage
 */
@injectable()
export class MockAuthService extends BaseMockService {
  private readonly mockUsers: Map<string, User> = new Map();
  private readonly mockTokens: Map<string, UserToken> = new Map();
  private readonly jwtSecret = 'mock-jwt-secret';
  
  constructor() {
    super();
    // Initialize with a test user
    this.setupTestUser();
  }

  private async setupTestUser() {
    const testUser: User = {
      id: 'test-user-id',
      username: 'test_user',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      experience: 0,
      level: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      tokens: [],
      playerWorlds: [],
      progress: []
    };
    this.mockUsers.set(testUser.id, testUser);
  }

  async register(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    await this.simulateDelay();

    if (Array.from(this.mockUsers.values()).some(u => u.username === username || u.email === email)) {
      throw this.createMockError('Username or email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
      password: hashedPassword,
      experience: 0,
      level: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      tokens: [],
      playerWorlds: [],
      progress: []
    };

    this.mockUsers.set(newUser.id, newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return this.createMockResponse(userWithoutPassword);
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    await this.simulateDelay();

    const user = Array.from(this.mockUsers.values()).find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw this.createMockError('Invalid credentials', 401);
    }

    const accessToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' });

    const userToken: UserToken = {
      id: `token-${Date.now()}`,
      userId: user.id,
      accessToken,
      refreshToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      user
    };

    this.mockTokens.set(refreshToken, userToken);
    const { password: _, ...userWithoutPassword } = user;

    return this.createMockResponse({
      accessToken,
      refreshToken,
      user: userWithoutPassword
    });
  }

  async validateToken(token: string): Promise<TokenPayload> {
    await this.simulateDelay(50, 100);

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      const user = this.mockUsers.get(decoded.userId);
      
      if (!user) {
        throw this.createMockError('User not found', 401);
      }

      return this.createMockResponse(decoded);
    } catch (error) {
      throw this.createMockError('Invalid token', 401);
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    await this.simulateDelay();

    const userToken = this.mockTokens.get(refreshToken);
    if (!userToken) {
      throw this.createMockError('Invalid refresh token', 401);
    }

    const user = this.mockUsers.get(userToken.userId);
    if (!user) {
      throw this.createMockError('User not found', 401);
    }

    const newAccessToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' });

    // Update stored token
    this.mockTokens.delete(refreshToken);
    const newUserToken = {
      ...userToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      updatedAt: new Date()
    };
    this.mockTokens.set(newRefreshToken, newUserToken);

    const { password: _, ...userWithoutPassword } = user;
    return this.createMockResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userWithoutPassword
    });
  }

  async logout(userId: string): Promise<void> {
    await this.simulateDelay(50, 100);
    
    // Remove all tokens for the user
    Array.from(this.mockTokens.entries())
      .filter(([_, token]) => token.userId === userId)
      .forEach(([key]) => this.mockTokens.delete(key));
  }
}