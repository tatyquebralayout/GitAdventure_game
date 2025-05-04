import { AppDataSource } from '../config/database';
import { Quest } from '../entities/Quest';
import { UserProgress } from '../entities/UserProgress';
import { QuestCommandStep } from '../entities/QuestCommandStep';

export class QuestService {
  // Buscar todas as quests disponíveis
  public async getAllQuests(): Promise<Quest[]> {
    try {
      const questRepository = AppDataSource.getRepository(Quest);
      return await questRepository.find({
        order: { id: 'ASC' }
      });
    } catch (error) {
      console.error('Erro ao buscar quests:', error);
      return [];
    }
  }

  // Buscar uma quest específica por ID
  public async getQuestById(questId: number): Promise<Quest | null> {
    try {
      const questRepository = AppDataSource.getRepository(Quest);
      return await questRepository.findOne({
        where: { id: questId },
        relations: ['commandSteps']
      });
    } catch (error) {
      console.error(`Erro ao buscar quest ${questId}:`, error);
      return null;
    }
  }

  // Buscar progresso do usuário em todas as quests
  public async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const userProgressRepository = AppDataSource.getRepository(UserProgress);
      return await userProgressRepository.find({
        where: { userId },
        relations: ['quest'],
        order: { questId: 'ASC' }
      });
    } catch (error) {
      console.error(`Erro ao buscar progresso do usuário ${userId}:`, error);
      return [];
    }
  }

  // Buscar progresso do usuário em uma quest específica
  public async getUserQuestProgress(userId: string, questId: number): Promise<UserProgress | null> {
    try {
      const userProgressRepository = AppDataSource.getRepository(UserProgress);
      return await userProgressRepository.findOne({
        where: { userId, questId },
        relations: ['quest']
      });
    } catch (error) {
      console.error(`Erro ao buscar progresso da quest ${questId} para o usuário ${userId}:`, error);
      return null;
    }
  }

  // Iniciar uma nova quest para o usuário
  public async startQuest(userId: string, questId: number): Promise<UserProgress | null> {
    try {
      // Verificar se a quest existe
      const questRepository = AppDataSource.getRepository(Quest);
      const quest = await questRepository.findOne({
        where: { id: questId }
      });
      
      if (!quest) {
        console.error(`Quest ${questId} não encontrada`);
        return null;
      }
      
      // Verificar se o usuário já tem progresso nesta quest
      const userProgressRepository = AppDataSource.getRepository(UserProgress);
      let userProgress = await userProgressRepository.findOne({
        where: { userId, questId }
      });
      
      // Se não tiver, criar um novo progresso
      if (!userProgress) {
        userProgress = userProgressRepository.create({
          userId,
          questId,
          currentStep: 1,
          isCompleted: false
        });
        
        await userProgressRepository.save(userProgress);
      }
      
      return userProgress;
    } catch (error) {
      console.error(`Erro ao iniciar quest ${questId} para o usuário ${userId}:`, error);
      return null;
    }
  }

  // Buscar os passos da quest atual do usuário
  public async getCurrentQuestSteps(userId: string, questId: number): Promise<QuestCommandStep[]> {
    try {
      const questCommandStepRepository = AppDataSource.getRepository(QuestCommandStep);
      return await questCommandStepRepository.find({
        where: { questId },
        order: { stepNumber: 'ASC' }
      });
    } catch (error) {
      console.error(`Erro ao buscar passos da quest ${questId}:`, error);
      return [];
    }
  }
}

export const questService = new QuestService();