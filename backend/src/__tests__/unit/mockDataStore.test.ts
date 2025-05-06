import { MockDataStore } from '../../mocks/services/MockDataStore';
import { MockServiceRegistry } from '../../mocks/services/MockServiceRegistry';

describe('MockDataStore', () => {
  let store: MockDataStore<any>;

  beforeEach(() => {
    store = new MockDataStore<any>('test-store');
  });

  afterEach(() => {
    store.clear();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      const testData = { id: '1', name: 'test' };
      store.set('key1', testData);
      
      const retrieved = store.get('key1');
      expect(retrieved).toEqual(testData);
      expect(retrieved).not.toBe(testData); // Should be a clone
    });

    it('should delete values', () => {
      store.set('key1', { id: '1' });
      expect(store.get('key1')).toBeDefined();

      const deleted = store.delete('key1');
      expect(deleted).toBe(true);
      expect(store.get('key1')).toBeUndefined();
    });

    it('should return all values', () => {
      const items = [
        { id: '1', name: 'item1' },
        { id: '2', name: 'item2' }
      ];

      items.forEach((item, i) => store.set(`key${i}`, item));
      const allItems = store.getAll();

      expect(allItems).toHaveLength(items.length);
      expect(allItems).toEqual(expect.arrayContaining(items));
    });

    it('should clear all data', () => {
      store.set('key1', { id: '1' });
      store.set('key2', { id: '2' });
      expect(store.size).toBe(2);

      store.clear();
      expect(store.size).toBe(0);
    });
  });

  describe('Search Operations', () => {
    beforeEach(() => {
      const testData = [
        { id: '1', type: 'A', value: 10 },
        { id: '2', type: 'A', value: 20 },
        { id: '3', type: 'B', value: 30 },
      ];
      testData.forEach(item => store.set(item.id, item));
    });

    it('should find items by predicate', () => {
      const typeA = store.find(item => item.type === 'A');
      expect(typeA).toHaveLength(2);
      expect(typeA.every(item => item.type === 'A')).toBe(true);

      const highValue = store.find(item => item.value > 20);
      expect(highValue).toHaveLength(1);
      expect(highValue[0].value).toBe(30);
    });

    it('should find first matching item', () => {
      const found = store.findOne(item => item.type === 'A');
      expect(found).toBeDefined();
      expect(found!.type).toBe('A');

      const notFound = store.findOne(item => item.value > 100);
      expect(notFound).toBeUndefined();
    });
  });

  describe('Data Isolation', () => {
    it('should clone data on set and get', () => {
      const original = { id: '1', nested: { value: 10 } };
      store.set('key1', original);

      const retrieved1 = store.get('key1');
      const retrieved2 = store.get('key1');

      // Modify retrieved data
      retrieved1.nested.value = 20;

      // Original and second retrieval should be unchanged
      expect(original.nested.value).toBe(10);
      expect(retrieved2.nested.value).toBe(10);
    });

    it('should maintain isolation between stores', () => {
      const store1 = new MockDataStore<any>('store1');
      const store2 = new MockDataStore<any>('store2');

      store1.set('key', { value: 1 });
      store2.set('key', { value: 2 });

      expect(store1.get('key').value).toBe(1);
      expect(store2.get('key').value).toBe(2);
    });
  });

  describe('Registry Integration', () => {
    it('should respect registry configuration', () => {
      const registry = MockServiceRegistry.getInstance();
      registry.configure({ enableLogging: false });

      const testStore = new MockDataStore<any>('test-store');
      testStore.set('key', { value: 1 }); // Should not log

      registry.configure({ enableLogging: true }); // Restore logging
    });

    it('should register with the registry', () => {
      const registry = MockServiceRegistry.getInstance();
      const storeName = 'registry-test-store';
      const testStore = new MockDataStore<any>(storeName);

      // Access internal mockStores map through a test method
      const stores = (registry as any).mockStores;
      expect(stores.has(storeName)).toBe(true);
    });
  });
});