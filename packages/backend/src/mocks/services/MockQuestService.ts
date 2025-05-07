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
import { MockValidators, MockDataGenerators, MockTimingUtils } from './mockUtils';

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
    return this.createMockResponse(quest || null, 'getQuestById');
  }

  async getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]> {
    await this.simulateDelay();

    const steps = this.questSteps.find(step => step.questId === questId);
    MockValidators.validateResourceExists(
      steps.length > 0,
      'Quest steps',
      questId,
      true
    );

    // Sort by step number
    steps.sort((a, b) => a.stepNumber - b.stepNumber);
    return this.createMockResponse(steps, 'getQuestCommandSteps');
  }

  async startQuest(userId: string, questId: string, playerWorldId: string): Promise<QuestProgressUpdate> {
    await this.simulateDelay();

    const quest = MockValidators.validateResourceExists(
      this.quests.get(questId),
      'Quest',
      questId,
      true
    );

    // Check if quest is already started
    const progressKey = `${userId}:${questId}`;
    MockValidators.validateResourceNotExists(
      this.questProgress.get(progressKey),
      'Quest progress',
      { questId, userId },
      true
    );

    const progress: QuestProgressUpdate = {
      isComplete: false,
      score: 0,
      status: QuestStatus.IN_PROGRESS,
      completedSteps: 0,
      totalSteps: quest.commandSteps.length
    };

    this.questProgress.set(progressKey, progress);
    return this.createMockResponse(progress, 'startQuest');
  }

  async completeQuestStep(questId: string, stepId: string, userId: string, command: string): Promise<QuestStepResult> {
    await this.simulateDelay();

    const step = MockValidators.validateResourceExists(
      this.questSteps.get(stepId),
      'Quest step',
      stepId,
      true
    );

    // Validate command
    const isValid = MockValidators.validateCommand(command, step.commandRegex, true);
    const startTime = MockDataGenerators.generateDate(0, 5); // Random start time in last 5 minutes
    const executedAt = new Date();
    const timeSpent = MockTimingUtils.calculateTimeSpentSeconds(startTime, executedAt);
    
    const stepResult: PlayerQuestStep = {
      id: MockDataGenerators.generateId('step-progress'),
      playerWorldsQuestsId: `${userId}:${questId}`,
      questCommandStepId: stepId,
      status: isValid ? StepStatus.COMPLETED : StepStatus.FAILED,
      startTime,
      executedAt,
      timeSpent,
      attempts: 1,
      score: isValid ? 100 : 0,
      bonusPoints: isValid ? MockTimingUtils.calculateTimeBonus(timeSpent) : 0,
      failedAttempts: !isValid ? [{ command, timestamp: executedAt }] : []
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

    const progressKey = `${userId}:${questId}`;
    const progress = MockValidators.validateResourceExists(
      this.questProgress.get(progressKey),
      'Quest progress',
      progressKey,
      true
    );

    const quest = MockValidators.validateResourceExists(
      this.quests.get(questId),
      'Quest',
      questId,
      true
    );

    // Update completion status
    progress.isComplete = progress.completedSteps === progress.totalSteps;
    if (progress.isComplete) {
      progress.status = QuestStatus.COMPLETED;
    }

    this.questProgress.set(progressKey, progress);
    return this.createMockResponse(progress, 'checkQuestCompletion');
  }

  async getQuestProgress(questId: string, userId: string): Promise<QuestProgressUpdate> {
    await this.simulateDelay();

    const progressKey = `${userId}:${questId}`;
    const progress = MockValidators.validateResourceExists(
      this.questProgress.get(progressKey),
      'Quest progress',
      progressKey,
      true
    );

    return this.createMockResponse(progress, 'getQuestProgress');
  }
}