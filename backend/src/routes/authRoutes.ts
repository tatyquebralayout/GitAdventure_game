import { Router, Request, Response } from 'express';
import { authController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rotas públicas
router.post('/register', (req: Request, res: Response) => authController.register(req, res));
router.post('/login', (req: Request, res: Response) => authController.login(req, res));

// Rotas protegidas
router.get('/profile', authMiddleware, (req: Request, res: Response) => authController.getProfile(req, res));

export default router;