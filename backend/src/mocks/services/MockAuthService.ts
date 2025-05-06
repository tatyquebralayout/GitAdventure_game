import { injectable } from 'tsyringe';
import { BaseMockService } from './BaseMockService';
import { User } from '../../entities/User';
import { UserToken } from '../../entities/UserToken';
import { TokenResponse, TokenPayload } from '../../types/auth';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { ServiceError, ServiceErrorCode } from '../../errors/ServiceError';
import { MockDataStore } from './MockDataStore';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Mock implementation of AuthService
 * Simulates authentication operations with in-memory storage
 */
@injectable()
export class MockAuthService extends BaseMockService implements IAuthService {
  private readonly users: MockDataStore<User>;
  private readonly tokens: MockDataStore<UserToken>;
  private readonly jwtSecret = 'mock-jwt-secret';
  
  constructor() {
    super();
    this.users = new MockDataStore<User>('users');
    this.tokens = new MockDataStore<UserToken>('tokens');
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
    this.users.set(testUser.id, testUser);
    this.logMockOperation('setupTestUser', { userId: testUser.id });
  }

  async register(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    await this.simulateDelay();

    if (this.users.findOne(u => u.username === username || u.email === email)) {
      throw new ServiceError(
        ServiceErrorCode.USER_EXISTS,
        'Username or email already exists',
        { username, email },
        true
      );
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

    this.users.set(newUser.id, newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return this.createMockResponse(userWithoutPassword, 'register');
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    await this.simulateDelay();

    const user = this.users.findOne(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_CREDENTIALS,
        'Invalid credentials',
        undefined,
        true
      );
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

    this.tokens.set(refreshToken, userToken);
    const { password: _, ...userWithoutPassword } = user;

    return this.createMockResponse({
      accessToken,
      refreshToken,
      user: userWithoutPassword
    }, 'login');
  }

  async validateToken(token: string): Promise<TokenPayload> {
    await this.simulateDelay(50, 100);

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      const user = this.users.get(decoded.userId);
      
      if (!user) {
        throw new ServiceError(
          ServiceErrorCode.USER_NOT_FOUND,
          'User not found',
          { userId: decoded.userId },
          true
        );
      }

      return this.createMockResponse(decoded, 'validateToken');
    } catch (error) {
      throw new ServiceError(
        ServiceErrorCode.TOKEN_INVALID,
        'Invalid token',
        undefined,
        true
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    await this.simulateDelay();

    const userToken = this.tokens.get(refreshToken);
    if (!userToken) {
      throw new ServiceError(
        ServiceErrorCode.TOKEN_INVALID,
        'Invalid refresh token',
        undefined,
        true
      );
    }

    const user = this.users.get(userToken.userId);
    if (!user) {
      throw new ServiceError(
        ServiceErrorCode.USER_NOT_FOUND,
        'User not found',
        { userId: userToken.userId },
        true
      );
    }

    const newAccessToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' });

    // Update stored token
    this.tokens.delete(refreshToken);
    const newUserToken = {
      ...userToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      updatedAt: new Date()
    };
    this.tokens.set(newRefreshToken, newUserToken);

    const { password: _, ...userWithoutPassword } = user;
    return this.createMockResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userWithoutPassword
    }, 'refreshToken');
  }

  async logout(userId: string): Promise<void> {
    await this.simulateDelay(50, 100);
    
    // Find and remove all tokens for the user
    const userTokens = this.tokens.find(token => token.userId === userId);
    userTokens.forEach(token => this.tokens.delete(token.refreshToken));
    
    this.logMockOperation('logout', { userId });
  }
}