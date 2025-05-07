import { Quest } from '../entities/Quest';
import { QuestCommandStep } from '../entities/QuestCommandStep';

export function createMockQuest(override = {}): Quest {
  return {
    id: 'mock-quest-id',
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
    parentQuest: null,
    ...override
  };
}

export function createMockQuestSteps(questId = '1'): QuestCommandStep[] {
  const dummyQuest = createMockQuest({ id: questId });

  return [
    {
      id: '1',
      questId,
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
      questId,
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
      questId,
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
      questId,
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
      questId,
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