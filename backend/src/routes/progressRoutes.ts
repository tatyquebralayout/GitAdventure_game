import { Router, Request, Response } from 'express';
import { gameProgressController } from '../controllers/GameProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de progresso exigem autenticação
router.use(authMiddleware);

// Use explicit type annotations like in authRoutes.ts
router.post('/save', (req: Request, res: Response) => gameProgressController.saveProgress(req, res));
router.get('/load/:saveSlot', (req: Request, res: Response) => gameProgressController.loadProgress(req, res));
router.get('/list', (req: Request, res: Response) => gameProgressController.listSaves(req, res));
router.delete('/delete/:saveSlot', (req: Request, res: Response) => gameProgressController.deleteProgress(req, res));

export default router;