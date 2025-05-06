import winston from 'winston';
import { injectable } from 'tsyringe';

@injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  error(message: string, meta?: object) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: object) {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: object) {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: object) {
    this.logger.debug(message, meta);
  }

  logApiRequest(req: any, duration: number) {
    this.info('API Request', {
      method: req.method,
      path: req.path,
      duration: `${duration}ms`,
      userId: req.user?.id,
      ip: req.ip
    });
  }

  logError(error: Error, req: any) {
    this.error('API Error', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      path: req.path,
      userId: req.user?.id,
      ip: req.ip
    });
  }
}