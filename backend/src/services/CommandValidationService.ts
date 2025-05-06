import { AppDataSource } from '../config/database';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { UserProgress } from '../entities/UserProgress';
import { AppError } from '../utils/AppError';
import { FindOperator, MoreThanOrEqual } from 'typeorm';
import { BaseService } from './baseService';
import { inject, injectable } from 'tsyringe';
import { GitCommandParser } from './GitCommandParser';
import { StepStatus } from '../../../shared/types/enums';

// Request DTO para validação de comando
export interface ValidateCommandRequestDto {
  command: string;
  questId: string;
  currentStep?: number;
  userId?: string;
}

// Response DTO para validação de comando
export interface ValidateCommandResponseDto {
  valid: boolean;
  message: string;
  nextStep?: number;
  commandName?: string;
  isQuestCompleted?: boolean;
  details?: {
    score?: number;
    timeSpent?: number;
    attempts?: number;
  };
}

@injectable()
export class CommandValidationService extends BaseService {
  constructor(
    @inject(GitCommandParser) private gitParser: GitCommandParser
  ) {
    super();
  }

  private readonly userProgressRepository = AppDataSource.getRepository(UserProgress);
  private readonly questStepRepository = AppDataSource.getRepository(QuestCommandStep);

  // Validar um comando de Git
  public async validateCommand(data: ValidateCommandRequestDto): Promise<ValidateCommandResponseDto> {
    const { command, questId, currentStep = 1, userId } = data;
    
    try {
      // Parse e validação sintática do comando
      const parsedCommand = await this.gitParser.parseCommand(command);
      if (!parsedCommand.isValid) {
        return {
          valid: false,
          message: 'Invalid Git command syntax'
        };
      }

      // Buscar o passo atual
      const currentStepData = await this.questStepRepository.findOneOrFail({
        where: { questId, stepNumber: currentStep }
      });

      // Validar se o comando corresponde ao esperado
      const commandRegex = new RegExp(currentStepData.commandRegex);
      if (!commandRegex.test(command)) {
        return {
          valid: false,
          message: `Invalid command. Expected: ${currentStepData.description}`,
          commandName: currentStepData.commandName
        };
      }

      // Validação semântica do comando Git
      const semanticResult = await this.gitParser.validateSemantics(parsedCommand);
      if (!semanticResult.isValid) {
        return {
          valid: false,
          message: semanticResult.message || 'Invalid command semantics',
          commandName: currentStepData.commandName
        };
      }

      // Buscar próximo passo
      const nextStep = await this.questStepRepository.findOne({
        where: { questId, stepNumber: currentStep + 1 }
      });

      // Atualizar progresso se houver userId
      if (userId) {
        const progress = await this.updateProgress(userId, questId, currentStep, !nextStep);
        
        return {
          valid: true,
          message: currentStepData.successMessage,
          nextStep: nextStep?.stepNumber,
          commandName: currentStepData.commandName,
          isQuestCompleted: !nextStep,
          details: {
            score: progress.score,
            timeSpent: progress.timeSpent,
            attempts: progress.attempts
          }
        };
      }

      return {
        valid: true,
        message: currentStepData.successMessage,
        nextStep: nextStep?.stepNumber,
        commandName: currentStepData.commandName,
        isQuestCompleted: !nextStep
      };

    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to validate command',
        400
      );
    }
  }

  private async updateProgress(
    userId: string,
    questId: string,
    currentStep: number,
    isCompleted: boolean
  ): Promise<{ score: number; timeSpent: number; attempts: number }> {
    const progress = await this.userProgressRepository.findOne({
      where: { userId, questId }
    });

    const now = new Date();
    const timeSpent = progress?.startTime 
      ? Math.floor((now.getTime() - progress.startTime.getTime()) / 1000)
      : 0;

    const attempts = (progress?.attempts || 0) + 1;
    const baseScore = 100;
    const timeBonus = Math.max(0, 50 - Math.floor(timeSpent / 60)); // Bônus por completar rápido
    const attemptsBonus = Math.max(0, 50 - (attempts - 1) * 10); // Bônus por menos tentativas
    const score = baseScore + timeBonus + attemptsBonus;

    const newProgress = progress || this.userProgressRepository.create({
      userId,
      questId,
      currentStep: 1,
      startTime: now
    });

    newProgress.currentStep = currentStep;
    newProgress.isCompleted = isCompleted;
    newProgress.timeSpent = (newProgress.timeSpent || 0) + timeSpent;
    newProgress.attempts = attempts;
    newProgress.score = (newProgress.score || 0) + score;
    
    if (isCompleted) {
      newProgress.completedAt = now;
    }

    await this.userProgressRepository.save(newProgress);

    return {
      score,
      timeSpent,
      attempts
    };
  }
}