import { Request, Response } from 'express';
import { worldService } from '../services/WorldService';

export class WorldController {
  /**
   * Obter todos os mundos
   */
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const worlds = await worldService.getAllWorlds();
      return res.json({ success: true, worlds });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
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
        return res.status(404).json({ success: false, message: 'Mundo não encontrado' });
      }

      return res.json({ success: true, world });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
    }
  }

  /**
   * Obter todas as quests de um mundo
   */
  async getWorldQuests(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const quests = await worldService.getWorldQuests(id);
      return res.json({ success: true, quests });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
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
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const playerWorld = await worldService.startWorld(userId, worldId);
      return res.json({ success: true, playerWorld });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
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
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const playerWorld = await worldService.completeWorld(userId, worldId);
      return res.json({ success: true, playerWorld });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return res.status(500).json({ success: false, message });
    }
  }
}

export const worldController = new WorldController(); 