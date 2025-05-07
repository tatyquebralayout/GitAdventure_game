import { container } from 'tsyringe';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { IQuestService } from '../../services/interfaces/IQuestService';
import { IWorldService } from '../../services/interfaces/IWorldService';
import { MockAuthService } from './MockAuthService';
import { MockQuestService } from './MockQuestService';
import { MockWorldService } from './MockWorldService';
import { LoggerService } from '../../services/LoggerService';

/**
 * Configuration for mock services
 */
export interface MockServiceConfig {
  /** Enable simulated network delay */
  enableDelay?: boolean;
  /** Min delay in ms */
  minDelay?: number;
  /** Max delay in ms */
  maxDelay?: number;
  /** Whether to log mock operations */
  enableLogging?: boolean;
  /** Whether to persist mock data between requests */
  persistData?: boolean;
}

/**
 * Registry for managing mock service configurations and state
 */
export class MockServiceRegistry {
  private static instance: MockServiceRegistry;
  private config: MockServiceConfig = {
    enableDelay: true,
    minDelay: 100,
    maxDelay: 500,
    enableLogging: true,
    persistData: true
  };
  private logger: LoggerService;
  private initialized: boolean = false;
  private mockStores: Map<string, any> = new Map();

  private constructor() {
    this.logger = new LoggerService();
  }

  static getInstance(): MockServiceRegistry {
    if (!MockServiceRegistry.instance) {
      MockServiceRegistry.instance = new MockServiceRegistry();
    }
    return MockServiceRegistry.instance;
  }

  /**
   * Update mock service configuration
   */
  configure(config: Partial<MockServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.debug('[MockRegistry] Configuration updated', this.config);
  }

  /**
   * Get current mock service configuration
   */
  getConfig(): Readonly<MockServiceConfig> {
    return { ...this.config };
  }

  /**
   * Reset all mock data stores
   */
  reset(): void {
    this.mockStores.forEach(store => store.clear());
    this.logger.info('[MockRegistry] All mock stores reset');
  }

  /**
   * Register a mock data store
   */
  registerStore(name: string, store: any): void {
    this.mockStores.set(name, store);
    this.logger.debug(`[MockRegistry] Store registered: ${name}`);
  }

  /**
   * Helper to determine if mocks should be used
   */
  static shouldUseMocks(): boolean {
    return process.env.USE_MOCKS === 'true';
  }

  /**
   * Initialize mock services with sample data
   */
  private async initializeMockData(): Promise<void> {
    if (this.initialized) return;

    try {
      // Get instances of mock services
      const authService = container.resolve<IAuthService>('IAuthService');
      const questService = container.resolve<IQuestService>('IQuestService');
      const worldService = container.resolve<IWorldService>('IWorldService');

      // Create test user
      await authService.register('test_user', 'test@example.com', 'password123');

      // Initialize sample worlds and quests
      const worlds = await worldService.getAllWorlds();
      for (const world of worlds) {
        const quests = await questService.getQuestCommandSteps(world.id);
        this.logger.debug(`[MockRegistry] Initialized world ${world.id} with ${quests.length} quests`);
      }

      this.initialized = true;
      this.logger.info('[MockRegistry] Mock data initialization complete');
    } catch (error) {
      this.logger.error('[MockRegistry] Failed to initialize mock data', error);
      throw error;
    }
  }

  /**
   * Register all mock services with the DI container
   */
  static async registerMockServices(): Promise<void> {
    const registry = MockServiceRegistry.getInstance();
    const logger = new LoggerService();

    try {
      // Register mock service implementations
      container.registerSingleton<IAuthService>('IAuthService', MockAuthService);
      container.registerSingleton<IQuestService>('IQuestService', MockQuestService);
      container.registerSingleton<IWorldService>('IWorldService', MockWorldService);

      logger.info('[MockRegistry] Mock services registered');

      // Initialize mock data
      await registry.initializeMockData();
    } catch (error) {
      logger.error('[MockRegistry] Failed to register mock services', error as Error);
      throw error;
    }
  }
}