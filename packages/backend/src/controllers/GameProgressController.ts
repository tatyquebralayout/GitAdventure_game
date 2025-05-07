import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { GameProgress } from '../entities/GameProgress';
import { AppError } from '../utils/AppError';

export class GameProgressController {
  async saveProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { saveSlot, saveName, gameState } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (!saveSlot || !saveName || !gameState) {
        throw new AppError('Dados incompletos. saveSlot, saveName e gameState são obrigatórios', 400);
      }

      const progressRepository = AppDataSource.getRepository(GameProgress);
      const existingProgress = await progressRepository.findOne({ where: { userId, saveSlot } });

      let progress: GameProgress;
      let isNewSave = false;

      if (existingProgress) {
        existingProgress.saveName = saveName;
        existingProgress.gameState = gameState;
        progress = await progressRepository.save(existingProgress);
      } else {
        isNewSave = true;
        progress = progressRepository.create({
          userId,
          saveSlot,
          saveName,
          gameState
        });
        progress = await progressRepository.save(progress);
      }

      res.status(isNewSave ? 201 : 200).json({
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
      next(error);
    }
  }

  async loadProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { saveSlot } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const progressRepository = AppDataSource.getRepository(GameProgress);
      const progress = await progressRepository.findOne({
        where: { userId, saveSlot: parseInt(saveSlot) }
      });

      if (!progress) {
        throw new AppError('Save não encontrado', 404);
      }

      res.status(200).json({
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
      next(error);
    }
  }

  async listSaves(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
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

      res.status(200).json({
        success: true,
        message: 'Saves listados com sucesso',
        saves: savesList
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { saveSlot } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const progressRepository = AppDataSource.getRepository(GameProgress);
      const progress = await progressRepository.findOne({
        where: { userId, saveSlot: parseInt(saveSlot) }
      });

      if (!progress) {
        throw new AppError('Save não encontrado', 404);
      }

      await progressRepository.remove(progress);

      res.status(200).json({
        success: true,
        message: 'Save excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const gameProgressController = new GameProgressController();