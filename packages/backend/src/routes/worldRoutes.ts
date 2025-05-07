import { Router } from 'express';
import { worldController } from '../controllers/WorldController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const worldRoutes = Router();

// Rotas públicas
worldRoutes.get('/worlds', (req, res, next) => worldController.getAll(req, res, next));
worldRoutes.get('/worlds/:id', (req, res, next) => worldController.getById(req, res, next));
worldRoutes.get('/worlds/:id/quests', (req, res, next) => worldController.getWorldQuests(req, res, next));

// Rotas protegidas
worldRoutes.post('/worlds/:id/start', AuthMiddleware, (req, res, next) => worldController.startWorld(req, res, next));
worldRoutes.post('/worlds/:id/complete', AuthMiddleware, (req, res, next) => worldController.completeWorld(req, res, next));

export { worldRoutes };