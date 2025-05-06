import { AppDataSource } from '../config/database';
import { Quest } from '../entities/Quest';
import { QuestNarrative } from '../entities/QuestNarrative';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { PlayerWorld } from '../entities/PlayerWorld';
import { PlayerWorldsQuest } from '../entities/PlayerWorldsQuest';
import { PlayerQuestStep } from '../entities/PlayerQuestStep';
import { AppError } from '../utils/AppError';

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
      relations: ['narratives', 'commandSteps']
    });
  }

  async getQuestNarratives(questId: string): Promise<QuestNarrative[]> {
    return this.narrativeRepository.find({
      where: { questId },
      order: {
        status: 'ASC'
      }
    });
  }

  async getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]> {
    return this.commandStepRepository.find({
      where: { questId },
      order: {
        stepNumber: 'ASC'
      }
    });
  }

  async startQuest(userId: string, worldId: string, questId: string): Promise<PlayerWorldsQuest> {
    // Check if player already has a world progress
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new AppError('Player has not started this world', 400);
    }

    // Check if player already started this quest
    const existingQuestProgress = await this.playerQuestRepository.findOne({
      where: { 
        playerWorldId: playerWorld.id,
        questId
      }
    });

    if (existingQuestProgress) {
      return existingQuestProgress;
    }

    // Create player quest progress
    const playerQuest = this.playerQuestRepository.create({
      playerWorldId: playerWorld.id,
      questId,
      status: 'starting'
    });

    await this.playerQuestRepository.save(playerQuest);

    // Obter os passos de comando da quest e criar progresso para cada um
    const commandSteps = await this.getQuestCommandSteps(questId);
    
    if (commandSteps.length > 0) {
      const playerSteps = commandSteps.map(step => {
        return this.playerStepRepository.create({
          playerWorldsQuestsId: playerQuest.id,
          questCommandStepId: step.id,
          status: 'pending'
        });
      });

      await this.playerStepRepository.save(playerSteps);
    }

    return playerQuest;
  }

  async completeQuestStep(
    userId: string, 
    questId: string, 
    stepId: string, 
    command: string
  ): Promise<{ success: boolean, message: string, step: PlayerQuestStep | null }> {
    // Obter o passo de comando
    const commandStep = await this.commandStepRepository.findOne({
      where: { id: stepId, questId }
    });

    if (!commandStep) {
      return { 
        success: false, 
        message: 'Passo de comando não encontrado', 
        step: null 
      };
    }

    // Verificar se o comando corresponde ao padrão esperado
    const commandRegex = new RegExp(commandStep.commandRegex);
    if (!commandRegex.test(command)) {
      return { 
        success: false, 
        message: 'Comando inválido', 
        step: null 
      };
    }

    // Obter o progresso do jogador na quest
    const playerQuest = await this.playerQuestRepository.findOne({
      where: { questId },
      relations: ['playerWorld']
    });

    if (!playerQuest || playerQuest.playerWorld.userId !== userId) {
      return { 
        success: false, 
        message: 'Progresso da quest não encontrado', 
        step: null 
      };
    }

    // Obter o passo do jogador
    const playerStep = await this.playerStepRepository.findOne({
      where: { 
        playerWorldsQuestsId: playerQuest.id,
        questCommandStepId: stepId
      }
    });

    if (!playerStep) {
      return { 
        success: false, 
        message: 'Passo não encontrado para o jogador', 
        step: null 
      };
    }

    // Atualizar o status do passo
    playerStep.status = 'completed';
    playerStep.executedAt = new Date();
    await this.playerStepRepository.save(playerStep);

    // Verificar se todos os passos foram completados e atualizar o status da quest
    const allPlayerSteps = await this.playerStepRepository.find({
      where: { playerWorldsQuestsId: playerQuest.id }
    });

    const allCompleted = allPlayerSteps.every(s => s.status === 'completed');
    if (allCompleted) {
      playerQuest.status = 'completed';
      await this.playerQuestRepository.save(playerQuest);
    } else if (playerQuest.status === 'starting') {
      playerQuest.status = 'ongoing';
      await this.playerQuestRepository.save(playerQuest);
    }

    return { 
      success: true, 
      message: commandStep.successMessage, 
      step: playerStep 
    };
  }

  async completeQuest(userId: string, worldId: string, questId: string): Promise<PlayerWorldsQuest> {
    // Verificar se o jogador já tem progresso no mundo
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new AppError('World progress not found', 404);
    }

    // Buscar o progresso da quest
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

    const allCompleted = playerSteps.every(step => step.status === 'completed');
    if (!allCompleted) {
      throw new AppError('Not all quest steps are completed', 400);
    }

    // Atualizar o status da quest
    playerQuest.status = 'completed';
    return this.playerQuestRepository.save(playerQuest);
  }
}

export const questService = new QuestService();