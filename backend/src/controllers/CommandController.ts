import { Request, Response, NextFunction } from 'express';
import { commandValidationService, ValidateCommandRequestDto } from '../services/CommandValidationService';

export class CommandController {
  public async validateCommand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { command, questId, currentStep } = req.body as ValidateCommandRequestDto;
      
      if (!command || !questId) {
        res.status(400).json({ 
          success: false, 
          message: 'Command and questId are required' 
        });
        return;
      }

      const result = await commandValidationService.validateCommand({
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

export const commandController = new CommandController();