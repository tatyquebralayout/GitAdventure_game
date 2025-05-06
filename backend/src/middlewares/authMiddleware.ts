import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';

// Define the structure of the JWT payload
interface JwtPayload {
  id: string;
}

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Ensure the function is exported with the name 'AuthMiddleware'
export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided or token format is invalid', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as JwtPayload;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      return next(new AppError('User not found for the provided token', 401));
    }

    req.user = user; // Attach user to the request object
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
     if (error instanceof jwt.TokenExpiredError) {
       return next(new AppError('Token expired', 401));
     }
    next(new AppError('Failed to authenticate token', 500));
  }
};