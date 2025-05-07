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
import { IWorldService, WorldProgress, WorldFilters } from './interfaces/IWorldService';

@injectable()
export class WorldService implements IWorldService {
  private worldRepository = AppDataSource.getRepository(WorldEntity);
  private playerWorldRepository = AppDataSource.getRepository(PlayerWorldEntity);
  private questRepository = AppDataSource.getRepository(Quest);
  private worldQuestRepository = AppDataSource.getRepository(WorldQuest);
  private playerWorldQuestRepository = AppDataSource.getRepository(PlayerWorldsQuest);

  constructor(
    @inject('CacheService')
    private cacheService: CacheService
  ) {}

  async getAllWorlds(filters?: WorldFilters): Promise<WorldEntity[]> {
    // Busca básica de mundos publicados
    let query = this.worldRepository.createQueryBuilder('world')
      .where('world.status = :status', { status: 'published' })
      .orderBy('world.difficulty', 'ASC');
    
    // Aplicar filtros se fornecidos
    if (filters) {
      if (filters.theme) {
        query = query.andWhere('world.theme = :theme', { theme: filters.theme });
      }
      
      if (filters.difficulty) {
        query = query.andWhere('world.difficulty = :difficulty', { difficulty: filters.difficulty });
      }
      
      if (filters.searchTerm) {
        query = query.andWhere('(world.name LIKE :search OR world.description LIKE :search)', 
          { search: `%${filters.searchTerm}%` });
      }
    }
    
    // Mock: Retornando dados simulados de mundos
    const mockWorlds = [
      {
        id: 'world-1',
        name: 'Git Basics',
        description: 'Learn the basic Git commands',
        difficulty: WorldDifficulty.BEGINNER,
        status: 'published',
        theme: ModuleTheme.GIT_BASICS,
        slug: 'git-basics',
        worldQuests: []
      },
      {
        id: 'world-2',
        name: 'Branching Strategies',
        description: 'Master Git branching techniques',
        difficulty: WorldDifficulty.INTERMEDIATE,
        status: 'published',
        theme: ModuleTheme.BRANCHING,
        slug: 'branching-strategies',
        worldQuests: []
      },
      {
        id: 'world-3',
        name: 'Advanced Git',
        description: 'Learn advanced Git concepts',
        difficulty: WorldDifficulty.ADVANCED,
        status: 'published',
        theme: ModuleTheme.ADVANCED,
        slug: 'advanced-git',
        worldQuests: []
      }
    ] as WorldEntity[];
    
    // Aplicar filtros nos dados mockados para simular o comportamento real
    let filteredWorlds = [...mockWorlds];
    
    if (filters) {
      if (filters.theme) {
        filteredWorlds = filteredWorlds.filter(w => w.theme === filters.theme);
      }
      if (filters.difficulty) {
        filteredWorlds = filteredWorlds.filter(w => w.difficulty === filters.difficulty);
      }
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredWorlds = filteredWorlds.filter(w => 
          w.name.toLowerCase().includes(searchLower) || 
          (w.description && w.description.toLowerCase().includes(searchLower))
        );
      }
    }

    // Caching simulado com dados mockados
    const cacheKey = `worlds:filtered:${JSON.stringify(filters || {})}`;
    await this.cacheService.set(cacheKey, JSON.stringify(filteredWorlds), 3600);
    
    return filteredWorlds;
  }

  async getWorldById(id: string): Promise<WorldEntity | null> {
    // Tentar buscar do cache primeiro
    const cacheKey = `world:${id}`;
    const cachedWorld = await this.cacheService.get(cacheKey);
    
    if (cachedWorld) {
      return JSON.parse(cachedWorld) as WorldEntity;
    }
    
    // Mock: Simulando busca no banco
    const mockWorlds = [
      {
        id: 'world-1',
        name: 'Git Basics',
        description: 'Learn the basic Git commands',
        difficulty: WorldDifficulty.BEGINNER,
        theme: ModuleTheme.GIT_BASICS,
        slug: 'git-basics'
      },
      {
        id: 'world-2',
        name: 'Branching Strategies',
        description: 'Master Git branching techniques',
        difficulty: WorldDifficulty.INTERMEDIATE,
        theme: ModuleTheme.BRANCHING,
        slug: 'branching-strategies'
      }
    ] as WorldEntity[];
    
    const foundWorld = mockWorlds.find(w => w.id === id);
    
    if (!foundWorld) {
      throw new AppError('World not found', 404);
    }
    
    // Armazenar no cache
    await this.cacheService.set(cacheKey, JSON.stringify(foundWorld), 3600);
    
    return foundWorld;
  }

  async getWorldQuests(worldId: string): Promise<Quest[]> {
    // Mock: Simulando quests de um mundo
    const mockQuests = [
      {
        id: 'quest-1',
        name: 'Initialize Repository',
        description: 'Learn how to create a new Git repository',
        type: 'tutorial',
        worldId: 'world-1'
      },
      {
        id: 'quest-2',
        name: 'First Commit',
        description: 'Make your first Git commit',
        type: 'challenge',
        worldId: 'world-1'
      },
      {
        id: 'quest-3',
        name: 'Creating Branches',
        description: 'Learn to work with Git branches',
        type: 'tutorial',
        worldId: 'world-2'
      }
    ] as Quest[];
    
    return mockQuests.filter(q => q.worldId === worldId);
  }

  async startWorld(userId: string, worldId: string): Promise<PlayerWorldEntity> {
    // Verificar se o mundo existe
    await this.getWorldById(worldId); // Lançará erro se não existir
    
    // Verificar se o jogador já iniciou este mundo
    const cacheKey = `player-world:${userId}:${worldId}`;
    const cachedProgress = await this.cacheService.get(cacheKey);
    
    if (cachedProgress) {
      return JSON.parse(cachedProgress) as PlayerWorldEntity;
    }
    
    // Mock: Criar progresso do jogador
    const playerWorld = {
      id: `player-world-${Date.now()}`,
      userId,
      worldId,
      status: 'started',
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as PlayerWorldEntity;
    
    // Armazenar no cache
    await this.cacheService.set(cacheKey, JSON.stringify(playerWorld), 86400); // 24 horas
    
    return playerWorld;
  }

  async completeWorld(userId: string, worldId: string): Promise<PlayerWorldEntity> {
    // Verificar se o jogador iniciou o mundo
    const cacheKey = `player-world:${userId}:${worldId}`;
    const cachedProgress = await this.cacheService.get(cacheKey);
    
    if (!cachedProgress) {
      throw new AppError('World progress not found', 404);
    }
    
    const playerWorld = JSON.parse(cachedProgress) as PlayerWorldEntity;
    
    // Mock: Verificar se todas as quests estão completas
    const mockProgress = await this.calculateWorldProgress(worldId, userId);
    
    if (!mockProgress.isComplete) {
      throw new AppError('All quests must be completed to complete the world', 400);
    }
    
    // Atualizar estado
    playerWorld.status = 'completed';
    playerWorld.completedAt = new Date();
    playerWorld.updatedAt = new Date();
    
    // Atualizar cache
    await this.cacheService.set(cacheKey, JSON.stringify(playerWorld), 86400);
    
    return playerWorld;
  }

  async getWorldsByTheme(theme: ModuleTheme): Promise<WorldEntity[]> {
    // Usar getAllWorlds com filtro por tema
    return this.getAllWorlds({ theme });
  }

  async getUserWorldProgress(userId: string, worldId: string): Promise<PlayerWorldEntity | null> {
    const cacheKey = `player-world:${userId}:${worldId}`;
    
    // Buscar do cache
    const cachedProgress = await this.cacheService.get(cacheKey);
    if (cachedProgress) {
      return JSON.parse(cachedProgress) as PlayerWorldEntity;
    }
    
    // Mock: Se não existir no cache, retorna null
    return null;
  }

  async getUserActiveWorlds(userId: string): Promise<PlayerWorldEntity[]> {
    // Mock: Listar mundos ativos do usuário
    const mockActiveWorlds = [
      {
        id: 'player-world-1',
        userId,
        worldId: 'world-1',
        status: 'in_progress',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        completedAt: null
      },
      {
        id: 'player-world-2',
        userId,
        worldId: 'world-2',
        status: 'started',
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        completedAt: null
      }
    ] as PlayerWorldEntity[];
    
    return mockActiveWorlds;
  }

  async calculateWorldProgress(worldId: string, userId: string): Promise<WorldProgress> {
    const cacheKey = `world-progress:${userId}:${worldId}`;
    
    // Tentar obter do cache
    const cachedProgress = await this.cacheService.get(cacheKey);
    if (cachedProgress) {
      return JSON.parse(cachedProgress) as WorldProgress;
    }
    
    // Mock: Calcular progresso do mundo
    const mockProgress: WorldProgress = {
      completedQuests: 3,
      totalQuests: 5,
      score: 350,
      isComplete: false // 3 de 5 quests completas
    };
    
    // Armazenar no cache
    await this.cacheService.set(cacheKey, JSON.stringify(mockProgress), 3600);
    
    return mockProgress;
  }

  async getRecommendedWorlds(userId: string, limit: number = 3): Promise<WorldEntity[]> {
    // Mock: Mundos recomendados baseados no nível do usuário
    const mockCompletedWorldIds = ['world-1']; // Simulando mundos já completados
    const allWorlds = await this.getAllWorlds();
    
    // Filtrar mundos não completados
    const availableWorlds = allWorlds.filter(world => 
      !mockCompletedWorldIds.includes(world.id)
    );
    
    // Ordenar por dificuldade e limitar resultado
    const recommendedWorlds = [...availableWorlds]
      .sort((a, b) => {
        const difficultyOrder = {
          [WorldDifficulty.BEGINNER]: 1,
          [WorldDifficulty.INTERMEDIATE]: 2,
          [WorldDifficulty.ADVANCED]: 3
        };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      })
      .slice(0, limit);
    
    return recommendedWorlds;
  }

  async checkWorldPrerequisites(userId: string, worldId: string): Promise<{
    canStart: boolean;
    missingPrerequisites?: string[];
  }> {
    // Mock: Verificar pré-requisitos
    const world = await this.getWorldById(worldId);
    
    // Mundo do Git Básico não tem pré-requisitos
    if (world.id === 'world-1') {
      return { canStart: true };
    }
    
    // Outros mundos exigem que o usuário tenha completado o mundo de Git Básico
    const mockCompletedWorldIds = ['world-1']; // Simulando mundos já completados
    
    // Definir pré-requisitos mockados
    const mockPrerequisites = {
      'world-2': ['world-1'],
      'world-3': ['world-1', 'world-2']
    };
    
    const worldPrereqs = mockPrerequisites[worldId] || [];
    const missingPrerequisites = worldPrereqs.filter(
      prereqId => !mockCompletedWorldIds.includes(prereqId)
    );
    
    return {
      canStart: missingPrerequisites.length === 0,
      missingPrerequisites: missingPrerequisites.length > 0 ? missingPrerequisites : undefined
    };
  }
}