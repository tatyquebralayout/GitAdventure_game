// Este arquivo segue o padrão de injeção de dependências (DI) do projeto.
// Não exporte instâncias diretas de serviços, utilize sempre o container ou instancie nos controllers.

import { AppDataSource } from '../config/database';
import { World as WorldEntity } from '../entities/World';
import { PlayerWorld as PlayerWorldEntity } from '../entities/PlayerWorld';
import { Quest } from '../entities/Quest';
import { WorldQuest } from '../entities/WorldQuest';
import { PlayerWorldsQuest } from '../entities/PlayerWorldsQuest';
import { AppError } from '../utils/AppError';
import { injectable, inject } from 'tsyringe';
import { ModuleTheme, WorldDifficulty } from '@shared/types';
import { CacheService } from './CacheService';

@injectable()
export class WorldService {
  private worldRepository = AppDataSource.getRepository(WorldEntity);
  private playerWorldRepository = AppDataSource.getRepository(PlayerWorldEntity);
  private questRepository = AppDataSource.getRepository(Quest);
  private worldQuestRepository = AppDataSource.getRepository(WorldQuest);
  private playerWorldQuestRepository = AppDataSource.getRepository(PlayerWorldsQuest);

  constructor(
    @inject('CacheService')
    private cacheService: CacheService
  ) {}

  async getAllWorlds(): Promise<WorldEntity[]> {
    return this.worldRepository.find({
      where: { status: 'published' },
      order: { 
        difficulty: 'ASC'
      }
    });
  }

  async getWorldById(id: string): Promise<WorldEntity | null> {
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

  async startWorld(userId: string, worldId: string): Promise<PlayerWorldEntity> {
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
      // startedAt pode não existir na entidade, ajuste conforme necessário
      // startedAt: new Date()
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
          // status: 'starting' // ajuste conforme enum/entidade
        });
      });

      await this.playerWorldQuestRepository.save(playerQuests);
    }

    return playerWorld;
  }

  async completeWorld(userId: string, worldId: string): Promise<PlayerWorldEntity> {
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
    // playerWorld.completedAt = new Date(); // remova se não existir na entidade
    return this.playerWorldRepository.save(playerWorld);
  }

  async getWorldsByTheme(theme: ModuleTheme): Promise<WorldEntity[]> {
    // Mock: Retorna mundos baseados no tema
    // Ajuste para retornar entidades ou tipos compartilhados conforme necessidade
    const mockWorlds: WorldEntity[] = [
      // ...
    ];

    return mockWorlds.filter(world => 
      (world as any).slug.includes(theme.toLowerCase())
    );
  }

  async getUserWorldProgress(userId: string, worldId: string): Promise<any> {
    const cacheKey = `world-progress:${userId}:${worldId}`;
    
    // Tenta obter do cache primeiro
    const cachedProgress = await this.cacheService.get(cacheKey);
    if (cachedProgress) {
      return JSON.parse(cachedProgress);
    }

    // Mock: Progresso simulado
    const mockProgress = {
      worldId,
      userId,
      completedQuests: 2,
      totalQuests: 5,
      currentQuest: 'quest-3',
      status: 'in_progress',
      score: 150,
      lastUpdated: new Date()
    };

    // Armazena no cache
    await this.cacheService.set(cacheKey, JSON.stringify(mockProgress), 3600);

    return mockProgress;
  }
}