import { Router } from 'express';
import { commandController } from '../controllers/CommandController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Adicionar middleware de autenticação para proteger a rota
router.post('/validate', authMiddleware, commandController.validateCommand);

export default router;