import { Router } from 'express';
import { questController } from '../controllers/QuestController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const questRoutes = Router();

// Public routes
questRoutes.get('/quests/:id', questController.getById.bind(questController));
questRoutes.get('/quests/:id/narratives', questController.getQuestNarratives.bind(questController));
questRoutes.get('/quests/:id/steps', questController.getQuestCommandSteps.bind(questController));

// Protected routes
questRoutes.post('/quests/:id/start', AuthMiddleware, questController.startQuest.bind(questController));
questRoutes.post('/quests/:id/steps/:stepId/complete', AuthMiddleware, questController.completeQuestStep.bind(questController));
questRoutes.post('/quests/:id/complete', AuthMiddleware, questController.completeQuest.bind(questController));

export { questRoutes };