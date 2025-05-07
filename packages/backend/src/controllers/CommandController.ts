import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { CommandValidationService } from '../services/CommandValidationService';
import { GitCommandParser } from '../services/GitCommandParser';
import { AppError } from '../utils/AppError';

export interface ValidateCommandRequestDto {
  command: string;
  questId: string;
  currentStep?: number;
  userId?: string;
}

@injectable()
export class CommandController {
  constructor(
    @inject('GitCommandParser') private gitParser: GitCommandParser,
    @inject('CommandValidationService') private commandValidationService: CommandValidationService
  ) {}

  public async validateCommand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { command, questId, currentStep } = req.body as ValidateCommandRequestDto;
      
      if (!command || !questId) {
        throw new AppError('Command and questId are required', 400);
      }

      // Primeiro validar a sintaxe do comando
      const parsedCommand = await this.gitParser.parseCommand(command);
      if (!parsedCommand.isValid) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid Git command syntax' 
        });
        return;
      }

      // Depois validar a semântica
      const semanticResult = await this.gitParser.validateSemantics(parsedCommand);
      if (!semanticResult.isValid) {
        res.status(400).json({
          success: false,
          message: semanticResult.message,
          details: semanticResult.details
        });
        return;
      }

      // Por fim, validar contra os requisitos da quest
      const result = await this.commandValidationService.validateCommand({
        command,
        questId,
        currentStep,
        userId
      });
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

// Mocks simples para uso em modo mock
interface ParsedCommandMock {
  isValid: boolean;
  message: string;
  command: string;
  args: string[];
  options: Record<string, string | boolean>;
}
interface ValidationResultMock {
  isValid: boolean;
  message?: string;
  details?: unknown;
}
class MockGitCommandParser {
  async parseCommand(command: string): Promise<ParsedCommandMock> {
    return { isValid: true, message: '', command, args: [], options: {} };
  }
  async validateSemantics(_parsedCommand: ParsedCommandMock): Promise<ValidationResultMock> {
    return { isValid: true, message: '', details: {} };
  }
}
class MockCommandValidationService {
  async validateCommand(_input: unknown, _pattern?: string): Promise<{ success: boolean; message: string; details?: unknown }> {
    return { success: true, message: 'Mock validation', details: {} };
  }
}

export const commandController = new CommandController(
  new MockGitCommandParser() as unknown as GitCommandParser,
  new MockCommandValidationService() as unknown as CommandValidationService
);