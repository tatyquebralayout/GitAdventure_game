import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserToken } from '../entities/UserToken';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private tokenRepository = AppDataSource.getRepository(UserToken);
  
  private JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  private JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private JWT_REFRESH_SECRET = `${this.JWT_SECRET}_refresh`;
  private JWT_REFRESH_EXPIRES_IN = '30d';

  /**
   * Registra um novo usuário
   */
  async register(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    // Verificar se usuário já existe
    const userExists = await this.userRepository.findOne({
      where: [{ username }, { email }]
    });

    if (userExists) {
      throw new Error('Usuário ou e-mail já existe');
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

  /**
   * Login de usuário
   */
  async login(username: string, password: string): Promise<TokenResponse> {
    // Buscar usuário
    const user = await this.userRepository.findOne({ 
      where: { username },
      select: ['id', 'username', 'email', 'password', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    
    // Salvar tokens
    await this.saveUserTokens(user.id, accessToken, refreshToken);

    // Retornar resposta sem a senha
    const { password: _, ...userWithoutPassword } = user;
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  /**
   * Renovar token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verificar o token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { id: string };
      
      // Buscar token no banco de dados
      const userToken = await this.tokenRepository.findOne({
        where: { refreshToken },
        relations: ['user']
      });

      if (!userToken) {
        throw new Error('Token inválido');
      }

      // Gerar novos tokens
      const accessToken = this.generateAccessToken(decoded.id);
      const newRefreshToken = this.generateRefreshToken(decoded.id);
      
      // Atualizar tokens
      userToken.accessToken = accessToken;
      userToken.refreshToken = newRefreshToken;
      await this.tokenRepository.save(userToken);

      // Retornar resposta
      const { password: _password, ...userWithoutPassword } = userToken.user;
      
      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: userWithoutPassword
      };
    } catch (_error) {
      throw new Error('Erro ao renovar token');
    }
  }

  /**
   * Logout de usuário (revoga os tokens)
   */
  async logout(userId: string): Promise<void> {
    await this.tokenRepository.delete({ userId });
  }

  /**
   * Obter perfil do usuário
   */
  async getUserProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    // Retornar usuário sem a senha
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  /**
   * Gerar token de acesso
   */
  private generateAccessToken(userId: string): string {
    return jwt.sign({ id: userId }, this.JWT_SECRET as jwt.Secret, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  /**
   * Gerar refresh token
   */
  private generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, this.JWT_REFRESH_SECRET as jwt.Secret, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN
    });
  }

  /**
   * Salvar tokens do usuário
   */
  private async saveUserTokens(userId: string, accessToken: string, refreshToken: string): Promise<void> {
    // Remover tokens antigos
    await this.tokenRepository.delete({ userId });

    // Criar novo registro
    const userToken = this.tokenRepository.create({
      userId,
      accessToken,
      refreshToken
    });

    await this.tokenRepository.save(userToken);
  }
}

export const authService = new AuthService(); 