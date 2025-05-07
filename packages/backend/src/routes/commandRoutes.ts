import { Router } from 'express';
import { commandController } from '../controllers/CommandController';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { gitCommandRateLimiter } from '../middlewares/rateLimitMiddleware';
import { commandSchemas } from '../validators/schemas';

const commandRoutes = Router();

/**
 * @openapi
 * /api/commands/validate:
 *   post:
 *     tags:
 *       - Git Commands
 *     summary: Validate a Git command for a quest step
 *     description: Validates a Git command against the requirements of a specific quest step
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *               - questId
 *             properties:
 *               command:
 *                 type: string
 *                 description: The Git command to validate
 *                 example: "git init"
 *               questId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the quest
 *               currentStep:
 *                 type: number
 *                 description: The current step number in the quest
 *                 example: 1
 *     responses:
 *       200:
 *         description: Command validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 nextStep:
 *                   type: number
 *                 commandName:
 *                   type: string
 *                 isQuestCompleted:
 *                   type: boolean
 *                 details:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: number
 *                     timeSpent:
 *                       type: number
 *                     attempts:
 *                       type: number
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - user not authenticated
 *       429:
 *         description: Too many requests - rate limit exceeded
 */
commandRoutes.post(
  '/validate',
  AuthMiddleware,
  gitCommandRateLimiter,
  validate(commandSchemas.validateCommand),
  commandController.validateCommand
);

export { commandRoutes };