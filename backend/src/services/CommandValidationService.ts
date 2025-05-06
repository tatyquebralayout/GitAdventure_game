import { AppDataSource } from '../config/database';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { PlayerQuestStep } from '../entities/PlayerQuestStep';
import { StepStatus } from '../../../shared/types/enums';
import { inject, injectable } from 'tsyringe';
import { GitCommandParser } from './GitCommandParser';
import { CacheService } from './CacheService';
import { LoggerService } from './LoggerService';

interface ValidationResult {
  success: boolean;
  message: string;
  matches?: string[];
}

interface StepValidationInput {
  questId: string;
  stepId: string;
  command: string;
  step: Partial<QuestCommandStep>;
}

interface StepValidationResult {
  success: boolean;
  message: string;
  step: PlayerQuestStep | null;
}

@injectable()
export class CommandValidationService {
  constructor(
    @inject(GitCommandParser)
    private gitParser: GitCommandParser,
    
    @inject(CacheService)
    private cacheService: CacheService,
    
    @inject(LoggerService)
    private logger: LoggerService
  ) {}

  async validateCommand(
    command: string, 
    expectedPattern: string,
    ignoreFlags: boolean = false
  ): Promise<ValidationResult> {
    try {
      const validationResult = await this.gitParser.validateCommandAgainstPattern(
        command,
        expectedPattern,
        ignoreFlags
      );

      return {
        success: validationResult.isValid,
        message: validationResult.message || 
          (validationResult.isValid ? 'Comando válido' : 'Comando inválido'),
        matches: validationResult.matches
      };
    } catch (error) {
      this.logger.error('Erro ao validar comando', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao validar o comando'
      };
    }
  }

  async validateQuestStep(input: StepValidationInput): Promise<StepValidationResult> {
    const { questId, stepId, command, step } = input;

    // Cria o progresso do passo
    const stepProgress = new PlayerQuestStep();
    stepProgress.id = `${questId}-${stepId}-${Date.now()}`;
    stepProgress.startTime = new Date();
    stepProgress.attempts = 1;
    stepProgress.timeSpent = 0;
    stepProgress.score = 0;
    stepProgress.bonusPoints = 0;

    try {
      const validationResult = await this.gitParser.validateCommandAgainstPattern(
        command,
        step.expectedPattern || ''
      );

      if (validationResult.isValid) {
        stepProgress.status = StepStatus.COMPLETED;
        stepProgress.score = 100;
        stepProgress.executedAt = new Date();
        
        // Bônus se o comando for exatamente igual ao esperado
        if (command === step.commandName) {
          stepProgress.bonusPoints = 50;
        }

        return {
          success: true,
          message: 'Passo completado com sucesso!',
          step: stepProgress
        };
      }

      // Se o passo for opcional, marca como pulado
      if (step.isOptional) {
        stepProgress.status = StepStatus.SKIPPED;
        return {
          success: true,
          message: 'Passo opcional pulado',
          step: stepProgress
        };
      }

      // Caso o comando seja inválido
      stepProgress.status = StepStatus.FAILED;
      stepProgress.failedAttempts = [{
        command,
        timestamp: new Date(),
        error: validationResult.message
      }];

      return {
        success: false,
        message: validationResult.message || 'Comando inválido',
        step: stepProgress
      };

    } catch (error) {
      this.logger.error('Erro ao validar passo da quest', error);
      
      stepProgress.status = StepStatus.FAILED;
      return {
        success: false,
        message: 'Erro ao validar o comando',
        step: stepProgress
      };
    }
  }
}