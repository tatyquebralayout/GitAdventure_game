import { injectable } from 'tsyringe';
import { MockServiceRegistry } from './MockServiceRegistry';
import { LoggerService } from '../../services/LoggerService';

/**
 * Base class for all mock service implementations.
 * Provides common functionality and type safety for mock services.
 */
@injectable()
export abstract class BaseMockService {
  protected mockPrefix = '[MOCK]';
  protected registry: MockServiceRegistry;
  protected logger: LoggerService;

  constructor() {
    this.registry = MockServiceRegistry.getInstance();
    this.logger = new LoggerService();
  }

  /**
   * Flag to indicate if the service is running in mock mode
   */
  protected get isMockMode(): boolean {
    return MockServiceRegistry.shouldUseMocks();
  }

  /**
   * Helper method to create mock data with consistent formatting
   */
  protected createMockResponse<T>(data: T, operationName?: string): T {
    const config = this.registry.getConfig();
    if (this.isMockMode && config.enableLogging) {
      this.logger.debug(`${this.mockPrefix} ${operationName || 'Operation'} completed`, {
        operation: operationName,
        mockData: data
      });
    }
    return data;
  }

  /**
   * Helper method to simulate async operations with optional delay
   */
  protected async simulateDelay(customMinMs?: number, customMaxMs?: number): Promise<void> {
    const config = this.registry.getConfig();
    if (this.isMockMode && config.enableDelay) {
      const minMs = customMinMs ?? config.minDelay ?? 100;
      const maxMs = customMaxMs ?? config.maxDelay ?? 500;
      const delay = Math.random() * (maxMs - minMs) + minMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Helper method to generate mock errors with consistent formatting
   */
  protected createMockError(message: string, code?: number, details?: Record<string, unknown>): Error {
    type CustomError = Error & { code?: number; details?: Record<string, unknown> };
    const error: CustomError = new Error(`${this.mockPrefix} ${message}`);
    if (code) {
      error.code = code;
    }
    if (details) {
      error.details = details;
    }
    return error;
  }

  /**
   * Helper method to log mock operations
   */
  protected logMockOperation(operation: string, details?: Record<string, unknown>): void {
    const config = this.registry.getConfig();
    if (this.isMockMode && config.enableLogging) {
      this.logger.debug(`${this.mockPrefix} ${operation}`, details);
    }
  }
}