import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AppError } from '../utils/AppError';

export class AuthController {
  constructor(private authService = new AuthService()) {}

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios'
        });
        return;
      }

      const user = await this.authService.register(username, email, password);

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        user
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);

      if (error instanceof Error && error.message.includes('já existe')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Nome de usuário e senha são obrigatórios'
        });
        return;
      }

      const { accessToken, refreshToken, user } = await this.authService.login(username, password);

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        accessToken,
        refreshToken,
        user
      });
    } catch (error) {
      console.error('Erro ao realizar login:', error);

      if (error instanceof Error && error.message.includes('Credenciais inválidas')) {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
        return;
      }

      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }
      const result = await this.authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Não autorizado'
        });
        return;
      }

      await this.authService.logout(userId);

      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
      next(error);
    }
  }

  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Não autorizado'
        });
        return;
      }

      const user = await this.authService.getUserProfile(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      next(error);
    }
  }
}