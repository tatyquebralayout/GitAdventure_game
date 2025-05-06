import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { User } from '../entities/User';
import { UserToken } from '../entities/UserToken';
import { AppError } from '../utils/AppError';

interface TokenPayload {
  id: string;
  username: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

@injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'default-secret';
  private readonly jwtExpiresIn = '1h';
  private readonly refreshTokenExpiresIn = '7d';

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<Omit<User, 'password'>> {
    // Mock: Validação básica
    if (!username || !email || !password) {
      throw new AppError('Dados inválidos', 400);
    }

    // Mock: Verificação de usuário existente
    if (username === 'existing_user') {
      throw new AppError('Usuário já existe', 409);
    }

    // Mock: Criação do usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.id = 'mock-user-id';
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    user.experience = 0;
    user.level = 1;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    // Remove a senha antes de retornar
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    // Mock: Validação básica
    if (!username || !password) {
      throw new AppError('Credenciais inválidas', 400);
    }

    // Mock: Usuário fixo para testes
    const mockUser: User = {
      id: 'mock-user-id',
      username: 'test_user',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      experience: 0,
      level: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      tokens: [],
      playerWorlds: [],
      progress: []
    };

    // Verifica se as credenciais correspondem
    if (username !== mockUser.username || !await bcrypt.compare(password, mockUser.password)) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Gera tokens
    const accessToken = this.generateAccessToken(mockUser);
    const refreshToken = this.generateRefreshToken(mockUser);

    // Mock: Salva o refresh token
    const userToken = new UserToken();
    userToken.userId = mockUser.id;
    userToken.accessToken = accessToken;
    userToken.refreshToken = refreshToken;

    // Remove a senha antes de retornar
    const { password: _, ...userWithoutPassword } = mockUser;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expirado', 401);
      }
      throw new AppError('Token inválido', 401);
    }
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      { id: user.id, username: user.username },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id, username: user.username },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiresIn }
    );
  }
}