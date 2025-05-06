import { Request, Response, NextFunction } from 'express';
import { questService, QuestService } from '../services/QuestService';

export class QuestController {
  constructor(private questService: QuestService = questService) {}

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const quest = await this.questService.getQuestById(id);

      if (!quest) {
        throw new Error('Quest não encontrada');
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
        throw new Error('Usuário não autenticado');
      }

      if (!worldId) {
        throw new Error('ID do mundo é obrigatório');
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
        throw new Error('Usuário não autenticado');
      }

      if (!command) {
        throw new Error('Comando é obrigatório');
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
        throw new Error('Usuário não autenticado');
      }

      if (!worldId) {
        throw new Error('ID do mundo é obrigatório');
      }

      const playerQuest = await this.questService.completeQuest(userId, worldId, questId);
      res.json({ success: true, playerQuest });
    } catch (error) {
      next(error);
    }
  }
}

export const questController = new QuestController();