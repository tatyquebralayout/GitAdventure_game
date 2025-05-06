import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { authRateLimiter } from '../middlewares/rateLimitMiddleware';
import { authSchemas } from '../validators/schemas';

const authRoutes = Router();

authRoutes.post(
  '/register', 
  validate(authSchemas.register),
  authController.register
);

authRoutes.post(
  '/login',
  authRateLimiter,
  validate(authSchemas.login),
  authController.login
);

authRoutes.post(
  '/refresh-token',
  validate(authSchemas.refreshToken),
  authController.refreshToken
);

authRoutes.post(
  '/logout',
  AuthMiddleware,
  authController.logout
);

authRoutes.get(
  '/profile',
  AuthMiddleware,
  authController.getProfile
);

export { authRoutes };