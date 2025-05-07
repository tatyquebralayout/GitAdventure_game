import { CommandValidationService } from '../../services/CommandValidationService';
import { GitCommandParser } from '../../services/GitCommandParser';
import { CacheService } from '../../services/CacheService';
import { LoggerService } from '../../services/LoggerService';
import { StepStatus } from '../../../shared/types/enums';
import { mock } from 'jest-mock-extended';

jest.mock('../../services/GitCommandParser');
jest.mock('../../services/CacheService');
jest.mock('../../services/LoggerService');

describe('CommandValidationService', () => {
  let service: CommandValidationService;
  let mockGitParser: jest.Mocked<GitCommandParser>;
  let mockCache: jest.Mocked<CacheService>;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    mockGitParser = mock<GitCommandParser>();
    mockCache = mock<CacheService>();
    mockLogger = mock<LoggerService>();

    service = new CommandValidationService(
      mockGitParser,
      mockCache,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCommand', () => {
    it('should validate a correct command', async () => {
      const command = 'git init';
      const expectedPattern = '^git init$';
      
      mockGitParser.validateCommandAgainstPattern.mockResolvedValue({
        isValid: true,
        message: 'Comando válido',
        matches: []
      });

      const result = await service.validateCommand(command, expectedPattern);

      expect(result.success).toBe(true);
      expect(result.message).toContain('válido');
      expect(mockGitParser.validateCommandAgainstPattern)
        .toHaveBeenCalledWith(command, expectedPattern, expect.any(Boolean));
    });

    it('should reject an invalid command', async () => {
      const command = 'git wrong';
      const expectedPattern = '^git init$';

      mockGitParser.validateCommandAgainstPattern.mockResolvedValue({
        isValid: false,
        message: 'Comando não corresponde ao padrão esperado'
      });

      const result = await service.validateCommand(command, expectedPattern);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não corresponde');
    });

    it('should handle validation errors', async () => {
      const command = 'git init';
      const expectedPattern = '^git init$';

      mockGitParser.validateCommandAgainstPattern.mockRejectedValue(
        new Error('Validation error')
      );

      const result = await service.validateCommand(command, expectedPattern);

      expect(result.success).toBe(false);
      expect(result.message).toContain('erro');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('validateQuestStep', () => {
    const mockStep = {
      id: 'step1',
      commandName: 'git init',
      expectedPattern: '^git init$',
      description: 'Initialize repository',
      isOptional: false,
      hint: 'Use git init to start'
    };

    it('should validate correct step completion', async () => {
      mockGitParser.validateCommandAgainstPattern.mockResolvedValue({
        isValid: true,
        message: 'Comando válido'
      });

      const result = await service.validateQuestStep({
        questId: 'quest1',
        stepId: 'step1',
        command: 'git init',
        step: mockStep
      });

      expect(result.success).toBe(true);
      expect(result.step?.status).toBe(StepStatus.COMPLETED);
    });

    it('should handle failed step validation', async () => {
      mockGitParser.validateCommandAgainstPattern.mockResolvedValue({
        isValid: false,
        message: 'Comando inválido'
      });

      const result = await service.validateQuestStep({
        questId: 'quest1',
        stepId: 'step1',
        command: 'git wrong',
        step: mockStep
      });

      expect(result.success).toBe(false);
      expect(result.step?.status).toBe(StepStatus.FAILED);
    });

    it('should handle optional steps', async () => {
      const optionalStep = {
        ...mockStep,
        isOptional: true
      };

      mockGitParser.validateCommandAgainstPattern.mockResolvedValue({
        isValid: false,
        message: 'Comando inválido'
      });

      const result = await service.validateQuestStep({
        questId: 'quest1',
        stepId: 'step1',
        command: 'git wrong',
        step: optionalStep
      });

      expect(result.success).toBe(true);
      expect(result.step?.status).toBe(StepStatus.SKIPPED);
    });
  });
});