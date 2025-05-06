import { container } from 'tsyringe';
import { IAuthService } from '../services/interfaces/IAuthService';
import { IQuestService } from '../services/interfaces/IQuestService';
import { IWorldService } from '../services/interfaces/IWorldService';
import { AuthService } from '../services/AuthService';
import { QuestService } from '../services/QuestService';
import { WorldService } from '../services/WorldService';
import { MockAuthService } from '../mocks/services/MockAuthService';
import { MockQuestService } from '../mocks/services/MockQuestService';
import { MockWorldService } from '../mocks/services/MockWorldService';
import { MockServiceRegistry } from '../mocks/services/MockServiceRegistry';
import { GitCommandParser } from '../services/GitCommandParser';
import { CacheService } from '../services/CacheService';
import { LoggerService } from '../services/LoggerService';
import { CommandValidationService } from '../services/CommandValidationService';

export function configureServices() {
  const useMocks = MockServiceRegistry.shouldUseMocks();

  // Register core utility services - these are always real implementations
  container.registerSingleton('GitCommandParser', GitCommandParser);
  container.registerSingleton('CacheService', CacheService);
  container.registerSingleton('LoggerService', LoggerService);
  container.registerSingleton('CommandValidationService', CommandValidationService);

  // Register main business logic services - these can be mocked
  container.register<IAuthService>(SERVICE_TOKENS.AUTH_SERVICE, {
    useClass: useMocks ? MockAuthService : AuthService
  });

  container.register<IQuestService>(SERVICE_TOKENS.QUEST_SERVICE, {
    useClass: useMocks ? MockQuestService : QuestService
  });

  container.register<IWorldService>(SERVICE_TOKENS.WORLD_SERVICE, {
    useClass: useMocks ? MockWorldService : WorldService
  });

  if (useMocks) {
    MockServiceRegistry.registerMockServices();
  }
}

// Type tokens for dependency injection
export const SERVICE_TOKENS = {
  AUTH_SERVICE: 'IAuthService',
  QUEST_SERVICE: 'IQuestService',
  WORLD_SERVICE: 'IWorldService'
} as const;

// Service configuration types
export type ServiceTokens = typeof SERVICE_TOKENS[keyof typeof SERVICE_TOKENS];

export interface ServiceImplementations {
  [SERVICE_TOKENS.AUTH_SERVICE]: IAuthService;
  [SERVICE_TOKENS.QUEST_SERVICE]: IQuestService;
  [SERVICE_TOKENS.WORLD_SERVICE]: IWorldService;
}