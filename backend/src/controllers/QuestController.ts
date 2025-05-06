import { Request, Response, NextFunction } from 'express';
import { questService, QuestService } from '../services/QuestService';
import { AppError } from '../utils/AppError';

export class QuestController {
  constructor(private questService: QuestService = questService) {}

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const quest = await this.questService.getQuestById(id);

      if (!quest) {
        throw new AppError('Quest not found', 404);
      }

      res.json({ success: true, quest });
    } catch (error) {
      next(error);
    }
  }

  public async getQuestNarratives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const narratives = await this.questService.getQuestNarratives(id);
      res.json({ success: true, narratives });
    } catch (error) {
      next(error);
    }
  }

  public async getQuestCommandSteps(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const steps = await this.questService.getQuestCommandSteps(id);
      res.json({ success: true, steps });
    } catch (error) {
      next(error);
    }
  }

  public async startQuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: questId } = req.params;
      const { worldId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      if (!worldId) {
        throw new AppError('World ID is required', 400);
      }

      const playerQuest = await this.questService.startQuest(userId, worldId, questId);
      res.json({ success: true, playerQuest });
    } catch (error) {
      next(error);
    }
  }

  public async completeQuestStep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questId, stepId } = req.params;
      const { command } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      if (!command) {
        throw new AppError('Command is required', 400);
      }

      const result = await this.questService.completeQuestStep(userId, questId, stepId, command);
      res.json({ success: true, result });
    } catch (error) {
      next(error);
    }
  }

  public async completeQuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: questId } = req.params;
      const { worldId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      if (!worldId) {
        throw new AppError('World ID is required', 400);
      }

      const playerQuest = await this.questService.completeQuest(userId, worldId, questId);
      res.json({ success: true, playerQuest });
    } catch (error) {
      next(error);
    }
  }
}

export const questController = new QuestController();