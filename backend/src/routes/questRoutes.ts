import { Router } from 'express';
import { QuestController } from '../controllers/QuestController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const questRoutes = Router();
const questController = new QuestController();

// Public routes
questRoutes.get('/quests/:id', questController.getById);
questRoutes.get('/quests/:id/narratives', questController.getQuestNarratives);
questRoutes.get('/quests/:id/steps', questController.getQuestCommandSteps);

// Protected routes
questRoutes.post('/quests/:id/start', AuthMiddleware, questController.startQuest);
questRoutes.post('/quests/:id/steps/:stepId/complete', AuthMiddleware, questController.completeQuestStep);
questRoutes.post('/quests/:id/complete', AuthMiddleware, questController.completeQuest);

export { questRoutes };