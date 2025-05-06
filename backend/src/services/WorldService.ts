import { AppDataSource } from '../config/database';
import { World as WorldEntity } from '../entities/World';
import { PlayerWorld as PlayerWorldEntity } from '../entities/PlayerWorld';
import { Quest } from '../entities/Quest';
import { WorldQuest } from '../entities/WorldQuest';
import { PlayerWorldsQuest } from '../entities/PlayerWorldsQuest';
import { World, PlayerWorld } from '@shared/types/worlds';
import { AppError } from '../utils/AppError';

export class WorldService {
  private worldRepository = AppDataSource.getRepository(WorldEntity);
  private playerWorldRepository = AppDataSource.getRepository(PlayerWorldEntity);
  private questRepository = AppDataSource.getRepository(Quest);
  private worldQuestRepository = AppDataSource.getRepository(WorldQuest);
  private playerWorldQuestRepository = AppDataSource.getRepository(PlayerWorldsQuest);
  
  async getAllWorlds(): Promise<World[]> {
    return this.worldRepository.find({
      where: { status: 'published' },
      order: { 
        difficulty: 'ASC'
      }
    });
  }

  async getWorldById(id: string): Promise<World | null> {
    const world = await this.worldRepository.findOne({
      where: { id }
    });
    
    if (!world) {
      throw new AppError('World not found', 404);
    }

    return world;
  }

  async getWorldQuests(worldId: string): Promise<Quest[]> {
    const worldQuests = await this.worldQuestRepository.find({
      where: { worldId },
      order: { displayOrder: 'ASC' },
      relations: ['quest']
    });

    return worldQuests.map(wq => wq.quest);
  }

  async startWorld(userId: string, worldId: string): Promise<PlayerWorld> {
    const world = await this.worldRepository.findOne({ where: { id: worldId } });
    if (!world) {
      throw new AppError('World not found', 404);
    }

    // Check if player already started this world
    const existingProgress = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (existingProgress) {
      return existingProgress;
    }

    // Create player world progress
    const playerWorld = this.playerWorldRepository.create({
      userId,
      worldId,
      status: 'started',
      startedAt: new Date()
    });

    await this.playerWorldRepository.save(playerWorld);

    // Get all quests from world and create initial progress
    const worldQuests = await this.worldQuestRepository.find({
      where: { worldId },
      relations: ['quest']
    });

    if (worldQuests.length > 0) {
      const playerQuests = worldQuests.map(worldQuest => {
        return this.playerWorldQuestRepository.create({
          playerWorldId: playerWorld.id,
          questId: worldQuest.quest.id,
          status: 'starting'
        });
      });

      await this.playerWorldQuestRepository.save(playerQuests);
    }

    return playerWorld;
  }

  async completeWorld(userId: string, worldId: string): Promise<PlayerWorld> {
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new AppError('World progress not found', 404);
    }

    // Check if all quests are completed
    const playerQuests = await this.playerWorldQuestRepository.find({
      where: { playerWorldId: playerWorld.id }
    });

    const allCompleted = playerQuests.every(quest => quest.status === 'completed');
    if (!allCompleted) {
      throw new AppError('All quests must be completed to complete the world', 400);
    }

    playerWorld.status = 'completed';
    playerWorld.completedAt = new Date();
    return this.playerWorldRepository.save(playerWorld);
  }
}

export const worldService = new WorldService();