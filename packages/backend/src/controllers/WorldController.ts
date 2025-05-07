import { Request, Response, NextFunction } from 'express';
import { WorldService } from '../services/WorldService';
import { AppError } from '../utils/AppError';

export class WorldController {
  constructor(private worldService = new WorldService()) {}

  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worlds = await this.worldService.getAllWorlds();
      res.json(worlds);
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const world = await this.worldService.getWorldById(id);

      if (!world) {
        throw new AppError('World not found', 404);
      }

      res.json(world);
    } catch (error) {
      next(error);
    }
  }

  public async getWorldQuests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const quests = await this.worldService.getWorldQuests(id);
      res.json(quests);
    } catch (error) {
      next(error);
    }
  }

  public async startWorld(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Authentication required', 401);
      }
      const result = await this.worldService.startWorld(userId, id);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public async completeWorld(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Authentication required', 401);
      }
      const result = await this.worldService.completeWorld(userId, id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const worldController = new WorldController();