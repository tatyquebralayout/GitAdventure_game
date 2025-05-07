import { AppDataSource } from '../config/database';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { PlayerQuestStep } from '../entities/PlayerQuestStep';
import { StepStatus } from '../../../shared/types/enums';
import { inject, injectable } from 'tsyringe';
import { GitCommandParser } from './GitCommandParser';
import { CacheService } from './CacheService';
import { LoggerService } from './LoggerService';

// Export interfaces so they can be reused elsewhere if needed
export interface ValidationResult {
  success: boolean;
  message: string;
  matches?: string[];
}

export interface StepValidationInput {
  questId: string;
  stepId: string;
  command: string;
  step: Partial<QuestCommandStep>;
}

export interface StepValidationResult {
  success: boolean;
  message: string;
  step: PlayerQuestStep | null;
}

@injectable()
export class CommandValidationService {
  constructor(
    @inject('GitCommandParser') // String token instead of class reference
    private gitParser: GitCommandParser,
    
    @inject('CacheService') // String token instead of class reference
    private cacheService: CacheService,
    
    @inject('LoggerService') // String token instead of class reference
    private logger: LoggerService
  ) {}

  /**
   * Validates a command against an expected pattern
   * @param command The command to validate
   * @param pattern The regex pattern to validate against
   * @returns Validation result with success status and matches if any
   */
  async validateCommand(command: string, pattern: string): Promise<ValidationResult> {
    try {
      // Parse and normalize the command
      const normalizedCommand = command.trim().toLowerCase();
      
      // Create regex from pattern
      const regex = new RegExp(pattern, 'i');
      const matches = normalizedCommand.match(regex);
      
      return {
        success: !!matches,
        message: matches ? 'Command matches expected pattern' : 'Command does not match expected pattern',
        matches: matches ? Array.from(matches) : undefined
      };
    } catch (error) {
      this.logger.error('Error validating command', { command, pattern, error });
      return {
        success: false,
        message: 'Error validating command'
      };
    }
  }

  /**
   * Validates a command for a specific quest step
   * @param input Validation input with quest and step info
   * @returns Step validation result
   */
  async validateQuestStep(input: StepValidationInput): Promise<StepValidationResult> {
    try {
      const { questId, stepId, command, step } = input;
      
      // Validate the command against the expected pattern
      const commandValidation = await this.validateCommand(command, step.commandRegex || '');
      
      if (!commandValidation.success) {
        return {
          success: false,
          message: 'Command does not match expected pattern',
          step: null
        };
      }
      
      // Create a step progress object
      const stepProgress = new PlayerQuestStep();
      stepProgress.id = `mock-${questId}-${stepId}`;
      stepProgress.questCommandStepId = stepId;
      stepProgress.playerWorldsQuestsId = `mock-player-quest`;
      stepProgress.status = StepStatus.COMPLETED;
      stepProgress.executedAt = new Date();
      stepProgress.startTime = new Date(Date.now() - 60000); // 1 minute ago
      stepProgress.timeSpent = 60; // 60 seconds
      stepProgress.attempts = 1;
      stepProgress.score = 100;
      stepProgress.bonusPoints = 50;
      
      return {
        success: true,
        message: 'Command validation successful',
        step: stepProgress
      };
    } catch (error) {
      this.logger.error('Error validating quest step', { input, error });
      return {
        success: false,
        message: 'Error validating quest step',
        step: null
      };
    }
  }
}