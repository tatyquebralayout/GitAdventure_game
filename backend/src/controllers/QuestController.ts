import { Request, Response, NextFunction } from 'express';
import { questService } from '../services/QuestService';

export class QuestController {
  /**
   * Obter quest por ID
   */
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const quest = await questService.getQuestById(id);

      if (!quest) {
        throw new Error('Quest não encontrada');
      }

      res.json({ success: true, quest });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter narrativa da quest
   */
  public async getQuestNarratives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const narratives = await questService.getQuestNarratives(id);
      res.json({ success: true, narratives });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter passos de comando da quest
   */
  public async getQuestCommandSteps(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const steps = await questService.getQuestCommandSteps(id);
      res.json({ success: true, steps });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Iniciar uma quest para o jogador
   */
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

      const playerQuest = await questService.startQuest(userId, worldId, questId);
      res.json({ success: true, playerQuest });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Completar um passo de quest
   */
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

      const result = await questService.completeQuestStep(userId, questId, stepId, command);
      res.json({ success: true, result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Completar uma quest
   */
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

      const playerQuest = await questService.completeQuest(userId, worldId, questId);
      res.json({ success: true, playerQuest });
    } catch (error) {
      next(error);
    }
  }
}

export const questController = new QuestController();