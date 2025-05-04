import { Request, Response } from 'express';
import { questService } from '../services/QuestService';

export class QuestController {
  // Listar todas as quests disponíveis
  public async getAllQuests(req: Request, res: Response): Promise<void> {
    try {
      const quests = await questService.getAllQuests();
      
      res.status(200).json({
        success: true,
        data: quests
      });
    } catch (error) {
      console.error('Erro ao buscar quests:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar quests'
      });
    }
  }

  // Buscar uma quest específica por ID
  public async getQuestById(req: Request, res: Response): Promise<void> {
    try {
      const questId = parseInt(req.params.id);
      
      if (isNaN(questId)) {
        res.status(400).json({
          success: false,
          message: 'ID da quest inválido'
        });
        return;
      }
      
      const quest = await questService.getQuestById(questId);
      
      if (!quest) {
        res.status(404).json({
          success: false,
          message: 'Quest não encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: quest
      });
    } catch (error) {
      console.error('Erro ao buscar quest:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar quest'
      });
    }
  }

  // Buscar progresso do usuário em todas as quests
  public async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }
      
      const progress = await questService.getUserProgress(userId);
      
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Erro ao buscar progresso do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar progresso do usuário'
      });
    }
  }

  // Buscar progresso do usuário em uma quest específica
  public async getUserQuestProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const questId = parseInt(req.params.questId);
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }
      
      if (isNaN(questId)) {
        res.status(400).json({
          success: false,
          message: 'ID da quest inválido'
        });
        return;
      }
      
      const progress = await questService.getUserQuestProgress(userId, questId);
      
      if (!progress) {
        res.status(404).json({
          success: false,
          message: 'Progresso não encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Erro ao buscar progresso na quest:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar progresso na quest'
      });
    }
  }

  // Iniciar uma nova quest para o usuário
  public async startQuest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { questId } = req.body;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }
      
      if (!questId || isNaN(parseInt(questId))) {
        res.status(400).json({
          success: false,
          message: 'ID da quest inválido'
        });
        return;
      }
      
      const progress = await questService.startQuest(userId, parseInt(questId));
      
      if (!progress) {
        res.status(404).json({
          success: false,
          message: 'Quest não encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Quest iniciada com sucesso',
        data: progress
      });
    } catch (error) {
      console.error('Erro ao iniciar quest:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao iniciar quest'
      });
    }
  }

  // Buscar os passos da quest atual do usuário
  public async getQuestSteps(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const questId = parseInt(req.params.questId);
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }
      
      if (isNaN(questId)) {
        res.status(400).json({
          success: false,
          message: 'ID da quest inválido'
        });
        return;
      }
      
      const steps = await questService.getCurrentQuestSteps(userId, questId);
      
      res.status(200).json({
        success: true,
        data: steps
      });
    } catch (error) {
      console.error('Erro ao buscar passos da quest:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar passos da quest'
      });
    }
  }
}

export const questController = new QuestController();