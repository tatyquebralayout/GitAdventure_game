import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserToken } from '../entities/UserToken';
import { TokenResponse, TokenPayload } from '../types/auth';
import { AppError } from '../utils/AppError';
import { IAuthService } from './interfaces/IAuthService';

@injectable()
export class AuthService implements IAuthService {
  private userRepository = AppDataSource.getRepository(User);
  private tokenRepository = AppDataSource.getRepository(UserToken);
  private readonly jwtSecret = process.env.JWT_SECRET || 'default-secret-key';

  async register(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }]
    });

    if (existingUser) {
      throw new AppError('Username or email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      experience: 0,
      level: 1
    });

    await this.userRepository.save(user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    const user = await this.userRepository.findOne({
      where: { username }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' });

    const userToken = this.tokenRepository.create({
      userId: user.id,
      accessToken,
      refreshToken
    });

    await this.tokenRepository.save(userToken);
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new AppError('User not found', 401);
      }

      return decoded;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const userToken = await this.tokenRepository.findOne({
      where: { refreshToken },
      relations: ['user']
    });

    if (!userToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const newAccessToken = jwt.sign({ userId: userToken.userId }, this.jwtSecret, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId: userToken.userId }, this.jwtSecret, { expiresIn: '7d' });

    userToken.accessToken = newAccessToken;
    userToken.refreshToken = newRefreshToken;
    await this.tokenRepository.save(userToken);

    const { password: _, ...userWithoutPassword } = userToken.user;
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userWithoutPassword
    };
  }

  async logout(userId: string): Promise<void> {
    await this.tokenRepository.delete({ userId });
  }
}