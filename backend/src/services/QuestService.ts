import { AppDataSource } from '../config/database';
import { Quest } from '../entities/Quest';
import { QuestNarrative } from '../entities/QuestNarrative';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { PlayerWorld } from '../entities/PlayerWorld';
import { PlayerWorldsQuest } from '../entities/PlayerWorldsQuest';
import { PlayerQuestStep } from '../entities/PlayerQuestStep';
import { AppError } from '../utils/AppError';
import { QuestStatus, StepStatus } from '../../../shared/types/enums';
import { injectable } from 'tsyringe';

@injectable()
export class QuestService {
  private questRepository = AppDataSource.getRepository(Quest);
  private narrativeRepository = AppDataSource.getRepository(QuestNarrative);
  private commandStepRepository = AppDataSource.getRepository(QuestCommandStep);
  private playerWorldRepository = AppDataSource.getRepository(PlayerWorld);
  private playerQuestRepository = AppDataSource.getRepository(PlayerWorldsQuest);
  private playerStepRepository = AppDataSource.getRepository(PlayerQuestStep);

  async getQuestById(id: string): Promise<Quest | null> {
    return this.questRepository.findOne({
      where: { id },
      relations: ['commandSteps', 'narratives']
    });
  }

  async getQuestNarratives(questId: string): Promise<QuestNarrative[]> {
    return this.narrativeRepository.find({
      where: { questId },
      order: { status: 'ASC' }
    });
  }

  async getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]> {
    return this.commandStepRepository.find({
      where: { questId },
      order: { stepNumber: 'ASC' }
    });
  }

  async startQuest(userId: string, worldId: string, questId: string): Promise<PlayerWorldsQuest> {
    // Verificar se o jogador já tem progresso no mundo
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new AppError('Player has not started this world', 400);
    }

    // Verificar se o jogador já iniciou esta quest
    const existingQuestProgress = await this.playerQuestRepository.findOne({
      where: { 
        playerWorldId: playerWorld.id,
        questId
      }
    });

    if (existingQuestProgress) {
      return existingQuestProgress;
    }

    // Criar progresso da quest
    const playerQuest = this.playerQuestRepository.create({
      playerWorldId: playerWorld.id,
      questId,
      status: QuestStatus.STARTING,
      totalTime: 0,
      totalAttempts: 0,
      totalScore: 0
    });

    await this.playerQuestRepository.save(playerQuest);

    // Criar progresso para cada passo
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
    userId: string, 
    questId: string, 
    stepId: string, 
    command: string
  ): Promise<{ success: boolean; message: string; step: PlayerQuestStep | null }> {
    // Verificar se o passo existe
    const step = await this.commandStepRepository.findOne({
      where: { id: stepId, questId }
    });

    if (!step) {
      throw new AppError('Quest step not found', 404);
    }

    // Buscar o progresso da quest
    const playerQuest = await this.playerQuestRepository.findOne({
      where: { questId },
      relations: ['playerWorld']
    });

    if (!playerQuest || playerQuest.playerWorld.userId !== userId) {
      throw new AppError('Quest progress not found', 404);
    }

    // Buscar o progresso do passo
    const playerStep = await this.playerStepRepository.findOne({
      where: { 
        playerWorldsQuestsId: playerQuest.id,
        questCommandStepId: stepId
      }
    });

    if (!playerStep) {
      throw new AppError('Step progress not found', 404);
    }

    // Calcular tempo gasto e pontuação
    const now = new Date();
    const timeSpent = playerStep.startTime 
      ? Math.floor((now.getTime() - playerStep.startTime.getTime()) / 1000)
      : 0;

    playerStep.timeSpent += timeSpent;
    playerStep.attempts += 1;

    // Validar o comando
    const commandRegex = new RegExp(step.commandRegex);
    if (!commandRegex.test(command)) {
      // Registrar tentativa falha
      playerStep.failedAttempts.push({
        command,
        timestamp: now,
        error: 'Invalid command format'
      });

      playerStep.status = StepStatus.FAILED;
      await this.playerStepRepository.save(playerStep);

      return { 
        success: false, 
        message: 'Invalid command', 
        step: playerStep 
      };
    }

    // Calcular pontuação
    const baseScore = 100;
    const timeBonus = Math.max(0, 50 - Math.floor(timeSpent / 60));
    const attemptsBonus = Math.max(0, 50 - (playerStep.attempts - 1) * 10);
    const stepScore = baseScore + timeBonus + attemptsBonus;

    // Atualizar status e pontuação do passo
    playerStep.status = StepStatus.COMPLETED;
    playerStep.executedAt = now;
    playerStep.score = stepScore;
    playerStep.bonusPoints = timeBonus + attemptsBonus;

    await this.playerStepRepository.save(playerStep);

    // Atualizar status e pontuação da quest
    playerQuest.totalTime += timeSpent;
    playerQuest.totalAttempts += 1;
    playerQuest.totalScore += stepScore;

    // Verificar se todos os passos foram completados
    const allSteps = await this.playerStepRepository.find({
      where: { playerWorldsQuestsId: playerQuest.id }
    });

    const allCompleted = allSteps.every(s => s.status === StepStatus.COMPLETED);
    
    if (allCompleted) {
      playerQuest.status = QuestStatus.COMPLETED;
    } else if (playerQuest.status === QuestStatus.STARTING) {
      playerQuest.status = QuestStatus.IN_PROGRESS;
    }

    await this.playerQuestRepository.save(playerQuest);

    return { 
      success: true, 
      message: step.successMessage, 
      step: playerStep 
    };
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

    // Verificar se todos os passos foram completados
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

export const questService = new QuestService();