import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const authRoutes = Router();
const authController = new AuthController();

// Public routes
authRoutes.post('/register', (req, res, next) => authController.register(req, res, next));
authRoutes.post('/login', (req, res, next) => authController.login(req, res, next));
authRoutes.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));

// Protected routes
authRoutes.post('/logout', AuthMiddleware, (req, res, next) => authController.logout(req, res, next));
authRoutes.get('/profile', AuthMiddleware, (req, res, next) => authController.getProfile(req, res, next));

export { authRoutes };