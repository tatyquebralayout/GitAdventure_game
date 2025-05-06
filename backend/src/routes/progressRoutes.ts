import { Router } from 'express';
import { gameProgressController } from '../controllers/GameProgressController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const progressRoutes = Router();

// Wrap controller methods in standard Express handlers
progressRoutes.get('/saves', AuthMiddleware, (req, res, next) => gameProgressController.listSaves(req, res, next));
progressRoutes.get('/saves/:saveSlot', AuthMiddleware, (req, res, next) => gameProgressController.loadProgress(req, res, next));
progressRoutes.post('/saves', AuthMiddleware, (req, res, next) => gameProgressController.saveProgress(req, res, next));
progressRoutes.delete('/saves/:saveSlot', AuthMiddleware, (req, res, next) => gameProgressController.deleteProgress(req, res, next));

export { progressRoutes };