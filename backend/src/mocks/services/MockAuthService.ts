import { injectable } from 'tsyringe';
import { BaseMockService } from './BaseMockService';
import { User } from '../../entities/User';
import { UserToken } from '../../entities/UserToken';
import { TokenResponse, TokenPayload } from '../../types/auth';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { ServiceError, ServiceErrorCode } from '../../errors/ServiceError';
import { MockDataStore } from './MockDataStore';
import { MockValidators, MockDataGenerators, MockTypeUtils } from './mockUtils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
    this.registerStores();
  }

  private registerStores() {
    const registry = this.registry;
    registry.registerStore('users', this.users);
    registry.registerStore('tokens', this.tokens);
  }

  private async setupTestUser() {
    const testUser: User = {
      id: MockDataGenerators.generateId('user'),
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

    MockValidators.validateResourceNotExists(
      this.users.findOne(u => u.username === username || u.email === email),
      'User',
      { username, email },
      true
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: MockDataGenerators.generateId('user'),
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
    return this.createMockResponse(
      MockTypeUtils.removeSensitiveFields(newUser, ['password']),
      'register'
    );
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    await this.simulateDelay();

    const user = MockValidators.validateResourceExists(
      this.users.findOne(u => u.username === username),
      'User',
      username,
      true
    );

    if (!(await bcrypt.compare(password, user.password))) {
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
      id: MockDataGenerators.generateId('token'),
      userId: user.id,
      accessToken,
      refreshToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      user
    };

    this.tokens.set(refreshToken, userToken);
    const userWithoutPassword = MockTypeUtils.removeSensitiveFields(user, ['password']);

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
      MockValidators.validateResourceExists(
        this.users.get(decoded.userId),
        'User',
        decoded.userId,
        true
      );

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

    const userToken = MockValidators.validateResourceExists(
      this.tokens.get(refreshToken),
      'Refresh token',
      refreshToken,
      true
    );

    const user = MockValidators.validateResourceExists(
      this.users.get(userToken.userId),
      'User',
      userToken.userId,
      true
    );

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

    const userWithoutPassword = MockTypeUtils.removeSensitiveFields(user, ['password']);
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