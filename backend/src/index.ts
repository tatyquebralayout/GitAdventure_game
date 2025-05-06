// Entry point for the backend server
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/database';
import { container } from './config/container';
import { swaggerSpec } from './config/swagger';
import { authRoutes } from './routes/authRoutes';
import { commandRoutes } from './routes/commandRoutes';
import { worldRoutes } from './routes/worldRoutes';
import { questRoutes } from './routes/questRoutes';
import { progressRoutes } from './routes/progressRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { LoggingMiddleware } from './middlewares/loggingMiddleware';
import { RateLimitMiddleware } from './middlewares/rateLimitMiddleware';
import { LoggerService } from './services/LoggerService';

const app = express();
const logger = container.resolve(LoggerService);

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(LoggingMiddleware);

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// General rate limiting
const generalRateLimiter = RateLimitMiddleware({ points: 100, duration: 60 });
app.use('/api', generalRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/worlds', worldRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/progress', progressRoutes);

// Error handling
app.use(errorMiddleware);

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connection established');
    
    // Run migrations if needed
    return AppDataSource.runMigrations();
  })
  .then(() => {
    logger.info('Database migrations completed');
  })
  .catch((error: Error) => {
    logger.error('Error during initialization:', error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});