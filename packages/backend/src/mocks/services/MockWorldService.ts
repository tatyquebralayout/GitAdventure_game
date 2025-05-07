import { injectable } from 'tsyringe';
import { BaseMockService } from './BaseMockService';
import { MockDataStore } from './MockDataStore';
import { IWorldService, WorldProgress, WorldFilters } from '../../services/interfaces/IWorldService';
import { World } from '../../entities/World';
import { PlayerWorld } from '../../entities/PlayerWorld';
import { ServiceError, ServiceErrorCode } from '../../errors/ServiceError';
import { ModuleTheme, WorldDifficulty } from '@shared/types';
import { WorldFactory } from '../factories/WorldFactory';
import { MockValidators, MockDataGenerators, MockTimingUtils } from './mockUtils';

@injectable()
export class MockWorldService extends BaseMockService implements IWorldService {
  private readonly worlds: MockDataStore<World>;
  private readonly playerWorlds: MockDataStore<PlayerWorld>;
  private readonly worldProgress: MockDataStore<WorldProgress>;

  constructor() {
    super();
    this.worlds = new MockDataStore<World>('worlds');
    this.playerWorlds = new MockDataStore<PlayerWorld>('playerWorlds');
    this.worldProgress = new MockDataStore<WorldProgress>('worldProgress');
    this.setupInitialData();
    this.registerStores();
  }

  private registerStores() {
    const registry = this.registry;
    registry.registerStore('worlds', this.worlds);
    registry.registerStore('playerWorlds', this.playerWorlds);
    registry.registerStore('worldProgress', this.worldProgress);
  }

  private async setupInitialData() {
    // Create sample worlds for different themes
    const worlds = WorldFactory.createProgression(4);
    worlds.forEach(world => {
      this.worlds.set(world.id, world);
    });

    this.logMockOperation('setupInitialData', { worldCount: worlds.length });
  }

  async getAllWorlds(filters?: WorldFilters): Promise<World[]> {
    await this.simulateDelay();

    let worlds = this.worlds.getAll();

    if (filters) {
      worlds = worlds.filter(world => {
        if (filters.theme && world.theme !== filters.theme) return false;
        if (filters.difficulty && world.difficulty !== filters.difficulty) return false;
        if (filters.searchTerm) {
          const search = filters.searchTerm.toLowerCase();
          return (
            world.name.toLowerCase().includes(search) ||
            world.description.toLowerCase().includes(search)
          );
        }
        return true;
      });
    }

    return this.createMockResponse(worlds, 'getAllWorlds');
  }

  async getWorldById(worldId: string): Promise<World | null> {
    await this.simulateDelay();
    const world = this.worlds.get(worldId);
    return this.createMockResponse(world || null, 'getWorldById');
  }

  async getWorldsByTheme(theme: ModuleTheme): Promise<World[]> {
    await this.simulateDelay();
    const worlds = this.worlds.find(world => world.theme === theme);
    return this.createMockResponse(worlds, 'getWorldsByTheme');
  }

  async getUserWorldProgress(userId: string, worldId: string): Promise<PlayerWorld | null> {
    await this.simulateDelay();
    const key = `${userId}:${worldId}`;
    const playerWorld = this.playerWorlds.get(key);
    return this.createMockResponse(playerWorld || null, 'getUserWorldProgress');
  }

  async startWorld(userId: string, worldId: string): Promise<PlayerWorld> {
    await this.simulateDelay();

    const world = MockValidators.validateResourceExists(
      this.worlds.get(worldId),
      'World',
      worldId,
      true
    );

    const key = `${userId}:${worldId}`;
    MockValidators.validateResourceNotExists(
      this.playerWorlds.get(key),
      'Player world',
      { worldId, userId },
      true
    );

    // Check prerequisites
    const canStart = await this.checkWorldPrerequisites(userId, worldId);
    if (!canStart.canStart) {
      throw new ServiceError(
        ServiceErrorCode.OPERATION_NOT_ALLOWED,
        'Prerequisites not met',
        { missingPrerequisites: canStart.missingPrerequisites },
        true
      );
    }

    const playerWorld: PlayerWorld = {
      id: MockDataGenerators.generateId('player-world'),
      userId,
      worldId,
      startedAt: new Date(),
      completedAt: null,
      currentQuestId: null,
      score: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      world,
      playerQuests: []
    };

    this.playerWorlds.set(key, playerWorld);
    return this.createMockResponse(playerWorld, 'startWorld');
  }

  async getUserActiveWorlds(userId: string): Promise<PlayerWorld[]> {
    await this.simulateDelay();

    const playerWorlds = this.playerWorlds.find(pw => 
      pw.userId === userId && !pw.completedAt
    );

    return this.createMockResponse(playerWorlds, 'getUserActiveWorlds');
  }

  async calculateWorldProgress(worldId: string, userId: string): Promise<WorldProgress> {
    await this.simulateDelay();

    const key = `${userId}:${worldId}`;
    const progress = this.worldProgress.get(key);
    if (progress) {
      return this.createMockResponse(progress, 'calculateWorldProgress');
    }

    const world = MockValidators.validateResourceExists(
      this.worlds.get(worldId),
      'World',
      worldId,
      true
    );

    const newProgress: WorldProgress = {
      completedQuests: 0,
      totalQuests: world.worldQuests?.length || 0,
      score: 0,
      isComplete: false
    };

    this.worldProgress.set(key, newProgress);
    return this.createMockResponse(newProgress, 'calculateWorldProgress');
  }

  async getRecommendedWorlds(userId: string, limit: number = 3): Promise<World[]> {
    await this.simulateDelay();

    // Get user's completed worlds
    const completedWorlds = this.playerWorlds.find(pw => 
      pw.userId === userId && pw.completedAt !== null
    );

    // Get all worlds and filter out completed ones
    const allWorlds = this.worlds.getAll();
    const uncompletedWorlds = allWorlds.filter(world => 
      !completedWorlds.find(pw => pw.worldId === world.id)
    );

    // Sort by difficulty and limit results
    const recommended = uncompletedWorlds
      .sort((a, b) => this.getDifficultyWeight(a.difficulty) - this.getDifficultyWeight(b.difficulty))
      .slice(0, limit);

    return this.createMockResponse(recommended, 'getRecommendedWorlds');
  }

  async checkWorldPrerequisites(userId: string, worldId: string): Promise<{
    canStart: boolean;
    missingPrerequisites?: string[];
  }> {
    await this.simulateDelay();

    const world = MockValidators.validateResourceExists(
      this.worlds.get(worldId),
      'World',
      worldId,
      true
    );

    // Get required worlds
    const requiredWorlds = world.requiredWorlds || [];
    if (requiredWorlds.length === 0) {
      return this.createMockResponse({ canStart: true }, 'checkWorldPrerequisites');
    }

    // Check each required world
    const completedWorlds = this.playerWorlds.find(pw => 
      pw.userId === userId && pw.completedAt !== null
    );

    const missingPrerequisites = requiredWorlds.filter(worldId =>
      !completedWorlds.find(pw => pw.worldId === worldId)
    );

    return this.createMockResponse({
      canStart: missingPrerequisites.length === 0,
      missingPrerequisites: missingPrerequisites.length > 0 ? missingPrerequisites : undefined
    }, 'checkWorldPrerequisites');
  }

  private getDifficultyWeight(difficulty: WorldDifficulty): number {
    switch (difficulty) {
      case WorldDifficulty.BEGINNER:
        return 1;
      case WorldDifficulty.INTERMEDIATE:
        return 2;
      case WorldDifficulty.ADVANCED:
        return 3;
      default:
        return 0;
    }
  }
}