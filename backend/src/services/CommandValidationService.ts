import { AppDataSource } from '../config/database';
import { QuestCommandStep } from '../entities/QuestCommandStep';
import { UserProgress } from '../entities/UserProgress';
import { Quest } from '../entities/Quest';

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

export class CommandValidationService {
  // Buscar os passos do comando de uma quest específica
  private async getQuestCommandSteps(questId: string): Promise<QuestCommandStep[]> {
    try {
      const repository = AppDataSource.getRepository(QuestCommandStep);
      return await repository.find({
        where: { questId },
        order: { stepNumber: 'ASC' }
      });
    } catch (error) {
      console.error('Erro ao buscar passos da quest:', error);
      // Fallback para os dados mockados se o banco de dados não estiver disponível
      return this.getMockedQuestSteps();
    }
  }
  
  // Dados mockados para testes ou quando o banco de dados não estiver configurado
  private getMockedQuestSteps(): QuestCommandStep[] {
    // Create a minimal Quest object for the mock data
    const dummyQuest: Quest = {
      id: '1',
      name: 'Git Basics',
      description: 'Learn the basics of Git',
      type: 'tutorial',
      parentQuestId: null,
      childQuests: [],
      questModules: [],
      narratives: [],
      worldQuests: [],
      commandSteps: [],
      playerQuests: [],
      parentQuest: null
    };

    return [
      {
        id: '1',
        questId: '1',
        stepNumber: 1,
        commandName: 'git init',
        commandRegex: '^git init$',
        description: 'Initialize a git repository',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        quest: dummyQuest,
        expectedPattern: 'git init',
        successMessage: 'Repositório Git inicializado com sucesso!',
        playerSteps: []
      },
      {
        id: '2',
        questId: '1',
        stepNumber: 2,
        commandName: 'git add',
        commandRegex: '^git add (\\.|[\\w\\.\\-_]+)$',
        description: 'Add files to staging area',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        quest: dummyQuest,
        expectedPattern: 'git add .',
        successMessage: 'Arquivos adicionados com sucesso!',
        playerSteps: []
      },
      {
        id: '3',
        questId: '1',
        stepNumber: 3,
        commandName: 'git commit',
        commandRegex: '^git commit -m "(.*)"$',
        description: 'Commit changes to repository',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        quest: dummyQuest,
        expectedPattern: 'git commit -m "mensagem"',
        successMessage: 'Alterações commitadas com sucesso!',
        playerSteps: []
      },
      {
        id: '4',
        questId: '1',
        stepNumber: 4,
        commandName: 'git branch',
        commandRegex: '^git branch ([\\w\\-_]+)$',
        description: 'Create a new branch',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        quest: dummyQuest,
        expectedPattern: 'git branch feature',
        successMessage: 'Branch criado com sucesso!',
        playerSteps: []
      },
      {
        id: '5',
        questId: '1',
        stepNumber: 5,
        commandName: 'git checkout',
        commandRegex: '^git checkout ([\\w\\-_]+)$',
        description: 'Switch to another branch',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        quest: dummyQuest,
        expectedPattern: 'git checkout feature',
        successMessage: 'Mudou para o branch com sucesso!',
        playerSteps: []
      }
    ];
  }

  // Atualizar o progresso do usuário após uma validação de comando
  private async updateUserProgress(userId: string, questId: string, currentStep: number, isCompleted: boolean): Promise<void> {
    if (!userId) return;

    try {
      const userProgressRepository = AppDataSource.getRepository(UserProgress);
      
      // Buscar progresso existente
      let progress = await userProgressRepository.findOne({
        where: {
          userId,
          questId
        }
      });
      
      const now = new Date();
      
      // Criar novo progresso se não existir
      if (!progress) {
        progress = userProgressRepository.create({
          userId,
          questId,
          currentStep,
          isCompleted,
          completedAt: isCompleted ? now : undefined
        });
      } else {
        // Atualizar progresso existente
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