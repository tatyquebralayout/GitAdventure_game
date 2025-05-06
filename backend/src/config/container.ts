import { container } from 'tsyringe';
import { LoggerService } from '../services/LoggerService';
import { CacheService } from '../services/CacheService';
import { GitCommandParser } from '../services/GitCommandParser';
import { CommandValidationService } from '../services/CommandValidationService';
import { QuestService } from '../services/QuestService';
import { WorldService } from '../services/WorldService';
import { CommandController } from '../controllers/CommandController';
import { AuthService } from '../services/AuthService';
import { MockServiceRegistry } from '../mocks/services/MockServiceRegistry';

export function configureContainer() {
  // Register core services with string tokens
  container.registerSingleton('LoggerService', LoggerService);
  container.registerSingleton('CacheService', CacheService);
  container.registerSingleton('GitCommandParser', GitCommandParser);
  container.registerSingleton('CommandValidationService', CommandValidationService);

  // Register additional services
  container.registerSingleton('QuestService', QuestService);
  container.registerSingleton('WorldService', WorldService);
  container.registerSingleton('AuthService', AuthService);

  // Register controllers
  container.registerSingleton('CommandController', CommandController);

  // Additional services can be registered here
}

export { container };