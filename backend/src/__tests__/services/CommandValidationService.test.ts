import { CommandValidationService } from '../../services/CommandValidationService';
import { GitCommandParser } from '../../services/GitCommandParser';
import { QuestService } from '../../services/QuestService';
import { container } from '../../config/container';
import { AppError } from '../../utils/AppError';
import { Quest } from '../../entities/Quest';
import { QuestCommandStep } from '../../entities/QuestCommandStep';
import { StepStatus } from '../../types/enums';

jest.mock('../../services/GitCommandParser');
jest.mock('../../services/QuestService');

describe('CommandValidationService', () => {
  let service: CommandValidationService;
  let mockGitParser: jest.Mocked<GitCommandParser>;
  let mockQuestService: jest.Mocked<QuestService>;

  beforeEach(() => {
    mockGitParser = {
      parseCommand: jest.fn(),
      validateSemantics: jest.fn()
    } as any;

    mockQuestService = {
      getQuestById: jest.fn(),
      getQuestCommandSteps: jest.fn(),
      completeQuestStep: jest.fn()
    } as any;

    container.registerInstance('GitCommandParser', mockGitParser);
    container.registerInstance('QuestService', mockQuestService);

    service = container.resolve(CommandValidationService);
  });

  describe('validateCommand', () => {
    const mockRequest = {
      command: 'git init',
      questId: '123',
      currentStep: 1,
      userId: 'user123'
    };

    it('should validate a correct command for current step', async () => {
      mockGitParser.parseCommand.mockResolvedValue({
        action: 'init',
        args: [],
        rawCommand: 'git init',
        isValid: true
      });

      mockGitParser.validateSemantics.mockResolvedValue({
        isValid: true,
        message: ''
      });

      const mockQuest = new Quest();
      mockQuest.id = '123';
      mockQuest.title = 'Test Quest';
      mockQuestService.getQuestById.mockResolvedValue(mockQuest);

      const mockStep = new QuestCommandStep();
      mockStep.id = 'step1';
      mockStep.stepNumber = 1;
      mockStep.expectedCommand = 'init';
      mockStep.commandRegex = '^git init$';
      mockStep.successMessage = 'Great job!';
      
      mockQuestService.getQuestCommandSteps.mockResolvedValue([mockStep]);

      mockQuestService.completeQuestStep.mockResolvedValue({
        isComplete: true,
        message: 'Step completed',
        stepResult: {
          status: StepStatus.COMPLETED,
          score: 100
        }
      });

      const result = await service.validateCommand(mockRequest);

      expect(result.isComplete).toBe(true);
      expect(result.message).toBe('Step completed');
      expect(mockQuestService.completeQuestStep).toHaveBeenCalled();
    });

    it('should reject invalid git commands', async () => {
      mockGitParser.parseCommand.mockRejectedValue(new Error('Not a git command'));

      await expect(service.validateCommand(mockRequest))
        .rejects
        .toThrow(AppError);
    });

    it('should reject commands that fail semantic validation', async () => {
      mockGitParser.parseCommand.mockResolvedValue({
        action: 'commit',
        args: [],
        rawCommand: 'git commit',
        isValid: true
      });

      mockGitParser.validateSemantics.mockResolvedValue({
        isValid: false,
        message: 'Commit message required'
      });

      await expect(service.validateCommand(mockRequest))
        .rejects
        .toThrow(AppError);
    });

    it('should handle non-existent quests', async () => {
      mockGitParser.parseCommand.mockResolvedValue({
        action: 'init',
        args: [],
        rawCommand: 'git init',
        isValid: true
      });

      mockQuestService.getQuestById.mockResolvedValue(null);

      await expect(service.validateCommand(mockRequest))
        .rejects
        .toThrow('Quest not found');
    });

    it('should validate quest step order', async () => {
      mockGitParser.parseCommand.mockResolvedValue({
        action: 'add',
        args: ['.'],
        rawCommand: 'git add .',
        isValid: true
      });

      const mockStep1 = new QuestCommandStep();
      mockStep1.id = 'step1';
      mockStep1.stepNumber = 1;
      mockStep1.expectedCommand = 'init';
      mockStep1.commandRegex = '^git init$';

      const mockStep2 = new QuestCommandStep();
      mockStep2.id = 'step2';
      mockStep2.stepNumber = 2;
      mockStep2.expectedCommand = 'add';
      mockStep2.commandRegex = '^git add';

      mockQuestService.getQuestCommandSteps.mockResolvedValue([mockStep1, mockStep2]);

      await expect(service.validateCommand({
        ...mockRequest,
        currentStep: 1
      }))
        .rejects
        .toThrow('Invalid step command');
    });
  });
});