import { MockServiceRegistry } from './MockServiceRegistry';

/**
 * In-memory data store for mock services with type safety and persistence
 */
export class MockDataStore<T> {
  private data: Map<string, T>;
  private readonly storeName: string;
  private registry: MockServiceRegistry;

  constructor(storeName: string) {
    this.storeName = storeName;
    this.data = new Map<string, T>();
    this.registry = MockServiceRegistry.getInstance();
  }

  /**
   * Set a value in the store
   */
  set(key: string, value: T): void {
    this.data.set(key, this.cloneData(value));
    this.logOperation('set', { key, value });
  }

  /**
   * Get a value from the store
   */
  get(key: string): T | undefined {
    const value = this.data.get(key);
    this.logOperation('get', { key, found: !!value });
    return value ? this.cloneData(value) : undefined;
  }

  /**
   * Delete a value from the store
   */
  delete(key: string): boolean {
    const result = this.data.delete(key);
    this.logOperation('delete', { key, success: result });
    return result;
  }

  /**
   * Get all values from the store
   */
  getAll(): T[] {
    const values = Array.from(this.data.values());
    this.logOperation('getAll', { count: values.length });
    return values.map(v => this.cloneData(v));
  }

  /**
   * Find values that match a predicate
   */
  find(predicate: (value: T) => boolean): T[] {
    const values = Array.from(this.data.values()).filter(predicate);
    this.logOperation('find', { count: values.length });
    return values.map(v => this.cloneData(v));
  }

  /**
   * Find first value that matches a predicate
   */
  findOne(predicate: (value: T) => boolean): T | undefined {
    const value = Array.from(this.data.values()).find(predicate);
    this.logOperation('findOne', { found: !!value });
    return value ? this.cloneData(value) : undefined;
  }

  /**
   * Clear all data from the store
   */
  clear(): void {
    this.data.clear();
    this.logOperation('clear');
  }

  /**
   * Get the number of items in the store
   */
  get size(): number {
    return this.data.size;
  }

  private logOperation(operation: string, details?: Record<string, any>): void {
    const config = this.registry.getConfig();
    if (config.enableLogging) {
      console.debug(`[MockDataStore:${this.storeName}] ${operation}`, details);
    }
  }

  /**
   * Deep clone data to prevent unintended references
   */
  private cloneData<D>(data: D): D {
    return JSON.parse(JSON.stringify(data));
  }
}