import { AppDataSource } from '../config/database';
import { World as WorldEntity } from '../entities/World';
import { PlayerWorld as PlayerWorldEntity } from '../entities/PlayerWorld';
import { Quest } from '../entities/Quest';
import { WorldQuest } from '../entities/WorldQuest';
import { PlayerWorldsQuest } from '../entities/PlayerWorldsQuest';
import { World, PlayerWorld } from '@shared/types/worlds';

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
    return this.worldRepository.findOne({
      where: { id }
    });
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
      throw new Error('World not found');
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
      status: 'started'
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

    return playerWorld as PlayerWorld;
  }

  async completeWorld(userId: string, worldId: string): Promise<PlayerWorld> {
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new Error('World progress not found');
    }

    playerWorld.status = 'completed';
    return this.playerWorldRepository.save(playerWorld) as Promise<PlayerWorld>;
  }
}

export const worldService = new WorldService();