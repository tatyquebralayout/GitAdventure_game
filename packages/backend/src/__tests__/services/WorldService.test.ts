import { WorldService } from '../../services/WorldService';
import { AppDataSource } from '../../config/database';
import { World } from '../../entities/World';
import { PlayerWorld } from '../../entities/PlayerWorld';
import { WorldQuest } from '../../entities/WorldQuest';
import { CacheService } from '../../services/CacheService';
import { ModuleTheme } from '@shared/types';

jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    createQueryBuilder: jest.fn()
  }
}));

jest.mock('../../services/CacheService');

describe('WorldService', () => {
  let worldService: WorldService;
  let mockWorldRepo: any;
  let mockPlayerWorldRepo: any;
  let mockWorldQuestRepo: any;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    mockWorldRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn()
    };

    mockPlayerWorldRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn()
    };

    mockWorldQuestRepo = {
      find: jest.fn(),
      save: jest.fn()
    };

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
      getOrSet: jest.fn()
    } as any;

    (AppDataSource.getRepository as jest.Mock)
      .mockImplementation((entity) => {
        if (entity === World) return mockWorldRepo;
        if (entity === PlayerWorld) return mockPlayerWorldRepo;
        if (entity === WorldQuest) return mockWorldQuestRepo;
        return null;
      });

    worldService = new WorldService(mockCacheService);
  });

  describe('getAllWorlds', () => {
    const mockWorlds = [
      { id: '1', name: 'Git Basics', difficulty: 'beginner' },
      { id: '2', name: 'Advanced Git', difficulty: 'advanced' }
    ];

    it('should return all worlds with cache hit', async () => {
      mockCacheService.get.mockResolvedValue(mockWorlds);

      const result = await worldService.getAllWorlds();

      expect(result).toEqual(mockWorlds);
      expect(mockCacheService.get).toHaveBeenCalledWith('worlds:all');
      expect(mockWorldRepo.find).not.toHaveBeenCalled();
    });

    it('should fetch and cache worlds on cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockWorldRepo.find.mockResolvedValue(mockWorlds);

      const result = await worldService.getAllWorlds();

      expect(result).toEqual(mockWorlds);
      expect(mockWorldRepo.find).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith('worlds:all', mockWorlds);
    });
  });

  describe('getWorldById', () => {
    const mockWorld = {
      id: '1',
      name: 'Git Basics',
      description: 'Learn Git basics',
      difficulty: 'beginner',
      quests: []
    };

    it('should return world by id with cache hit', async () => {
      mockCacheService.get.mockResolvedValue(mockWorld);

      const result = await worldService.getWorldById('1');

      expect(result).toEqual(mockWorld);
      expect(mockCacheService.get).toHaveBeenCalledWith('world:1');
    });

    it('should return null for non-existent world', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockWorldRepo.findOne.mockResolvedValue(null);

      const result = await worldService.getWorldById('999');

      expect(result).toBeNull();
    });
  });

  describe('getUserWorldProgress', () => {
    const userId = '1';
    const worldId = '1';

    it('should return user progress for a specific world', async () => {
      const mockProgress = {
        id: '1',
        userId,
        worldId,
        status: 'started',
        completedQuests: 2
      };

      mockPlayerWorldRepo.findOne.mockResolvedValue(mockProgress);

      const result = await worldService.getUserWorldProgress(userId, worldId);

      expect(result).toEqual(mockProgress);
      expect(mockPlayerWorldRepo.findOne).toHaveBeenCalled();
    });

    it('should return null if no progress exists', async () => {
      mockPlayerWorldRepo.findOne.mockResolvedValue(null);

      const result = await worldService.getUserWorldProgress(userId, worldId);

      expect(result).toBeNull();
    });
  });

  describe('startWorld', () => {
    const userId = '1';
    const worldId = '1';

    it('should start a new world for user', async () => {
      const mockWorld = { id: worldId, name: 'Git Basics' };
      const mockPlayerWorld = {
        id: '1',
        userId,
        worldId,
        status: 'started'
      };

      mockWorldRepo.findOne.mockResolvedValue(mockWorld);
      mockPlayerWorldRepo.findOne.mockResolvedValue(null);
      mockPlayerWorldRepo.create.mockReturnValue(mockPlayerWorld);
      mockPlayerWorldRepo.save.mockResolvedValue(mockPlayerWorld);

      const result = await worldService.startWorld(userId, worldId);

      expect(result).toEqual(mockPlayerWorld);
      expect(mockPlayerWorldRepo.save).toHaveBeenCalled();
    });

    it('should throw error if world already started', async () => {
      mockPlayerWorldRepo.findOne.mockResolvedValue({
        id: '1',
        userId,
        worldId
      });

      await expect(worldService.startWorld(userId, worldId))
        .rejects
        .toThrow('World already started');
    });

    it('should throw error if world does not exist', async () => {
      mockWorldRepo.findOne.mockResolvedValue(null);

      await expect(worldService.startWorld(userId, worldId))
        .rejects
        .toThrow('World not found');
    });
  });

  describe('getWorldsByTheme', () => {
    const mockTheme = ModuleTheme.GIT_BASICS;

    it('should return worlds filtered by theme', async () => {
      const mockWorlds = [
        { id: '1', name: 'Git Basics', theme: ModuleTheme.GIT_BASICS },
        { id: '2', name: 'Git Commands', theme: ModuleTheme.GIT_BASICS }
      ];

      mockWorldRepo.find.mockResolvedValue(mockWorlds);

      const result = await worldService.getWorldsByTheme(mockTheme);

      expect(result).toEqual(mockWorlds);
      expect(mockWorldRepo.find).toHaveBeenCalledWith({
        where: { theme: mockTheme }
      });
    });
  });
});