import { Router } from 'express';
import { worldController } from '../controllers/WorldController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const worldRoutes = Router();

// Rotas públicas
worldRoutes.get('/worlds', worldController.getAll);
worldRoutes.get('/worlds/:id', worldController.getById);
worldRoutes.get('/worlds/:id/quests', worldController.getWorldQuests);

// Rotas protegidas
worldRoutes.post('/worlds/:id/start', AuthMiddleware, worldController.startWorld);
worldRoutes.post('/worlds/:id/complete', AuthMiddleware, worldController.completeWorld);

export { worldRoutes };