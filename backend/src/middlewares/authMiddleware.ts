import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { UserToken } from '../entities/UserToken';

// Define a type for the decoded user payload
interface UserPayload {
  id: string;
  isAdmin?: boolean;
  // Adicione outras propriedades conforme necessário
}

// Estender a interface Request do Express
// Usar module augmentation em vez de namespace global
declare module 'express' {
  interface Request {
    user?: UserPayload;
    userId?: string;
  }
}

/**
 * Middleware de proteção para rotas que exigem autenticação
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar o token
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as UserPayload;

      // Verificar se o token está no banco de dados
      const tokenRepository = AppDataSource.getRepository(UserToken);
      const userToken = await tokenRepository.findOne({
        where: { accessToken: token },
        relations: ['user']
      });

      if (!userToken) {
        throw new Error('Token inválido ou expirado');
      }

      // Adicionar usuário à requisição
      req.user = decoded;
      req.userId = decoded.id;
      
      next();
    } else {
      res.status(401).json({ message: 'Não autorizado, token não fornecido' });
    }
  } catch (error) {
    console.error('Falha na verificação do token:', error);
    res.status(401).json({ message: 'Não autorizado, token inválido' });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 */
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
  }
};

// Example of an admin check middleware (if needed)
/*
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) { // Assuming isAdmin property exists in payload
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
*/

// Remove the unused error handler function
/*
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};
*/