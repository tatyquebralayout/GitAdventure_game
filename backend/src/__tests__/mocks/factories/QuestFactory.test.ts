import { QuestFactory } from '../../../mocks/factories/QuestFactory';
import { ModuleTheme } from '../../../../shared/types/enums';
import { Quest } from '../../../entities/Quest';
import { QuestCommandStep } from '../../../entities/QuestCommandStep';

describe('QuestFactory', () => {
  describe('create', () => {
    it('should create a quest with default values', () => {
      const quest = QuestFactory.create();

      expect(quest).toBeInstanceOf(Quest);
      expect(quest.id).toBeDefined();
      expect(quest.name).toBeDefined();
      expect(quest.type).toMatch(/^(tutorial|challenge|practice)$/);
      expect(quest.commandSteps).toBeInstanceOf(Array);
      expect(quest.commandSteps.length).toBeGreaterThanOrEqual(3);
      expect(quest.commandSteps.length).toBeLessThanOrEqual(7);
    });

    it('should honor override values', () => {
      const override = {
        name: 'Custom Quest',
        description: 'Custom Description',
        type: 'challenge',
        commandSteps: [
          { id: 'step1', stepNumber: 1 }
        ] as QuestCommandStep[]
      };

      const quest = QuestFactory.create(override);

      expect(quest.name).toBe(override.name);
      expect(quest.description).toBe(override.description);
      expect(quest.type).toBe(override.type);
      expect(quest.commandSteps).toEqual(override.commandSteps);
    });

    it('should generate unique IDs for each quest', () => {
      const quest1 = QuestFactory.create();
      const quest2 = QuestFactory.create();

      expect(quest1.id).not.toBe(quest2.id);
    });
  });

  describe('createCommandStep', () => {
    it('should create a command step with valid defaults', () => {
      const questId = 'test-quest-id';
      const stepNumber = 1;

      const step = QuestFactory.createCommandStep(questId, stepNumber);

      expect(step).toBeInstanceOf(QuestCommandStep);
      expect(step.questId).toBe(questId);
      expect(step.stepNumber).toBe(stepNumber);
      expect(step.commandName).toBeDefined();
      expect(step.commandRegex).toBeDefined();
      expect(step.expectedPattern).toBeDefined();
    });

    it('should override command properties correctly', () => {
      const override = {
        commandName: 'git init',
        commandRegex: '^git init$',
        description: 'Custom description',
        isOptional: true
      };

      const step = QuestFactory.createCommandStep('test-id', 1, override);

      expect(step.commandName).toBe(override.commandName);
      expect(step.commandRegex).toBe(override.commandRegex);
      expect(step.description).toBe(override.description);
      expect(step.isOptional).toBe(override.isOptional);
    });

    it('should select appropriate command based on name override', () => {
      const step = QuestFactory.createCommandStep('test-id', 1, {
        commandName: 'git commit'
      });

      expect(step.commandRegex).toContain('commit');
      expect(step.expectedPattern).toContain('commit');
    });
  });

  describe('createSequential', () => {
    it('should create a sequence of related quests', () => {
      const count = 3;
      const theme = ModuleTheme.GIT_BASICS;

      const quests = QuestFactory.createSequential(count, theme);

      expect(quests).toHaveLength(count);
      expect(quests[0].type).toBe('tutorial');
      expect(quests[1].parentQuestId).toBe(quests[0].id);
      expect(quests[2].parentQuestId).toBe(quests[1].id);
    });

    it('should create thematic steps for each quest', () => {
      const quests = QuestFactory.createSequential(2, ModuleTheme.BRANCHING);

      quests.forEach(quest => {
        expect(quest.commandSteps.some(step => 
          step.commandName.includes('branch') || 
          step.commandName.includes('checkout')
        )).toBe(true);
      });
    });

    it('should increase difficulty with sequence', () => {
      const quests = QuestFactory.createSequential(4, ModuleTheme.GIT_BASICS);

      // Later quests should have more steps
      expect(quests[3].commandSteps.length)
        .toBeGreaterThan(quests[0].commandSteps.length);
    });
  });

  describe('createThematicSteps', () => {
    it('should create git basics themed steps', () => {
      const quest = QuestFactory.create();
      const steps = (QuestFactory as any).createThematicSteps(ModuleTheme.GIT_BASICS, 0);

      expect(steps[0].commandName).toBe('git init');
      expect(steps[1].commandName).toBe('git add');
      expect(steps[2].commandName).toBe('git commit');
    });

    it('should create branching themed steps', () => {
      const quest = QuestFactory.create();
      const steps = (QuestFactory as any).createThematicSteps(ModuleTheme.BRANCHING, 0);

      expect(steps[0].commandName).toBe('git branch');
      expect(steps[1].commandName).toBe('git checkout');
      expect(steps[2].commandName).toBe('git merge');
    });

    it('should adjust step count based on difficulty', () => {
      const easySteps = (QuestFactory as any).createThematicSteps(ModuleTheme.GIT_BASICS, 0);
      const hardSteps = (QuestFactory as any).createThematicSteps(ModuleTheme.GIT_BASICS, 4);

      expect(hardSteps.length).toBeGreaterThan(easySteps.length);
    });
  });
});