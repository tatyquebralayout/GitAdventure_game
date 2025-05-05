import { Router } from 'express';
import { commandController } from '../controllers/CommandController';
import { protect } from '../middlewares/authMiddleware';

const commandRoutes = Router();

// Rota para validar comando - protegida por autenticação
commandRoutes.post('/commands/validate', protect, commandController.validateCommand);

export { commandRoutes };