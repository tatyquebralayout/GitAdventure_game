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

export function configureServices() {
  const useMocks = MockServiceRegistry.shouldUseMocks();

  // Auth Service
  container.register<IAuthService>('IAuthService', {
    useClass: useMocks ? MockAuthService : AuthService
  });

  // Quest Service
  container.register<IQuestService>('IQuestService', {
    useClass: useMocks ? MockQuestService : QuestService
  });

  // World Service
  container.register<IWorldService>('IWorldService', {
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