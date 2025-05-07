import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IAuthService } from '../services/interfaces/IAuthService';
import { SERVICE_TOKENS } from '../config/services';
import { AppError } from '../utils/AppError';
import { MockAuthService } from '../mocks/services/MockAuthService';

@injectable()
export class AuthController {
  constructor(
    @inject(SERVICE_TOKENS.AUTH_SERVICE)
    private authService: IAuthService
  ) {}

  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
    
    try {
      const user = await this.authService.register(username, email, password);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Registration failed', 500);
    }
  }

  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      const response = await this.authService.login(username, password);
      return res.json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    try {
      const response = await this.authService.refreshToken(refreshToken);
      return res.json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Token refresh failed', 500);
    }
  }

  async logout(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    try {
      await this.authService.logout(userId);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Logout failed', 500);
    }
  }
}

export const authController = new AuthController(new MockAuthService());