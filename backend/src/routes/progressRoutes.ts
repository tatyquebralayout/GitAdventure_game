import { Router, RequestHandler } from 'express';
import { gameProgressController } from '../controllers/GameProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de progresso exigem autenticação
router.use(authMiddleware);

// Fix TypeScript errors by casting controller methods to RequestHandler type
router.post('/save', gameProgressController.saveProgress as unknown as RequestHandler);
router.get('/load/:saveSlot', gameProgressController.loadProgress as unknown as RequestHandler);
router.get('/list', gameProgressController.listSaves as unknown as RequestHandler);
router.delete('/delete/:saveSlot', gameProgressController.deleteProgress as unknown as RequestHandler);

export default router;