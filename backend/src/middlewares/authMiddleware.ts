import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extensão do tipo Request para incluir o userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
): Response | void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido' 
    });
  }

  // Formato esperado: Bearer token
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ 
      success: false, 
      message: 'Formato de token inválido' 
    });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Formato de token inválido' 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    // Adiciona o ID do usuário ao objeto de requisição
    req.userId = decoded.id;
    
    return next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};