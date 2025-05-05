import { Router } from 'express';
import { worldController } from '../controllers/WorldController';
import { authMiddleware } from '../middlewares/authMiddleware';

const worldRoutes = Router();

// Rotas públicas
worldRoutes.get('/worlds', worldController.getAll);
worldRoutes.get('/worlds/:id', worldController.getById);
worldRoutes.get('/worlds/:id/quests', worldController.getWorldQuests);

// Rotas protegidas
worldRoutes.post('/worlds/:id/start', authMiddleware, worldController.startWorld);
worldRoutes.post('/worlds/:id/complete', authMiddleware, worldController.completeWorld);

export { worldRoutes };