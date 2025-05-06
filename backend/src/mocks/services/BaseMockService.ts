import { injectable } from 'tsyringe';

/**
 * Base class for all mock service implementations.
 * Provides common functionality and type safety for mock services.
 */
@injectable()
export abstract class BaseMockService {
  protected mockPrefix = '[MOCK]';

  /**
   * Flag to indicate if the service is running in mock mode
   */
  protected get isMockMode(): boolean {
    return process.env.USE_MOCKS === 'true';
  }

  /**
   * Helper method to create mock data with consistent formatting
   */
  protected createMockResponse<T>(data: T): T {
    if (this.isMockMode) {
      console.debug(`${this.mockPrefix} Returning mock data`);
    }
    return data;
  }

  /**
   * Helper method to simulate async operations with optional delay
   */
  protected async simulateDelay(minMs: number = 100, maxMs: number = 500): Promise<void> {
    if (this.isMockMode) {
      const delay = Math.random() * (maxMs - minMs) + minMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Helper method to generate mock errors with consistent formatting
   */
  protected createMockError(message: string, code?: number): Error {
    const error = new Error(`${this.mockPrefix} ${message}`);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }
}