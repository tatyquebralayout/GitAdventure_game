import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { GameProgress } from '../entities/GameProgress';

export class GameProgressController {
  async saveProgress(req: Request, res: Response) {
    try {
      const { saveSlot, saveName, gameState } = req.body;
      const userId = req.userId; // Vindo do middleware de autenticação
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Usuário não autenticado' 
        });
      }

      if (!saveSlot || !saveName || !gameState) {
        return res.status(400).json({ 
          success: false,
          message: 'Dados incompletos. saveSlot, saveName e gameState são obrigatórios' 
        });
      }
      
      const progressRepository = AppDataSource.getRepository(GameProgress);
      
      // Verificar se já existe um save nesse slot
      const existingProgress = await progressRepository.findOne({ 
        where: { userId, saveSlot } 
      });
      
      let progress: GameProgress;
      let isNewSave = false;
      
      if (existingProgress) {
        // Atualizar save existente
        existingProgress.saveName = saveName;
        existingProgress.gameState = gameState;
        progress = await progressRepository.save(existingProgress);
      } else {
        // Criar novo save
        isNewSave = true;
        progress = progressRepository.create({
          userId,
          saveSlot,
          saveName,
          gameState
        });
        progress = await progressRepository.save(progress);
      }
      
      return res.status(isNewSave ? 201 : 200).json({
        success: true,
        message: 'Progresso salvo com sucesso',
        progress: {
          id: progress.id,
          saveSlot: progress.saveSlot,
          saveName: progress.saveName,
          updatedAt: progress.updatedAt
        }
      });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Erro ao salvar progresso' 
      });
    }
  }
  
  async loadProgress(req: Request, res: Response) {
    try {
      const { saveSlot } = req.params;
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Usuário não autenticado' 
        });
      }
      
      const progressRepository = AppDataSource.getRepository(GameProgress);
      
      const progress = await progressRepository.findOne({
        where: { userId, saveSlot: parseInt(saveSlot) }
      });
      
      if (!progress) {
        return res.status(404).json({ 
          success: false,
          message: 'Save não encontrado' 
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Progresso carregado com sucesso',
        progress: {
          id: progress.id,
          saveSlot: progress.saveSlot,
          saveName: progress.saveName,
          gameState: progress.gameState,
          updatedAt: progress.updatedAt
        }
      });
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Erro ao carregar progresso' 
      });
    }
  }
  
  async listSaves(req: Request, res: Response) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Usuário não autenticado' 
        });
      }
      
      const progressRepository = AppDataSource.getRepository(GameProgress);
      
      const saves = await progressRepository.find({
        where: { userId },
        order: { updatedAt: 'DESC' }
      });
      
      const savesList = saves.map(save => ({
        id: save.id,
        saveSlot: save.saveSlot,
        saveName: save.saveName,
        updatedAt: save.updatedAt
      }));
      
      return res.status(200).json({
        success: true,
        message: 'Saves listados com sucesso',
        saves: savesList
      });
    } catch (error) {
      console.error('Erro ao listar saves:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Erro ao listar saves' 
      });
    }
  }
  
  async deleteProgress(req: Request, res: Response) {
    try {
      const { saveSlot } = req.params;
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Usuário não autenticado' 
        });
      }
      
      const progressRepository = AppDataSource.getRepository(GameProgress);
      
      const progress = await progressRepository.findOne({
        where: { userId, saveSlot: parseInt(saveSlot) }
      });
      
      if (!progress) {
        return res.status(404).json({ 
          success: false,
          message: 'Save não encontrado' 
        });
      }
      
      await progressRepository.remove(progress);
      
      return res.status(200).json({
        success: true,
        message: 'Save excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir save:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Erro ao excluir save' 
      });
    }
  }
}

export const gameProgressController = new GameProgressController();