import { Request, Response } from 'express';
import { worldService } from '../services/WorldService';
import { ApiResponse } from '@shared/types/api';
import { World } from '@shared/types/worlds';
import { PlayerWorld } from '@shared/types/worlds';

export class WorldController {
  /**
   * Obter todos os mundos
   */
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const worlds = await worldService.getAllWorlds();
      const response: ApiResponse<World[]> = { success: true, data: worlds };
      return res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      const response: ApiResponse = { success: false, message };
      return res.status(500).json(response);
    }
  }

  /**
   * Obter mundo por ID
   */
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const world = await worldService.getWorldById(id);

      if (!world) {
        const response: ApiResponse = { success: false, message: 'Mundo não encontrado' };
        return res.status(404).json(response);
      }

      const response: ApiResponse<World> = { success: true, data: world };
      return res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      const response: ApiResponse = { success: false, message };
      return res.status(500).json(response);
    }
  }

  /**
   * Obter todas as quests de um mundo
   */
  async getWorldQuests(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const quests = await worldService.getWorldQuests(id);
      const response: ApiResponse = { success: true, data: quests };
      return res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      const response: ApiResponse = { success: false, message };
      return res.status(500).json(response);
    }
  }

  /**
   * Iniciar um mundo para o jogador
   */
  async startWorld(req: Request, res: Response): Promise<Response> {
    try {
      const { id: worldId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        const response: ApiResponse = { success: false, message: 'Usuário não autenticado' };
        return res.status(401).json(response);
      }

      const playerWorld = await worldService.startWorld(userId, worldId);
      const response: ApiResponse<PlayerWorld> = { success: true, data: playerWorld };
      return res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      const response: ApiResponse = { success: false, message };
      return res.status(500).json(response);
    }
  }

  /**
   * Completar um mundo
   */
  async completeWorld(req: Request, res: Response): Promise<Response> {
    try {
      const { id: worldId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        const response: ApiResponse = { success: false, message: 'Usuário não autenticado' };
        return res.status(401).json(response);
      }

      const playerWorld = await worldService.completeWorld(userId, worldId);
      const response: ApiResponse<PlayerWorld> = { success: true, data: playerWorld };
      return res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      const response: ApiResponse = { success: false, message };
      return res.status(500).json(response);
    }
  }
}

export const worldController = new WorldController();