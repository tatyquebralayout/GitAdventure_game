import { Router, Request, Response } from 'express';
import { commandController } from '../controllers/CommandController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Adicionar middleware de autenticação para proteger a rota
router.post('/validate', protect, (req: Request, res: Response) => commandController.validateCommand(req, res));

export default router;