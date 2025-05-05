import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/AuthController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Rotas públicas
router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  authController.register(req, res, next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  authController.login(req, res, next);
});

router.post('/refresh-token', (req: Request, res: Response, next: NextFunction) => {
  authController.refreshToken(req, res, next);
});

// Rotas protegidas
router.post('/logout', protect, (req: Request, res: Response, next: NextFunction) => {
  authController.logout(req, res, next);
});

router.get('/profile', protect, (req: Request, res: Response, next: NextFunction) => {
  authController.getProfile(req, res, next);
});

export default router;