import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserToken } from '../entities/UserToken';
import { AppError } from '../utils/AppError';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

export class AuthService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly userTokenRepository = AppDataSource.getRepository(UserToken);
  private readonly jwtSecret = process.env.JWT_SECRET as Secret;
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

  private generateAccessToken(userId: string): string {
    return jwt.sign({ id: userId }, this.jwtSecret, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, this.jwtRefreshSecret, { expiresIn: '7d' });
  }

  private async saveUserTokens(userId: string, accessToken: string, refreshToken: string): Promise<void> {
    const userToken = this.userTokenRepository.create({
      userId,
      accessToken,
      refreshToken
    });
    await this.userTokenRepository.save(userToken);
  }

  async register(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    // Verificar se usuário já existe
    const userExists = await this.userRepository.findOne({
      where: [{ username }, { email }]
    });

    if (userExists) {
      throw new AppError('Usuário ou e-mail já existe', 400);
    }

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // Retornar usuário sem senha
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    // Buscar usuário
    const user = await this.userRepository.findOne({ 
      where: { username },
      select: ['id', 'username', 'email', 'password', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Gerar tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    
    // Salvar tokens
    await this.saveUserTokens(user.id, accessToken, refreshToken);

    // Retornar resposta sem a senha
    const { password: _unused, ...userWithoutPassword } = user;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verificar se o refresh token é válido
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as { id: string };
      
      // Buscar token no banco
      const userToken = await this.userTokenRepository.findOne({
        where: { userId: decoded.id, refreshToken }
      });

      if (!userToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Gerar novo access token
      const newAccessToken = this.generateAccessToken(decoded.id);

      // Atualizar token no banco
      userToken.accessToken = newAccessToken;
      await this.userTokenRepository.save(userToken);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    // Remover todos os tokens do usuário
    await this.userTokenRepository.delete({ userId });
  }

  async getUserProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'createdAt', 'updatedAt']
    });

    if (!user) return null;
    return user;
  }
}

export const authService = new AuthService();