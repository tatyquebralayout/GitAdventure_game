import { Router } from 'express';
import { questController } from '../controllers/QuestController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rotas públicas
router.get('/', questController.getAllQuests);
router.get('/:id', questController.getQuestById);

// Rotas protegidas (requerem autenticação)
router.get('/user/progress', authMiddleware, questController.getUserProgress);
router.get('/user/progress/:questId', authMiddleware, questController.getUserQuestProgress);
router.post('/start', authMiddleware, questController.startQuest);
router.get('/:questId/steps', authMiddleware, questController.getQuestSteps);

export default router;