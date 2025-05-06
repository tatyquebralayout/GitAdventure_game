import { AppDataSource } from '../config/database';
import { World as WorldEntity } from '../entities/World'; // Rename import to avoid conflict
import { PlayerWorld as PlayerWorldEntity } from '../entities/PlayerWorld'; // Rename import
import { Quest } from '../entities/Quest';
import { WorldQuest } from '../entities/WorldQuest';
import { PlayerWorldsQuest } from '../entities/PlayerWorldsQuest';
import { World, PlayerWorld } from '@shared/types/worlds'; // Import shared types

export class WorldService {
  private worldRepository = AppDataSource.getRepository(WorldEntity);
  private playerWorldRepository = AppDataSource.getRepository(PlayerWorldEntity);
  private questRepository = AppDataSource.getRepository(Quest);
  private worldQuestRepository = AppDataSource.getRepository(WorldQuest);
  private playerWorldQuestRepository = AppDataSource.getRepository(PlayerWorldsQuest);
  
  /**
   * Obter todos os mundos
   */
  async getAllWorlds(): Promise<World[]> {
    return this.worldRepository.find({
      where: { status: 'published' },
      order: { 
        difficulty: 'ASC'
      }
    });
  }

  /**
   * Obter mundo por ID
   */
  async getWorldById(id: string): Promise<World | null> {
    return this.worldRepository.findOne({
      where: { id }
    });
  }

  /**
   * Obter todas as quests de um mundo
   */
  async getWorldQuests(worldId: string): Promise<Quest[]> {
    const worldQuests = await this.worldQuestRepository.find({
      where: { worldId },
      order: { displayOrder: 'ASC' },
      relations: ['quest']
    });

    return worldQuests.map(wq => wq.quest);
  }

  /**
   * Iniciar um mundo para o jogador
   */
  async startWorld(userId: string, worldId: string): Promise<PlayerWorld> {
    // Verificar se o jogador já iniciou este mundo
    const existingPlayerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (existingPlayerWorld) {
      return existingPlayerWorld as PlayerWorld;
    }

    // Criar novo progresso para o jogador
    const playerWorld = this.playerWorldRepository.create({
      userId,
      worldId,
      status: 'started'
    });

    await this.playerWorldRepository.save(playerWorld);

    // Obter as quests do mundo e criar progresso para cada uma
    const worldQuests = await this.getWorldQuests(worldId);
    
    if (worldQuests.length > 0) {
      const playerQuests = worldQuests.map(quest => {
        return this.playerWorldQuestRepository.create({
          playerWorldId: playerWorld.id,
          questId: quest.id,
          status: 'starting'
        });
      });

      await this.playerWorldQuestRepository.save(playerQuests);
    }

    return playerWorld as PlayerWorld;
  }

  /**
   * Completar um mundo
   */
  async completeWorld(userId: string, worldId: string): Promise<PlayerWorld> {
    // Obter progresso do jogador neste mundo
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new Error('Mundo não foi iniciado pelo jogador');
    }

    // Atualizar status para 'completed'
    playerWorld.status = 'completed';
    await this.playerWorldRepository.save(playerWorld);

    return playerWorld as PlayerWorld;
  }
}

export const worldService = new WorldService();