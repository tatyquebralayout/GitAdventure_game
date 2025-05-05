import { Router, RequestHandler } from 'express';
import { gameProgressController } from '../controllers/GameProgressController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticação para todas as rotas
router.use(protect);

// Fix TypeScript errors by casting controller methods to RequestHandler type
router.post('/save', gameProgressController.saveProgress as unknown as RequestHandler);
router.get('/load/:saveSlot', gameProgressController.loadProgress as unknown as RequestHandler);
router.get('/list', gameProgressController.listSaves as unknown as RequestHandler);
router.delete('/delete/:saveSlot', gameProgressController.deleteProgress as unknown as RequestHandler);

export default router;