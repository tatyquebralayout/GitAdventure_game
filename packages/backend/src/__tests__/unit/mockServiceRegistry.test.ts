import { MockServiceRegistry } from '../../mocks/services/MockServiceRegistry';
import { MockDataStore } from '../../mocks/services/MockDataStore';

describe('MockServiceRegistry', () => {
  let registry: MockServiceRegistry;

  beforeEach(() => {
    registry = MockServiceRegistry.getInstance();
    registry.reset(); // Reset to default configuration
  });

  describe('Singleton Pattern', () => {
    it('should maintain a single instance', () => {
      const instance1 = MockServiceRegistry.getInstance();
      const instance2 = MockServiceRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration Management', () => {
    it('should have default configuration', () => {
      const config = registry.getConfiguration();
      expect(config).toEqual({
        enableLogging: true,
        enableDelay: true,
        minDelay: 100,
        maxDelay: 500
      });
    });

    it('should update configuration', () => {
      registry.configure({
        enableLogging: false,
        minDelay: 50,
        maxDelay: 200
      });

      const config = registry.getConfiguration();
      expect(config.enableLogging).toBe(false);
      expect(config.minDelay).toBe(50);
      expect(config.maxDelay).toBe(200);
    });

    it('should merge partial configurations', () => {
      const original = registry.getConfiguration();
      registry.configure({ enableLogging: false });

      const updated = registry.getConfiguration();
      expect(updated.enableLogging).toBe(false);
      expect(updated.enableDelay).toBe(original.enableDelay);
      expect(updated.minDelay).toBe(original.minDelay);
      expect(updated.maxDelay).toBe(original.maxDelay);
    });

    it('should validate delay configurations', () => {
      expect(() => {
        registry.configure({ minDelay: 200, maxDelay: 100 });
      }).toThrow('Maximum delay must be greater than minimum delay');
    });
  });

  describe('Store Management', () => {
    it('should register and retrieve stores', () => {
      const store = new MockDataStore<any>('test-store');
      registry.registerStore('test-store', store);

      const retrieved = registry.getStore('test-store');
      expect(retrieved).toBe(store);
    });

    it('should list registered stores', () => {
      const store1 = new MockDataStore<any>('store1');
      const store2 = new MockDataStore<any>('store2');

      registry.registerStore('store1', store1);
      registry.registerStore('store2', store2);

      const storeNames = registry.getRegisteredStores();
      expect(storeNames).toContain('store1');
      expect(storeNames).toContain('store2');
    });

    it('should handle duplicate store registration', () => {
      const store1 = new MockDataStore<any>('test');
      const store2 = new MockDataStore<any>('test');

      registry.registerStore('test', store1);
      expect(() => {
        registry.registerStore('test', store2);
      }).toThrow('Store with name test already exists');
    });

    it('should handle non-existent store retrieval', () => {
      expect(() => {
        registry.getStore('non-existent');
      }).toThrow('Store with name non-existent not found');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to default configuration', () => {
      registry.configure({
        enableLogging: false,
        minDelay: 50,
        maxDelay: 200
      });

      registry.reset();
      
      const config = registry.getConfiguration();
      expect(config).toEqual({
        enableLogging: true,
        enableDelay: true,
        minDelay: 100,
        maxDelay: 500
      });
    });

    it('should clear registered stores', () => {
      const store = new MockDataStore<any>('test');
      registry.registerStore('test', store);

      registry.reset();

      expect(() => {
        registry.getStore('test');
      }).toThrow('Store with name test not found');
    });
  });

  describe('Operation Timing', () => {
    it('should generate delays within configured range', () => {
      registry.configure({
        enableDelay: true,
        minDelay: 100,
        maxDelay: 200
      });

      for (let i = 0; i < 100; i++) {
        const delay = registry.getOperationDelay();
        expect(delay).toBeGreaterThanOrEqual(100);
        expect(delay).toBeLessThanOrEqual(200);
      }
    });

    it('should return zero delay when disabled', () => {
      registry.configure({ enableDelay: false });
      expect(registry.getOperationDelay()).toBe(0);
    });
  });

  describe('Event Handling', () => {
    it('should track operations', () => {
      const operations: any[] = [];
      const unsubscribe = registry.onOperation((op) => {
        operations.push(op);
      });

      registry.logOperation('test', { id: 1 });
      registry.logOperation('test', { id: 2 });

      expect(operations).toHaveLength(2);
      expect(operations[0].details.id).toBe(1);
      expect(operations[1].details.id).toBe(2);

      unsubscribe();
    });

    it('should allow multiple subscribers', () => {
      const results1: any[] = [];
      const results2: any[] = [];

      const unsub1 = registry.onOperation(op => results1.push(op));
      const unsub2 = registry.onOperation(op => results2.push(op));

      registry.logOperation('test', { value: 'test' });

      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);

      unsub1();
      unsub2();
    });

    it('should handle unsubscribe correctly', () => {
      const operations: any[] = [];
      const unsubscribe = registry.onOperation((op) => {
        operations.push(op);
      });

      registry.logOperation('test1', {});
      unsubscribe();
      registry.logOperation('test2', {});

      expect(operations).toHaveLength(1);
      expect(operations[0].type).toBe('test1');
    });
  });
});