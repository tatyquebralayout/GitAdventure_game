import { QuestService } from '../../services/QuestService';
import { AppDataSource } from '../../config/database';
import { Quest } from '../../entities/Quest';
import { QuestCommandStep } from '../../entities/QuestCommandStep';
import { PlayerQuestStep } from '../../entities/PlayerQuestStep';
import { PlayerWorldsQuest } from '../../entities/PlayerWorldsQuest';
import { CacheService } from '../../services/CacheService';
import { LoggerService } from '../../services/LoggerService';
import { QuestStatus, StepStatus } from '@shared/types';
import { AppError } from '../../utils/AppError';

jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    createQueryBuilder: jest.fn()
  }
}));

jest.mock('../../services/CacheService');
jest.mock('../../services/LoggerService');

describe('QuestService', () => {
  let questService: QuestService;
  let mockQuestRepo: any;
  let mockQuestStepRepo: any;
  let mockPlayerQuestStepRepo: any;
  let mockPlayerWorldsQuestRepo: any;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockLoggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    mockQuestRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn()
    };

    mockQuestStepRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn()
    };

    mockPlayerQuestStepRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn()
    };

    mockPlayerWorldsQuestRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn()
    };

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
      getOrSet: jest.fn()
    } as any;

    mockLoggerService = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    (AppDataSource.getRepository as jest.Mock)
      .mockImplementation((entity) => {
        if (entity === Quest) return mockQuestRepo;
        if (entity === QuestCommandStep) return mockQuestStepRepo;
        if (entity === PlayerQuestStep) return mockPlayerQuestStepRepo;
        if (entity === PlayerWorldsQuest) return mockPlayerWorldsQuestRepo;
        return null;
      });

    questService = new QuestService(mockCacheService, mockLoggerService);
  });

  describe('getQuestById', () => {
    const mockQuest = {
      id: '1',
      name: 'Git Basics',
      description: 'Learn Git basics',
      type: 'tutorial',
      commandSteps: []
    };

    it('should return quest by id with cache hit', async () => {
      mockCacheService.get.mockResolvedValue(mockQuest);

      const result = await questService.getQuestById('1');

      expect(result).toEqual(mockQuest);
      expect(mockCacheService.get).toHaveBeenCalledWith('quest:1');
      expect(mockQuestRepo.findOne).not.toHaveBeenCalled();
    });

    it('should fetch and cache quest on cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockQuestRepo.findOne.mockResolvedValue(mockQuest);

      const result = await questService.getQuestById('1');

      expect(result).toEqual(mockQuest);
      expect(mockQuestRepo.findOne).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith('quest:1', mockQuest);
    });

    it('should return null for non-existent quest', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockQuestRepo.findOne.mockResolvedValue(null);

      const result = await questService.getQuestById('999');

      expect(result).toBeNull();
    });
  });

  describe('getQuestCommandSteps', () => {
    const mockSteps = [
      { id: '1', stepNumber: 1, commandName: 'git init' },
      { id: '2', stepNumber: 2, commandName: 'git add' }
    ];

    it('should return quest steps in correct order', async () => {
      mockQuestStepRepo.find.mockResolvedValue(mockSteps);

      const result = await questService.getQuestCommandSteps('1');

      expect(result).toEqual(mockSteps);
      expect(mockQuestStepRepo.find).toHaveBeenCalledWith({
        where: { questId: '1' },
        order: { stepNumber: 'ASC' }
      });
    });
  });

  describe('startQuest', () => {
    const userId = '1';
    const questId = '1';
    const playerWorldId = '1';

    it('should start a new quest successfully', async () => {
      const mockQuest = {
        id: questId,
        name: 'Test Quest',
        commandSteps: [
          { id: 'step1', stepNumber: 1 },
          { id: 'step2', stepNumber: 2 }
        ]
      };

      mockQuestRepo.findOne.mockResolvedValue(mockQuest);
      mockPlayerWorldsQuestRepo.findOne.mockResolvedValue(null);
      mockPlayerWorldsQuestRepo.create.mockReturnValue({
        id: '1',
        questId,
        playerWorldId,
        status: QuestStatus.IN_PROGRESS
      });

      const result = await questService.startQuest(userId, questId, playerWorldId);

      expect(result).toHaveProperty('status', QuestStatus.IN_PROGRESS);
      expect(mockPlayerWorldsQuestRepo.save).toHaveBeenCalled();
      expect(mockPlayerQuestStepRepo.save).toHaveBeenCalled();
    });

    it('should throw error if quest already started', async () => {
      mockPlayerWorldsQuestRepo.findOne.mockResolvedValue({
        id: '1',
        status: QuestStatus.IN_PROGRESS
      });

      await expect(questService.startQuest(userId, questId, playerWorldId))
        .rejects
        .toThrow('Quest already started');
    });
  });

  describe('completeQuestStep', () => {
    const stepInput = {
      questId: '1',
      stepId: '1',
      userId: '1',
      command: 'git init'
    };

    it('should complete step successfully', async () => {
      const mockStep = {
        id: '1',
        questId: '1',
        stepNumber: 1,
        commandName: 'git init',
        isOptional: false
      };

      const mockPlayerStep = {
        id: '1',
        status: StepStatus.PENDING,
        startTime: new Date(),
        attempts: 0
      };

      mockQuestStepRepo.findOne.mockResolvedValue(mockStep);
      mockPlayerQuestStepRepo.findOne.mockResolvedValue(mockPlayerStep);

      const result = await questService.completeQuestStep(stepInput);

      expect(result.isComplete).toBe(true);
      expect(result.stepResult.status).toBe(StepStatus.COMPLETED);
      expect(mockPlayerQuestStepRepo.save).toHaveBeenCalled();
    });

    it('should calculate bonus points for quick completion', async () => {
      const mockStep = {
        id: '1',
        questId: '1',
        stepNumber: 1,
        commandName: 'git init',
        isOptional: false
      };

      const startTime = new Date();
      startTime.setSeconds(startTime.getSeconds() - 30); // 30 seconds ago

      const mockPlayerStep = {
        id: '1',
        status: StepStatus.PENDING,
        startTime,
        attempts: 1
      };

      mockQuestStepRepo.findOne.mockResolvedValue(mockStep);
      mockPlayerQuestStepRepo.findOne.mockResolvedValue(mockPlayerStep);

      const result = await questService.completeQuestStep(stepInput);

      expect(result.stepResult.bonusPoints).toBeGreaterThan(0);
    });

    it('should handle failed attempts tracking', async () => {
      const mockStep = {
        id: '1',
        questId: '1',
        stepNumber: 1,
        commandName: 'git init',
        isOptional: false
      };

      const mockPlayerStep = {
        id: '1',
        status: StepStatus.PENDING,
        startTime: new Date(),
        attempts: 2,
        failedAttempts: [
          { command: 'git init -wrong', timestamp: new Date() }
        ]
      };

      mockQuestStepRepo.findOne.mockResolvedValue(mockStep);
      mockPlayerQuestStepRepo.findOne.mockResolvedValue(mockPlayerStep);

      const result = await questService.completeQuestStep(stepInput);

      expect(result.stepResult.attempts).toBe(3);
      expect(result.score).toBeLessThan(100); // Score penalty for multiple attempts
    });
  });

  describe('checkQuestCompletion', () => {
    const questId = '1';
    const userId = '1';

    it('should mark quest as completed when all steps are done', async () => {
      const mockSteps = [
        { id: '1', status: StepStatus.COMPLETED },
        { id: '2', status: StepStatus.COMPLETED }
      ];

      mockPlayerQuestStepRepo.find.mockResolvedValue(mockSteps);
      mockPlayerWorldsQuestRepo.findOne.mockResolvedValue({
        id: '1',
        status: QuestStatus.IN_PROGRESS
      });

      const result = await questService.checkQuestCompletion(questId, userId);

      expect(result.isComplete).toBe(true);
      expect(mockPlayerWorldsQuestRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: QuestStatus.COMPLETED
        })
      );
    });

    it('should not complete quest if optional steps remain', async () => {
      const mockSteps = [
        { id: '1', status: StepStatus.COMPLETED },
        { id: '2', status: StepStatus.PENDING, isOptional: true }
      ];

      mockPlayerQuestStepRepo.find.mockResolvedValue(mockSteps);

      const result = await questService.checkQuestCompletion(questId, userId);

      expect(result.isComplete).toBe(true);
    });
  });
});