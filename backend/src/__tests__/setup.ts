import 'reflect-metadata';
import { container } from 'tsyringe';
import { MockServiceRegistry } from '../mocks/services/MockServiceRegistry';
import { LoggerService } from '../services/LoggerService';
import { SERVICE_TOKENS } from '../config/services';

// Mock Redis for tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    flushall: jest.fn(),
    on: jest.fn()
  }));
});

// Force mock mode for tests
process.env.USE_MOCKS = 'true';

// Test utilities
export const TestUtils = {
  /**
   * Reset all mock services and data stores
   */
  resetMocks() {
    const registry = MockServiceRegistry.getInstance();
    registry.reset();
  },

  /**
   * Get a mock service instance by token
   */
  getMockService<T>(token: string): T {
    return container.resolve<T>(token);
  },

  /**
   * Create a test user and return auth tokens
   */
  async createTestUser(username: string = 'test_user', password: string = 'password123') {
    const authService = this.getMockService(SERVICE_TOKENS.AUTH_SERVICE);
    await authService.register(username, `${username}@example.com`, password);
    return authService.login(username, password);
  },

  /**
   * Configure mock service behavior
   */
  configureMocks(config: Partial<MockServiceRegistry['config']>) {
    const registry = MockServiceRegistry.getInstance();
    registry.configure(config);
  }
};

// Global test setup
beforeAll(async () => {
  // Initialize mock services
  await MockServiceRegistry.registerMockServices();
});

// Reset mocks between tests
beforeEach(() => {
  TestUtils.resetMocks();
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  const logger = new LoggerService();
  logger.info('Test suite completed');
});