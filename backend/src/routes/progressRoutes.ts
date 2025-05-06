import { Router } from 'express';
import { gameProgressController } from '../controllers/GameProgressController';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { generalRateLimiter } from '../middlewares/rateLimitMiddleware';
import { progressSchemas } from '../validators/schemas';

const progressRoutes = Router();

progressRoutes.post(
  '/saves',
  AuthMiddleware,
  generalRateLimiter,
  validate(progressSchemas.saveProgress),
  gameProgressController.saveProgress
);

progressRoutes.get(
  '/saves/:saveSlot',
  AuthMiddleware,
  validate(progressSchemas.loadProgress),
  gameProgressController.loadProgress
);

progressRoutes.get(
  '/saves',
  AuthMiddleware,
  gameProgressController.listSaves
);

progressRoutes.delete(
  '/saves/:saveSlot',
  AuthMiddleware,
  validate(progressSchemas.loadProgress),
  gameProgressController.deleteProgress
);

export { progressRoutes };