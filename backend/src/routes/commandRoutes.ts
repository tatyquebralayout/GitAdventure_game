import { Router } from 'express';
import { commandController } from '../controllers/CommandController';
// Fix: Import AuthMiddleware instead of protect
import { AuthMiddleware } from '../middlewares/authMiddleware';

const commandRoutes = Router();

// Fix: Use AuthMiddleware
commandRoutes.post('/validate', AuthMiddleware, commandController.validateCommand);

export { commandRoutes };