import { Router } from 'express';
import { questController } from '../controllers/QuestController';
import { authMiddleware } from '../middlewares/authMiddleware';

const questRoutes = Router();

// Rotas públicas
questRoutes.get('/quests/:id', questController.getById);
questRoutes.get('/quests/:id/narratives', questController.getQuestNarratives);
questRoutes.get('/quests/:id/steps', questController.getQuestCommandSteps);

// Rotas protegidas
questRoutes.post('/quests/:id/start', authMiddleware, questController.startQuest);
questRoutes.post('/quests/:id/steps/:stepId/complete', authMiddleware, questController.completeQuestStep);
questRoutes.post('/quests/:id/complete', authMiddleware, questController.completeQuest);

export { questRoutes };