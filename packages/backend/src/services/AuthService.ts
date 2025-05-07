import { injectable } from 'tsyringe';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserToken } from '../entities/UserToken';
import { IAuthService } from './interfaces/IAuthService';
import { TokenResponse, TokenPayload } from '@shared/types';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@injectable()
export class AuthService implements IAuthService {
  private userRepository = AppDataSource.getRepository(User);
  private tokenRepository = AppDataSource.getRepository(UserToken);
  private jwtSecret = process.env.JWT_SECRET || 'development-secret-key';

  /**
   * Register a new user
   * @throws {AppError} If username or email already exists
   */
  async register(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    // Verificar se usuário já existe
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }]
    });

    if (existingUser) {
      throw new AppError('Username or email already exists', 400);
    }

    // Hash da senha antes de armazenar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar e salvar novo usuário
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword
    });

    await this.userRepository.save(user);

    // Não retornar a senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate a user and generate access/refresh tokens
   * @throws {AppError} If credentials are invalid
   */
  async login(username: string, password: string): Promise<TokenResponse> {
    // Buscar usuário incluindo a senha (que é excluída por padrão)
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password', 'experience', 'level', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Gerar tokens
    const accessToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' });

    // Salvar token de refresh
    const userToken = this.tokenRepository.create({
      userId: user.id,
      accessToken,
      refreshToken
    });
    await this.tokenRepository.save(userToken);

    // Preparar resposta sem a senha
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  /**
   * Validate an access token
   * @throws {AppError} If token is invalid or expired
   */
  async validateToken(token: string): Promise<TokenPayload> {
    try {
      // Verificar token
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      
      // Verificar se o usuário ainda existe
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return decoded;
    } catch (error) {
      // Tratar erros específicos do JWT
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      }
      
      // Repassar outros erros
      throw error;
    }
  }

  /**
   * Generate new access/refresh tokens using a refresh token
   * @throws {AppError} If refresh token is invalid or expired
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    // Buscar o token de refresh
    const userToken = await this.tokenRepository.findOne({
      where: { refreshToken },
      relations: ['user']
    });

    if (!userToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Verificar se o token ainda é válido
    try {
      jwt.verify(refreshToken, this.jwtSecret);
    } catch (error) {
      // Se o token expirou, remover e exigir login
      await this.tokenRepository.delete({ id: userToken.id });
      
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401);
      }
      
      throw new AppError('Invalid refresh token', 401);
    }

    // Gerar novos tokens
    const accessToken = jwt.sign({ userId: userToken.userId }, this.jwtSecret, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId: userToken.userId }, this.jwtSecret, { expiresIn: '7d' });

    // Atualizar token no banco
    userToken.accessToken = accessToken;
    userToken.refreshToken = newRefreshToken;
    await this.tokenRepository.save(userToken);

    // Preparar resposta sem a senha
    const { password: _, ...userWithoutPassword } = userToken.user;
    
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: userWithoutPassword
    };
  }

  /**
   * Invalidate all tokens for a user
   */
  async logout(userId: string): Promise<void> {
    // Remover todos os tokens do usuário
    await this.tokenRepository.delete({ userId });
  }
}
