import { ServiceError, ServiceErrorCode } from '../../errors/ServiceError';

/**
 * Validation utilities for mock services
 */
export const MockValidators = {
  /**
   * Validate that a resource exists
   */
  validateResourceExists<T>(
    resource: T | null | undefined,
    resourceType: string,
    resourceId: string,
    isMock = true
  ): T {
    if (!resource) {
      throw new ServiceError(
        ServiceErrorCode.RESOURCE_NOT_FOUND,
        `${resourceType} not found`,
        { resourceId },
        isMock
      );
    }
    return resource;
  },

  /**
   * Validate that a resource doesn't exist (to prevent duplicates)
   */
  validateResourceNotExists<T>(
    resource: T | null | undefined,
    resourceType: string,
    details?: Record<string, unknown>,
    isMock = true
  ): void {
    if (resource) {
      throw new ServiceError(
        ServiceErrorCode.RESOURCE_EXISTS,
        `${resourceType} already exists`,
        details,
        isMock
      );
    }
  },

  /**
   * Validate that a command matches a regex pattern
   */
  validateCommand(
    command: string,
    pattern: string,
    isMock = true
  ): boolean {
    try {
      return new RegExp(pattern).test(command);
    } catch (error) {
      throw new ServiceError(
        ServiceErrorCode.VALIDATION_ERROR,
        'Invalid command pattern',
        { pattern },
        isMock
      );
    }
  }
};

/**
 * Data generation utilities for mock services
 */
export const MockDataGenerators = {
  /**
   * Generate a mock ID
   */
  generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a date within a range from now
   */
  generateDate(minMinutesAgo: number = 0, maxMinutesAgo: number = 60): Date {
    const now = Date.now();
    const range = maxMinutesAgo - minMinutesAgo;
    const randomMinutes = Math.floor(Math.random() * range) + minMinutesAgo;
    return new Date(now - (randomMinutes * 60 * 1000));
  },

  /**
   * Generate a score within a range
   */
  generateScore(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

/**
 * Type utilities for mock services
 */
export const MockTypeUtils = {
  /**
   * Remove sensitive fields from an object
   */
  removeSensitiveFields<T extends object>(obj: T, fields: (keyof T)[]): Partial<T> {
    const result = { ...obj };
    for (const field of fields) {
      if (field in result) {
        // @ts-expect-error: Removendo campo sensível
        result[field] = undefined;
      }
    }
    return result;
  },

  /**
   * Pick specific fields from an object
   */
  pickFields<T, K extends keyof T>(obj: T, fields: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    fields.forEach(field => {
      result[field] = obj[field];
    });
    return result;
  }
};

/**
 * Timing utilities for mock services
 */
export const MockTimingUtils = {
  /**
   * Calculate time difference in seconds
   */
  calculateTimeSpentSeconds(startTime: Date, endTime: Date = new Date()): number {
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  },

  /**
   * Calculate bonus points based on completion time
   */
  calculateTimeBonus(
    timeSpentSeconds: number,
    maxBonusPoints: number = 50,
    targetTimeSeconds: number = 60
  ): number {
    if (timeSpentSeconds <= targetTimeSeconds) {
      return maxBonusPoints;
    }
    const bonusReduction = Math.floor((timeSpentSeconds - targetTimeSeconds) / 10);
    return Math.max(0, maxBonusPoints - bonusReduction);
  }
};