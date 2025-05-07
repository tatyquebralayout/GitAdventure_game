import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuthService } from '../services/AuthService';
import { AppError } from '../utils/AppError';

// Module augmentation para Express Request
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      username: string;
    };
  }
}

export const AuthMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não fornecido', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const authService = container.resolve(AuthService);
    const user = await authService.validateToken(token);
    
    req.user = {
      id: user.id,
      username: user.username
    };

    return next();
  } catch (error) {
    throw new AppError('Token inválido', 401);
  }
};