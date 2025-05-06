import { LoggerService } from '../../services/LoggerService';
import winston from 'winston';

jest.mock('winston', () => ({
  createLogger: jest.fn(),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    json: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    (winston.createLogger as jest.Mock).mockReturnValue(mockLogger);
    loggerService = new LoggerService();
  });

  describe('info', () => {
    it('should log info message with context', () => {
      const message = 'Test info message';
      const context = { userId: '123', action: 'test' };

      loggerService.info(message, context);

      expect(mockLogger.info).toHaveBeenCalledWith(message, {
        metadata: context
      });
    });

    it('should log info message without context', () => {
      const message = 'Test info message';

      loggerService.info(message);

      expect(mockLogger.info).toHaveBeenCalledWith(message, {
        metadata: undefined
      });
    });
  });

  describe('error', () => {
    it('should log error message with error object', () => {
      const message = 'Test error message';
      const error = new Error('Test error');
      const context = { userId: '123' };

      loggerService.error(message, error, context);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        metadata: {
          ...context,
          error: {
            message: error.message,
            stack: error.stack
          }
        }
      });
    });

    it('should log error message with string error', () => {
      const message = 'Test error message';
      const errorStr = 'String error';

      loggerService.error(message, errorStr);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        metadata: {
          error: errorStr
        }
      });
    });
  });

  describe('warn', () => {
    it('should log warning message with context', () => {
      const message = 'Test warning message';
      const context = { source: 'test' };

      loggerService.warn(message, context);

      expect(mockLogger.warn).toHaveBeenCalledWith(message, {
        metadata: context
      });
    });
  });

  describe('debug', () => {
    it('should log debug message with context', () => {
      const message = 'Test debug message';
      const context = { detail: 'debugging info' };

      loggerService.debug(message, context);

      expect(mockLogger.debug).toHaveBeenCalledWith(message, {
        metadata: context
      });
    });
  });

  describe('formatError', () => {
    it('should format Error object correctly', () => {
      const error = new Error('Test error');
      const result = (loggerService as any).formatError(error);

      expect(result).toEqual({
        message: error.message,
        stack: error.stack
      });
    });

    it('should handle non-Error objects', () => {
      const errorStr = 'String error';
      const result = (loggerService as any).formatError(errorStr);

      expect(result).toBe(errorStr);
    });
  });

  describe('createContext', () => {
    it('should merge multiple context objects', () => {
      const context1 = { userId: '123' };
      const context2 = { action: 'test' };
      const error = new Error('Test error');

      const result = (loggerService as any).createContext(context1, context2, error);

      expect(result).toEqual({
        ...context1,
        ...context2,
        error: {
          message: error.message,
          stack: error.stack
        }
      });
    });

    it('should handle undefined contexts', () => {
      const context = { userId: '123' };

      const result = (loggerService as any).createContext(undefined, context);

      expect(result).toEqual(context);
    });
  });
});