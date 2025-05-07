import { Router } from 'express';
import { gameProgressController } from '../controllers/GameProgressController';
// import { AuthMiddleware } from '../middlewares/authMiddleware';
// import { validate } from '../middlewares/validationMiddleware';
// import { generalRateLimiter } from '../middlewares/rateLimitMiddleware';
// import { progressSchemas } from '../validators/schemas';

const progressRoutes = Router();

progressRoutes.post(
  '/saves',
  // AuthMiddleware,
  // generalRateLimiter,
  // validate(progressSchemas.saveProgress),
  (req, res, next) => gameProgressController.saveProgress(req, res, next)
);

progressRoutes.get(
  '/saves/:saveSlot',
  // AuthMiddleware,
  // validate(progressSchemas.loadProgress),
  (req, res, next) => gameProgressController.loadProgress(req, res, next)
);

progressRoutes.get(
  '/saves',
  // AuthMiddleware,
  (req, res, next) => gameProgressController.listSaves(req, res, next)
);

progressRoutes.delete(
  '/saves/:saveSlot',
  // AuthMiddleware,
  // validate(progressSchemas.loadProgress),
  (req, res, next) => gameProgressController.deleteProgress(req, res, next)
);

export { progressRoutes };