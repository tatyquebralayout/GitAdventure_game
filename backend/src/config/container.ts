import { container } from 'tsyringe';
import { GitCommandParser } from '../services/GitCommandParser';
import { CommandValidationService } from '../services/CommandValidationService';
import { QuestService } from '../services/QuestService';
import { WorldService } from '../services/WorldService';
import { CommandController } from '../controllers/CommandController';
import { CacheService } from '../services/CacheService';
import { LoggerService } from '../services/LoggerService';
import { AuthService } from '../services/AuthService';

// Register services
container.registerSingleton('GitCommandParser', GitCommandParser);
container.registerSingleton('CommandValidationService', CommandValidationService);
container.registerSingleton('QuestService', QuestService);
container.registerSingleton('WorldService', WorldService);
container.registerSingleton('CacheService', CacheService);
container.registerSingleton('LoggerService', LoggerService);
container.registerSingleton('AuthService', AuthService);

// Register controllers
container.registerSingleton('CommandController', CommandController);

export { container };