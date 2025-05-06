import { AppDataSource } from '../config/database';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { UserProgress } from '../entities/UserProgress';
import { Quest } from '../entities/Quest';
import { AppError } from '../utils/AppError';
import { FindOperator, MoreThanOrEqual } from 'typeorm';
import { BaseService } from './baseService';
import { createMockQuestSteps } from '../mocks/questMocks';

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
}

export class CommandValidationService extends BaseService {
  private readonly userProgressRepository = AppDataSource.getRepository(UserProgress);
  private readonly questStepRepository = AppDataSource.getRepository(QuestCommandStep);

  // Buscar os passos do comando de uma quest específica
  private async getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]> {
    return this.getDataOrMock(
      () => this.questStepRepository.find({
        where: { questId },
        order: { stepNumber: 'ASC' }
      }),
      () => createMockQuestSteps(questId)
    );
  }

  private async checkQuestProgress(userId: string, questId: string, requiredStepIndex?: number): Promise<UserProgress | null> {
    const whereClause: { userId: string; questId: string; currentStep?: FindOperator<number> } = {
      userId,
      questId
    };

    if (requiredStepIndex !== undefined) {
      whereClause.currentStep = MoreThanOrEqual(requiredStepIndex);
    }

    const progress = await this.userProgressRepository.findOne({ where: whereClause });

    if (!progress && requiredStepIndex !== undefined && requiredStepIndex > 0) {
      return null;
    }

    return progress;
  }

  private async updateQuestProgress(userId: string, questId: string, stepIndex: number): Promise<UserProgress> {
    let progress = await this.userProgressRepository.findOneBy({ userId, questId });

    if (!progress) {
      if (stepIndex !== 0) {
        throw new AppError('Quest not started or previous steps not completed.', 400);
      }
      progress = this.userProgressRepository.create({
        userId,
        questId,
        currentStep: stepIndex,
        isCompleted: false,
        completedAt: null
      });
    } else {
      if (stepIndex > progress.currentStep + 1) {
        throw new AppError('Cannot skip quest steps.', 400);
      }
      if (stepIndex > progress.currentStep) {
        progress.currentStep = stepIndex;
      }
    }

    return this.userProgressRepository.save(progress);
  }

  // Atualizar o progresso do usuário após uma validação de comando
  private async updateUserProgress(userId: string, questId: string, currentStep: number, isCompleted: boolean): Promise<void> {
    if (!userId) return;

    try {
      const userProgressRepository = AppDataSource.getRepository(UserProgress);
      
      let progress = await userProgressRepository.findOne({
        where: {
          userId,
          questId
        }
      });
      
      const now = new Date();
      
      if (!progress) {
        progress = userProgressRepository.create({
          userId,
          questId,
          currentStep,
          isCompleted,
          completedAt: isCompleted ? now : undefined
        });
      } else {
        progress.currentStep = currentStep;
        progress.isCompleted = isCompleted;
        if (isCompleted) {
          progress.completedAt = now;
        }
      }
      
      await userProgressRepository.save(progress);
    } catch (error) {
      console.error('Erro ao atualizar progresso do usuário:', error);
    }
  }

  // Validar um comando de Git
  public async validateCommand(data: ValidateCommandRequestDto): Promise<ValidateCommandResponseDto> {
    const { command, questId, currentStep = 1, userId } = data;
    
    // Buscar os passos da quest especificada
    const steps = await this.getQuestCommandSteps(questId);
    
    if (steps.length === 0) {
      return {
        valid: false,
        message: 'Quest não encontrada'
      };
    }
    
    // Encontrar o passo atual
    const currentStepData = steps.find(step => step.stepNumber === currentStep);
    if (!currentStepData) {
      return {
        valid: false,
        message: 'Passo inválido para esta quest'
      };
    }
    
    // Verificar se o comando corresponde ao padrão esperado
    const regex = new RegExp(currentStepData.commandRegex);
    const isValidCommand = regex.test(command);
    
    if (isValidCommand) {
      // Determinar o próximo passo ou se a quest foi concluída
      const nextStep = steps.find(step => step.stepNumber > currentStep);
      const isQuestCompleted = !nextStep;
      
      // Atualizar o progresso do usuário se o userId estiver presente
      if (userId) {
        await this.updateUserProgress(
          userId, 
          questId, 
          nextStep?.stepNumber || currentStep + 1, 
          isQuestCompleted
        );
      }
      
      return {
        valid: true,
        message: `Comando '${command}' é válido.`,
        nextStep: nextStep?.stepNumber,
        commandName: currentStepData.commandName,
        isQuestCompleted
      };
    } else {
      return {
        valid: false,
        message: `Comando inválido. Esperado: ${currentStepData.description}`,
        commandName: currentStepData.commandName
      };
    }
  }
}

export const commandValidationService = new CommandValidationService();