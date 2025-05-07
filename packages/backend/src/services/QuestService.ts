import { AppDataSource } from '../config/database';
import { Quest } from '../entities/Quest';
import { QuestNarrative } from '../entities/QuestNarrative';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { PlayerWorld } from '../entities/PlayerWorld';
import { PlayerWorldsQuest } from '../entities/PlayerWorldsQuest';
import { PlayerQuestStep } from '../entities/PlayerQuestStep';
import { AppError } from '../utils/AppError';
import { QuestStatus, StepStatus } from '@shared/types';
import { injectable, inject } from 'tsyringe';
import { GitCommandParser } from './GitCommandParser';
import { CacheService } from './CacheService';
import { LoggerService } from './LoggerService';
import { QuestStepResult, QuestProgressUpdate } from './interfaces/IQuestService';
import { CommandValidationService } from './CommandValidationService';

@injectable()
export class QuestService {
  private questRepository = AppDataSource.getRepository(Quest);
  private narrativeRepository = AppDataSource.getRepository(QuestNarrative);
  private commandStepRepository = AppDataSource.getRepository(QuestCommandStep);
  private playerWorldRepository = AppDataSource.getRepository(PlayerWorld);
  private playerQuestRepository = AppDataSource.getRepository(PlayerWorldsQuest);
  private playerStepRepository = AppDataSource.getRepository(PlayerQuestStep);

  constructor(
    @inject('GitCommandParser')
    private commandParser: GitCommandParser,
    
    @inject('CacheService')
    private cacheService: CacheService,
    
    @inject('LoggerService')
    private logger: LoggerService,
    
    @inject('CommandValidationService')
    private validationService: CommandValidationService
  ) {}

  async getQuestById(id: string): Promise<Quest | null> {
    return this.questRepository.findOne({
      where: { id },
      relations: ['commandSteps', 'narratives']
    });
  }

  getQuestNarratives(questId: string): Promise<QuestNarrative[]> {
    return this.narrativeRepository.find({
      where: { questId },
      order: { status: 'ASC' }
    });
  }

  getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]> {
    return this.commandStepRepository.find({
      where: { questId },
      order: { stepNumber: 'ASC' }
    });
  }

  async startQuest(userId: string, worldId: string, questId: string): Promise<PlayerWorldsQuest> {
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new AppError('Player has not started this world', 400);
    }

    const existingQuestProgress = await this.playerQuestRepository.findOne({
      where: { 
        playerWorldId: playerWorld.id,
        questId
      }
    });

    if (existingQuestProgress) {
      return existingQuestProgress;
    }

    const playerQuest = this.playerQuestRepository.create({
      playerWorldId: playerWorld.id,
      questId,
      status: QuestStatus.STARTING,
      totalTime: 0,
      totalAttempts: 0,
      totalScore: 0
    });

    await this.playerQuestRepository.save(playerQuest);

    const steps = await this.getQuestCommandSteps(questId);
    
    if (steps.length > 0) {
      const playerSteps = steps.map(step => 
        this.playerStepRepository.create({
          playerWorldsQuestsId: playerQuest.id,
          questCommandStepId: step.id,
          status: StepStatus.PENDING,
          startTime: new Date(),
          timeSpent: 0,
          attempts: 0,
          score: 0,
          bonusPoints: 0,
          failedAttempts: []
        })
      );

      await this.playerStepRepository.save(playerSteps);
    }

    return playerQuest;
  }

  async completeQuestStep(
    questId: string,
    stepId: string,
    userId: string,
    command: string
  ): Promise<QuestStepResult> {
    try {
      // Get step information - in a real implementation, this would be fetched from the database
      const mockStep = {
        id: stepId,
        questId,
        commandName: 'git init',
        expectedPattern: '^git init$',
        description: 'Initialize a git repository',
        isOptional: false
      };
      
      // Use the validation service to validate the command
      const validationResult = await this.validationService.validateQuestStep({
        questId,
        stepId,
        command,
        step: mockStep
      });
      
      // Cache the step progress
      if (validationResult.step) {
        const cacheKey = `step-progress:${userId}:${questId}:${stepId}`;
        await this.cacheService.set(cacheKey, JSON.stringify(validationResult.step), 3600);
      }
      
      this.logger.info('Quest step validation result', {
        userId,
        questId,
        stepId,
        command,
        success: validationResult.success
      });
      
      // Transform ValidationResult to QuestStepResult
      return {
        stepResult: validationResult.step || new PlayerQuestStep(),
        isComplete: validationResult.success,
        score: validationResult.step?.score || 0,
        bonusPoints: validationResult.step?.bonusPoints || 0
      };
    } catch (error) {
      this.logger.error('Error completing quest step', { error, questId, stepId, userId });
      
      // Create a failed step for error case
      const errorStep = new PlayerQuestStep();
      errorStep.status = StepStatus.FAILED;
      errorStep.executedAt = new Date();
      
      return {
        stepResult: errorStep,
        isComplete: false,
        score: 0,
        bonusPoints: 0
      };
    }
  }

  checkQuestCompletion(_questId: string, _userId: string): Promise<QuestProgressUpdate> {
    const mockSteps = [
      { id: 'step-1', status: StepStatus.COMPLETED },
      { id: 'step-2', status: StepStatus.COMPLETED },
      { id: 'step-3', status: StepStatus.PENDING }
    ];

    const isComplete = mockSteps.filter(step => step.status === StepStatus.COMPLETED).length === 2;
    // Mock progress update object
    return Promise.resolve({
      isComplete,
      score: isComplete ? 200 : 100,
      status: isComplete ? QuestStatus.COMPLETED : QuestStatus.IN_PROGRESS,
      completedSteps: mockSteps.filter(step => step.status === StepStatus.COMPLETED).length,
      totalSteps: mockSteps.length
    });
  }

  async getQuestProgress(questId: string, userId: string): Promise<QuestProgressUpdate> {
    // In a real implementation, we would fetch the actual progress from the database
    // For the mock implementation, we'll create a simulated progress
    const mockProgress: QuestProgressUpdate = {
      isComplete: false,
      score: 150,
      status: QuestStatus.IN_PROGRESS,
      completedSteps: 2,
      totalSteps: 3
    };
    
    const cacheKey = `quest-progress:${userId}:${questId}`;
    const cachedProgress = await this.cacheService.get(cacheKey);
    
    if (cachedProgress) {
      try {
        return JSON.parse(cachedProgress);
      } catch (e) {
        this.logger.error('Error parsing cached quest progress', { error: e });
      }
    }
    
    await this.cacheService.set(cacheKey, JSON.stringify(mockProgress), 3600);
    return mockProgress;
  }

  getQuestDetails(_questId: string) {
    // implementação...
    // ...
  }

  async completeQuest(userId: string, worldId: string, questId: string): Promise<PlayerWorldsQuest> {
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new AppError('World progress not found', 404);
    }

    const playerQuest = await this.playerQuestRepository.findOne({
      where: { 
        playerWorldId: playerWorld.id,
        questId
      }
    });

    if (!playerQuest) {
      throw new AppError('Quest progress not found', 404);
    }

    const playerSteps = await this.playerStepRepository.find({
      where: { playerWorldsQuestsId: playerQuest.id }
    });

    const allCompleted = playerSteps.every(step => step.status === StepStatus.COMPLETED);
    if (!allCompleted) {
      throw new AppError('Not all quest steps are completed', 400);
    }

    playerQuest.status = QuestStatus.COMPLETED;
    return this.playerQuestRepository.save(playerQuest);
  }
}

