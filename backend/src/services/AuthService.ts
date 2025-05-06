import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken'; // Import Secret, SignOptions
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserToken } from '../entities/UserToken';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

export class AuthService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly tokenRepository = AppDataSource.getRepository(UserToken);
  
  // Define secrets and expiration times with correct types
  private readonly JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback_secret';
  private readonly JWT_REFRESH_SECRET: Secret = `${this.JWT_SECRET}_refresh`;
  private readonly JWT_EXPIRES_IN: SignOptions['expiresIn'] = process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'] || '7d';
  private readonly JWT_REFRESH_EXPIRES_IN: SignOptions['expiresIn'] = process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] || '30d';

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
    const { password: _unused, ...userWithoutPassword } = user;
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
      const { password: _unused, ...userWithoutPassword } = userToken.user;
      
      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: userWithoutPassword
      };
    } catch {
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
    const { password: _unused, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  /**
   * Gerar token de acesso
   */
  private generateAccessToken(userId: string): string {
    const payload = { id: userId };
    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN,
    };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Gerar refresh token
   */
  private generateRefreshToken(userId: string): string {
    const payload = { id: userId };
    const options: SignOptions = {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    };
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, options);
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