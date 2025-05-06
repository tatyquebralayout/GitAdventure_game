import { Quest } from '../../entities/Quest';
import { QuestCommandStep } from '../../entities/QuestCommandStep';
import { PlayerQuestStep } from '../../entities/PlayerQuestStep';
import { QuestStatus } from '../../../shared/types/enums';

export interface CommandValidationResult {
  isValid: boolean;
  message: string;
  step?: QuestCommandStep;
}

export interface QuestProgressUpdate {
  isComplete: boolean;
  score: number;
  status: QuestStatus;
  completedSteps: number;
  totalSteps: number;
}

export interface QuestStepResult {
  stepResult: PlayerQuestStep;
  isComplete: boolean;
  score: number;
  bonusPoints?: number;
}

export interface IQuestService {
  /**
   * Get a quest by its ID
   */
  getQuestById(questId: string): Promise<Quest | null>;

  /**
   * Get all command steps for a quest in order
   */
  getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]>;

  /**
   * Start a quest for a user
   */
  startQuest(userId: string, questId: string, playerWorldId: string): Promise<QuestProgressUpdate>;

  /**
   * Complete a quest step
   */
  completeQuestStep(data: {
    questId: string;
    stepId: string;
    userId: string;
    command: string;
  }): Promise<QuestStepResult>;

  /**
   * Check if a quest is complete
   */
  checkQuestCompletion(questId: string, userId: string): Promise<QuestProgressUpdate>;

  /**
   * Get quest progress for a user
   */
  getQuestProgress(questId: string, userId: string): Promise<QuestProgressUpdate>;
}