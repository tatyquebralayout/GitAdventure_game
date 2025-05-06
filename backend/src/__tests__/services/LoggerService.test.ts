import { LoggerService } from '../../services/LoggerService';
import winston from 'winston';

jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('info', () => {
    it('should log info message', () => {
      const message = 'Test info message';
      const meta = { context: 'test' };

      loggerService.info(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(message, meta);
    });

    it('should log info message without meta', () => {
      const message = 'Test info message';

      loggerService.info(message);

      expect(mockLogger.info).toHaveBeenCalledWith(message, undefined);
    });
  });

  describe('error', () => {
    it('should log error message with Error object', () => {
      const message = 'Test error message';
      const error = new Error('Test error');

      loggerService.error(message, error);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        error: {
          message: error.message,
          stack: error.stack
        }
      });
    });

    it('should log error message with string error', () => {
      const message = 'Test error message';
      const errorStr = 'Test error string';

      loggerService.error(message, errorStr);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        error: errorStr
      });
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      const message = 'Test warning message';
      const meta = { context: 'test' };

      loggerService.warn(message, meta);

      expect(mockLogger.warn).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      const message = 'Test debug message';
      const meta = { context: 'test' };

      loggerService.debug(message, meta);

      expect(mockLogger.debug).toHaveBeenCalledWith(message, meta);
    });
  });
});