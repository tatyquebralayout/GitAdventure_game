import { Request, Response, NextFunction } from 'express';
import { worldService } from '../services/WorldService';
import { ApiResponse } from '@shared/types/api';
import { World } from '@shared/types/worlds';
import { PlayerWorld } from '@shared/types/worlds';
import { AppError } from '../utils/AppError';

export class WorldController {
  /**
   * Obter todos os mundos
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const worlds = await worldService.getAllWorlds();
      const response: ApiResponse<World[]> = { success: true, data: worlds };
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter mundo por ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const world = await worldService.getWorldById(id);

      if (!world) {
        throw new AppError('Mundo não encontrado', 404);
      }

      const response: ApiResponse<World> = { success: true, data: world };
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obter todas as quests de um mundo
   */
  async getWorldQuests(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const quests = await worldService.getWorldQuests(id);
      const response: ApiResponse = { success: true, data: quests };
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Iniciar um mundo para o jogador
   */
  async startWorld(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id: worldId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const playerWorld = await worldService.startWorld(userId, worldId);
      const response: ApiResponse<PlayerWorld> = { success: true, data: playerWorld };
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Completar um mundo
   */
  async completeWorld(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id: worldId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const playerWorld = await worldService.completeWorld(userId, worldId);
      const response: ApiResponse<PlayerWorld> = { success: true, data: playerWorld };
      return res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const worldController = new WorldController();