import { User } from '../entities/User';

/**
 * Payload stored in JWT tokens
 */
export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Response returned from login and token refresh operations
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

/**
 * Registration request data
 */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

/**
 * Login request data
 */
export interface LoginData {
  username: string;
  password: string;
}

/**
 * Token refresh request data
 */
export interface RefreshTokenData {
  refreshToken: string;
}