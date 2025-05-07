import { BaseMockService } from '../../mocks/services/BaseMockService';
import { MockServiceRegistry } from '../../mocks/services/MockServiceRegistry';

// Concrete implementation for testing
class TestMockService extends BaseMockService {
  public async testDelay(): Promise<void> {
    await this.simulateDelay();
  }

  public testResponse<T>(data: T): T {
    return this.createMockResponse(data, 'testResponse');
  }

  public getRegistry() {
    return this.registry;
  }

  public logTestOperation(details: any) {
    this.logMockOperation('test', details);
  }
}

describe('BaseMockService', () => {
  let service: TestMockService;

  beforeEach(() => {
    service = new TestMockService();
  });

  describe('Delay Simulation', () => {
    it('should respect delay configuration', async () => {
      const registry = MockServiceRegistry.getInstance();
      registry.configure({ enableDelay: true, minDelay: 50, maxDelay: 100 });

      const start = Date.now();
      await service.testDelay();
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(50);
      expect(duration).toBeLessThanOrEqual(150); // Add buffer for test execution
    });

    it('should skip delay when disabled', async () => {
      const registry = MockServiceRegistry.getInstance();
      registry.configure({ enableDelay: false });

      const start = Date.now();
      await service.testDelay();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Response Creation', () => {
    it('should create cloned responses', () => {
      const originalData = { id: '1', nested: { value: 10 } };
      const response = service.testResponse(originalData);

      expect(response).toEqual(originalData);
      expect(response).not.toBe(originalData);
      expect(response.nested).not.toBe(originalData.nested);
    });

    it('should handle null and undefined', () => {
      expect(service.testResponse(null)).toBeNull();
      expect(service.testResponse(undefined)).toBeUndefined();
    });

    it('should handle primitive types', () => {
      expect(service.testResponse(123)).toBe(123);
      expect(service.testResponse('test')).toBe('test');
      expect(service.testResponse(true)).toBe(true);
    });

    it('should handle arrays', () => {
      const original = [{ id: 1 }, { id: 2 }];
      const response = service.testResponse(original);

      expect(response).toEqual(original);
      expect(response).not.toBe(original);
      expect(response[0]).not.toBe(original[0]);
    });

    it('should handle complex objects', () => {
      const date = new Date();
      const original = {
        str: 'test',
        num: 123,
        bool: true,
        date: date,
        nested: { value: 10 },
        arr: [1, 2, 3]
      };

      const response = service.testResponse(original);
      expect(response).toEqual(original);
      expect(response).not.toBe(original);
      expect(response.date).toEqual(date);
      expect(response.nested).not.toBe(original.nested);
      expect(response.arr).not.toBe(original.arr);
    });
  });

  describe('Registry Access', () => {
    it('should provide access to registry', () => {
      const registry = service.getRegistry();
      expect(registry).toBe(MockServiceRegistry.getInstance());
    });

    it('should respect registry configuration', () => {
      const registry = service.getRegistry();
      registry.configure({ enableLogging: false });

      // This operation shouldn't produce logs
      service.logTestOperation({ test: true });

      registry.configure({ enableLogging: true }); // Restore logging
    });
  });

  describe('Operation Logging', () => {
    it('should log operations when enabled', () => {
      const registry = service.getRegistry();
      const originalLog = console.log;
      const mockLog = jest.fn();
      console.log = mockLog;

      registry.configure({ enableLogging: true });
      service.logTestOperation({ test: true });

      expect(mockLog).toHaveBeenCalled();
      console.log = originalLog;
    });

    it('should not log operations when disabled', () => {
      const registry = service.getRegistry();
      const originalLog = console.log;
      const mockLog = jest.fn();
      console.log = mockLog;

      registry.configure({ enableLogging: false });
      service.logTestOperation({ test: true });

      expect(mockLog).not.toHaveBeenCalled();
      console.log = originalLog;
    });
  });
});