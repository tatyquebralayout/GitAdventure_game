import { container } from 'tsyringe';

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

  private constructor() {}

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
  }

  /**
   * Get current mock service configuration
   */
  getConfig(): Readonly<MockServiceConfig> {
    return { ...this.config };
  }

  /**
   * Reset mock service state
   */
  reset(): void {
    // Implement reset logic for mock data stores
  }

  /**
   * Helper to determine if mocks should be used
   */
  static shouldUseMocks(): boolean {
    return process.env.USE_MOCKS === 'true';
  }

  /**
   * Register all mock services with the DI container
   */
  static registerMockServices(): void {
    const useMocks = MockServiceRegistry.shouldUseMocks();
    if (!useMocks) return;

    // Add registration logic here
    // This will be populated as we create more mock services
  }
}