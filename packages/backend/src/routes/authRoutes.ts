import { Router } from 'express';
import { authController } from '../controllers/AuthController';
// import { AuthMiddleware } from '../middlewares/authMiddleware';
// import { validate } from '../middlewares/validationMiddleware';
// import { authRateLimiter } from '../middlewares/rateLimitMiddleware';
// import { authSchemas } from '../validators/schemas';

const authRoutes = Router();

authRoutes.post(
  '/register', 
  // validate(authSchemas.register),
  (req, res, next) => authController.register(req, res, next)
);

authRoutes.post(
  '/login',
  // authRateLimiter,
  // validate(authSchemas.login),
  (req, res, next) => authController.login(req, res, next)
);

authRoutes.post(
  '/refresh-token',
  // validate(authSchemas.refreshToken),
  (req, res, next) => authController.refreshToken(req, res, next)
);

authRoutes.post(
  '/logout',
  // AuthMiddleware,
  (req, res, next) => authController.logout(req, res, next)
);

authRoutes.get(
  '/profile',
  // AuthMiddleware,
  (req, res, next) => authController.getProfile(req, res, next)
);

export { authRoutes };