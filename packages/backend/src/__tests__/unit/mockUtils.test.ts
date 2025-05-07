import {
  MockValidators,
  MockDataGenerators,
  MockTypeUtils,
  MockTimingUtils
} from '../../mocks/services/mockUtils';
import { ServiceError, ServiceErrorCode } from '../../errors/ServiceError';

describe('Mock Utilities', () => {
  describe('MockValidators', () => {
    it('should validate resource existence', () => {
      const resource = { id: '1', name: 'test' };
      expect(
        MockValidators.validateResourceExists(resource, 'Test', '1')
      ).toEqual(resource);

      expect(() => 
        MockValidators.validateResourceExists(null, 'Test', '1')
      ).toThrow(ServiceError);
    });

    it('should validate resource non-existence', () => {
      expect(() => 
        MockValidators.validateResourceNotExists(null, 'Test')
      ).not.toThrow();

      expect(() => 
        MockValidators.validateResourceNotExists({ id: '1' }, 'Test')
      ).toThrow(ServiceError);
    });

    it('should validate commands against patterns', () => {
      expect(
        MockValidators.validateCommand('git init', '^git init$')
      ).toBe(true);

      expect(
        MockValidators.validateCommand('git push', '^git init$')
      ).toBe(false);

      expect(() =>
        MockValidators.validateCommand('git init', '[invalid regex')
      ).toThrow(ServiceError);
    });
  });

  describe('MockDataGenerators', () => {
    it('should generate unique IDs', () => {
      const id1 = MockDataGenerators.generateId('test');
      const id2 = MockDataGenerators.generateId('test');
      
      expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate dates within range', () => {
      const now = Date.now();
      const date = MockDataGenerators.generateDate(0, 5);
      const diffMinutes = (now - date.getTime()) / (1000 * 60);
      
      expect(diffMinutes).toBeGreaterThanOrEqual(0);
      expect(diffMinutes).toBeLessThanOrEqual(5);
    });

    it('should generate scores within range', () => {
      const score = MockDataGenerators.generateScore(50, 100);
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('MockTypeUtils', () => {
    it('should remove sensitive fields', () => {
      const obj = {
        id: '1',
        username: 'test',
        password: 'secret',
        email: 'test@example.com'
      };

      const sanitized = MockTypeUtils.removeSensitiveFields(obj, ['password']);
      expect(sanitized).not.toHaveProperty('password');
      expect(sanitized).toHaveProperty('username');
      expect(sanitized).toHaveProperty('email');
    });

    it('should pick specific fields', () => {
      const obj = {
        id: '1',
        username: 'test',
        email: 'test@example.com',
        created: new Date()
      };

      const picked = MockTypeUtils.pickFields(obj, ['username', 'email']);
      expect(Object.keys(picked)).toHaveLength(2);
      expect(picked).toHaveProperty('username');
      expect(picked).toHaveProperty('email');
      expect(picked).not.toHaveProperty('id');
    });
  });

  describe('MockTimingUtils', () => {
    it('should calculate time differences', () => {
      const start = new Date();
      const end = new Date(start.getTime() + 5000); // 5 seconds later
      
      const diff = MockTimingUtils.calculateTimeSpentSeconds(start, end);
      expect(diff).toBe(5);
    });

    it('should calculate bonus points based on time', () => {
      // Fast completion (under target time)
      const fastBonus = MockTimingUtils.calculateTimeBonus(30, 50, 60);
      expect(fastBonus).toBe(50);

      // Slow completion (over target time)
      const slowBonus = MockTimingUtils.calculateTimeBonus(90, 50, 60);
      expect(slowBonus).toBeLessThan(50);
      expect(slowBonus).toBeGreaterThanOrEqual(0);

      // Very slow completion (no bonus)
      const noBonus = MockTimingUtils.calculateTimeBonus(600, 50, 60);
      expect(noBonus).toBe(0);
    });
  });
});