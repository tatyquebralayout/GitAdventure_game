import { container } from 'tsyringe';
import { IAuthService } from '../services/interfaces/IAuthService';
import { AuthService } from '../services/AuthService';
import { MockAuthService } from '../mocks/services/MockAuthService';

export function configureServices() {
  const useMocks = process.env.USE_MOCKS === 'true';

  // Auth Service
  container.register<IAuthService>('IAuthService', {
    useClass: useMocks ? MockAuthService : AuthService
  });

  // Add other service registrations here following the same pattern
}

// Type tokens for dependency injection
export const SERVICE_TOKENS = {
  AUTH_SERVICE: 'IAuthService'
} as const;