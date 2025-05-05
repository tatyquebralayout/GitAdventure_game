import { Request, Response } from 'express';
import { questService } from '../services/QuestService';

export class QuestController {
  /**
   * Obter quest por ID
   */
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const quest = await questService.getQuestById(id);
      
      if (!quest) {
        return res.status(404).json({ success: false, message: 'Quest não encontrada' });
      }

      return res.json({ success: true, quest });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Obter narrativa da quest
   */
  async getQuestNarratives(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const narratives = await questService.getQuestNarratives(id);
      return res.json({ success: true, narratives });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Obter passos de comando da quest
   */
  async getQuestCommandSteps(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const steps = await questService.getQuestCommandSteps(id);
      return res.json({ success: true, steps });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Iniciar uma quest para o jogador
   */
  async startQuest(req: Request, res: Response): Promise<Response> {
    try {
      const { id: questId } = req.params;
      const { worldId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!worldId) {
        return res.status(400).json({ success: false, message: 'ID do mundo é obrigatório' });
      }

      const playerQuest = await questService.startQuest(userId, worldId, questId);
      return res.json({ success: true, playerQuest });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Completar um passo de quest
   */
  async completeQuestStep(req: Request, res: Response): Promise<Response> {
    try {
      const { questId, stepId } = req.params;
      const { command } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!command) {
        return res.status(400).json({ success: false, message: 'Comando é obrigatório' });
      }

      const result = await questService.completeQuestStep(userId, questId, stepId, command);
      return res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Completar uma quest
   */
  async completeQuest(req: Request, res: Response): Promise<Response> {
    try {
      const { id: questId } = req.params;
      const { worldId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      if (!worldId) {
        return res.status(400).json({ success: false, message: 'ID do mundo é obrigatório' });
      }

      const playerQuest = await questService.completeQuest(userId, worldId, questId);
      return res.json({ success: true, playerQuest });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
    }
  }
}

export const questController = new QuestController();