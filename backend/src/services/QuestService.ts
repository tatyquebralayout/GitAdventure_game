import { AppDataSource } from '../config/database';
import { Quest } from '../entities/Quest';
import { QuestNarrative } from '../entities/QuestNarrative';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { PlayerWorld } from '../entities/PlayerWorld';
import { PlayerWorldsQuest } from '../entities/PlayerWorldsQuest';
import { PlayerQuestStep } from '../entities/PlayerQuestStep';

export class QuestService {
  private questRepository = AppDataSource.getRepository(Quest);
  private narrativeRepository = AppDataSource.getRepository(QuestNarrative);
  private commandStepRepository = AppDataSource.getRepository(QuestCommandStep);
  private playerWorldRepository = AppDataSource.getRepository(PlayerWorld);
  private playerQuestRepository = AppDataSource.getRepository(PlayerWorldsQuest);
  private playerStepRepository = AppDataSource.getRepository(PlayerQuestStep);

  /**
   * Obter quest por ID
   */
  async getQuestById(id: string): Promise<Quest | null> {
    return this.questRepository.findOne({
      where: { id },
      relations: ['narratives', 'commandSteps']
    });
  }

  /**
   * Obter narrativas de uma quest
   */
  async getQuestNarratives(questId: string): Promise<QuestNarrative[]> {
    return this.narrativeRepository.find({
      where: { questId },
      order: {
        status: 'ASC'
      }
    });
  }

  /**
   * Obter passos de comando de uma quest
   */
  async getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]> {
    return this.commandStepRepository.find({
      where: { questId },
      order: {
        stepNumber: 'ASC'
      }
    });
  }

  /**
   * Iniciar uma quest para o jogador
   */
  async startQuest(userId: string, worldId: string, questId: string): Promise<PlayerWorldsQuest> {
    // Verificar se o mundo está iniciado para o jogador
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new Error('Mundo não iniciado pelo jogador');
    }

    // Verificar se a quest já foi iniciada
    const existingQuest = await this.playerQuestRepository.findOne({
      where: { 
        playerWorldId: playerWorld.id,
        questId
      }
    });

    if (existingQuest) {
      return existingQuest;
    }

    // Criar nova quest para o jogador
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

  /**
   * Completar um passo de quest
   */
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

    // Obter o progresso do jogador nesta quest
    const playerWorlds = await this.playerWorldRepository.find({
      where: { userId },
      relations: ['quests']
    });

    let playerQuest: PlayerWorldsQuest | null = null;
    for (const pw of playerWorlds) {
      const pq = pw.quests.find(q => q.questId === questId);
      if (pq) {
        playerQuest = pq;
        break;
      }
    }

    if (!playerQuest) {
      return { 
        success: false, 
        message: 'Quest não iniciada pelo jogador', 
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

  /**
   * Completar uma quest
   */
  async completeQuest(userId: string, worldId: string, questId: string): Promise<PlayerWorldsQuest> {
    // Obter o mundo do jogador
    const playerWorld = await this.playerWorldRepository.findOne({
      where: { userId, worldId }
    });

    if (!playerWorld) {
      throw new Error('Mundo não iniciado pelo jogador');
    }

    // Obter a quest do jogador
    const playerQuest = await this.playerQuestRepository.findOne({
      where: { 
        playerWorldId: playerWorld.id,
        questId
      }
    });

    if (!playerQuest) {
      throw new Error('Quest não iniciada pelo jogador');
    }

    // Atualizar status para 'completed'
    playerQuest.status = 'completed';
    await this.playerQuestRepository.save(playerQuest);

    return playerQuest;
  }
}

export const questService = new QuestService();