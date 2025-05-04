import { Router } from 'express';
import { gameProgressController } from '../controllers/GameProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de progresso exigem autenticação
router.use(authMiddleware);

router.post('/save', gameProgressController.saveProgress);
router.get('/load/:saveSlot', gameProgressController.loadProgress);
router.get('/list', gameProgressController.listSaves);
router.delete('/delete/:saveSlot', gameProgressController.deleteProgress);

export default router;