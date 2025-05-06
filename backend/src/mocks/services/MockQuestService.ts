import { injectable } from 'tsyringe';
import { BaseMockService } from './BaseMockService';
import { MockDataStore } from './MockDataStore';
import { IQuestService, QuestProgressUpdate, QuestStepResult } from '../../services/interfaces/IQuestService';
import { Quest } from '../../entities/Quest';
import { QuestCommandStep } from '../../entities/QuestCommandStep';
import { PlayerQuestStep } from '../../entities/PlayerQuestStep';
import { ServiceError, ServiceErrorCode } from '../../errors/ServiceError';
import { QuestStatus, StepStatus } from '../../../../shared/types/enums';
import { QuestFactory } from '../factories/QuestFactory';

@injectable()
export class MockQuestService extends BaseMockService implements IQuestService {
  private readonly quests: MockDataStore<Quest>;
  private readonly questSteps: MockDataStore<QuestCommandStep>;
  private readonly playerSteps: MockDataStore<PlayerQuestStep>;
  private readonly questProgress: MockDataStore<QuestProgressUpdate>;

  constructor() {
    super();
    this.quests = new MockDataStore<Quest>('quests');
    this.questSteps = new MockDataStore<QuestCommandStep>('questSteps');
    this.playerSteps = new MockDataStore<PlayerQuestStep>('playerSteps');
    this.questProgress = new MockDataStore<QuestProgressUpdate>('questProgress');
    this.setupInitialData();
  }

  private async setupInitialData() {
    // Create some sample quests using the factory
    const sampleQuest = QuestFactory.create();
    this.quests.set(sampleQuest.id, sampleQuest);

    // Create associated steps
    sampleQuest.commandSteps.forEach(step => {
      this.questSteps.set(step.id, step);
    });

    this.logMockOperation('setupInitialData', { questId: sampleQuest.id });
  }

  async getQuestById(questId: string): Promise<Quest | null> {
    await this.simulateDelay();
    
    const quest = this.quests.get(questId);
    if (!quest) {
      return null;
    }
    
    return this.createMockResponse(quest, 'getQuestById');
  }

  async getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]> {
    await this.simulateDelay();

    const steps = this.questSteps.find(step => step.questId === questId);
    if (!steps.length) {
      throw new ServiceError(
        ServiceErrorCode.RESOURCE_NOT_FOUND,
        'Quest steps not found',
        { questId },
        true
      );
    }

    // Sort by step number
    steps.sort((a, b) => a.stepNumber - b.stepNumber);
    return this.createMockResponse(steps, 'getQuestCommandSteps');
  }

  async startQuest(userId: string, questId: string, playerWorldId: string): Promise<QuestProgressUpdate> {
    await this.simulateDelay();

    const quest = this.quests.get(questId);
    if (!quest) {
      throw new ServiceError(
        ServiceErrorCode.RESOURCE_NOT_FOUND,
        'Quest not found',
        { questId },
        true
      );
    }

    // Check if quest is already started
    const existingProgress = this.questProgress.get(`${userId}:${questId}`);
    if (existingProgress) {
      throw new ServiceError(
        ServiceErrorCode.OPERATION_NOT_ALLOWED,
        'Quest already started',
        { questId, userId },
        true
      );
    }

    const progress: QuestProgressUpdate = {
      isComplete: false,
      score: 0,
      status: QuestStatus.IN_PROGRESS,
      completedSteps: 0,
      totalSteps: quest.commandSteps.length
    };

    this.questProgress.set(`${userId}:${questId}`, progress);
    return this.createMockResponse(progress, 'startQuest');
  }

  async completeQuestStep(data: {
    questId: string;
    stepId: string;
    userId: string;
    command: string;
  }): Promise<QuestStepResult> {
    await this.simulateDelay();

    const { questId, stepId, userId, command } = data;
    const step = this.questSteps.get(stepId);

    if (!step) {
      throw new ServiceError(
        ServiceErrorCode.RESOURCE_NOT_FOUND,
        'Quest step not found',
        { stepId },
        true
      );
    }

    // Simulate command validation
    const isValid = command.match(new RegExp(step.commandRegex));
    
    const stepResult: PlayerQuestStep = {
      id: `step-progress-${Date.now()}`,
      playerWorldsQuestsId: `${userId}:${questId}`,
      questCommandStepId: stepId,
      status: isValid ? StepStatus.COMPLETED : StepStatus.FAILED,
      startTime: new Date(),
      executedAt: new Date(),
      timeSpent: 0,
      attempts: 1,
      score: isValid ? 100 : 0,
      bonusPoints: isValid ? 50 : 0,
      failedAttempts: !isValid ? [{ command, timestamp: new Date() }] : []
    };

    // Update progress if step is completed
    if (isValid) {
      const progress = this.questProgress.get(`${userId}:${questId}`);
      if (progress) {
        progress.completedSteps++;
        progress.score += stepResult.score + (stepResult.bonusPoints || 0);
        this.questProgress.set(`${userId}:${questId}`, progress);
      }
    }

    this.playerSteps.set(`${userId}:${stepId}`, stepResult);
    
    return this.createMockResponse({
      stepResult,
      isComplete: isValid,
      score: stepResult.score,
      bonusPoints: stepResult.bonusPoints
    }, 'completeQuestStep');
  }

  async checkQuestCompletion(questId: string, userId: string): Promise<QuestProgressUpdate> {
    await this.simulateDelay();

    const progress = this.questProgress.get(`${userId}:${questId}`);
    if (!progress) {
      throw new ServiceError(
        ServiceErrorCode.RESOURCE_NOT_FOUND,
        'Quest progress not found',
        { questId, userId },
        true
      );
    }

    const quest = this.quests.get(questId);
    if (!quest) {
      throw new ServiceError(
        ServiceErrorCode.RESOURCE_NOT_FOUND,
        'Quest not found',
        { questId },
        true
      );
    }

    // Update completion status
    progress.isComplete = progress.completedSteps === progress.totalSteps;
    if (progress.isComplete) {
      progress.status = QuestStatus.COMPLETED;
    }

    this.questProgress.set(`${userId}:${questId}`, progress);
    return this.createMockResponse(progress, 'checkQuestCompletion');
  }

  async getQuestProgress(questId: string, userId: string): Promise<QuestProgressUpdate> {
    await this.simulateDelay();

    const progress = this.questProgress.get(`${userId}:${questId}`);
    if (!progress) {
      throw new ServiceError(
        ServiceErrorCode.RESOURCE_NOT_FOUND,
        'Quest progress not found',
        { questId, userId },
        true
      );
    }

    return this.createMockResponse(progress, 'getQuestProgress');
  }
}