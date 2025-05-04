import { Router } from 'express';
import { commandController } from '../controllers/CommandController';

const router = Router();

// POST /api/commands - validate a command
router.post('/', commandController.validateCommand);

export default router;