import { User } from '../../entities/User';
import { TokenResponse, TokenPayload } from '../../types/auth';

/**
 * Interface defining the authentication service contract
 * Both real and mock implementations must follow this interface
 */
export interface IAuthService {
  /**
   * Register a new user
   * @throws {AppError} If username or email already exists
   */
  register(username: string, email: string, password: string): Promise<Omit<User, 'password'>>;

  /**
   * Authenticate a user and generate access/refresh tokens
   * @throws {AppError} If credentials are invalid
   */
  login(username: string, password: string): Promise<TokenResponse>;

  /**
   * Validate an access token
   * @throws {AppError} If token is invalid or expired
   */
  validateToken(token: string): Promise<TokenPayload>;

  /**
   * Generate new access/refresh tokens using a refresh token
   * @throws {AppError} If refresh token is invalid or expired
   */
  refreshToken(refreshToken: string): Promise<TokenResponse>;

  /**
   * Invalidate all tokens for a user
   */
  logout(userId: string): Promise<void>;
}