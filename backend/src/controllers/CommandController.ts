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