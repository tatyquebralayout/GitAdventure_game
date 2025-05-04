import { Request, Response } from 'express';
import { commandValidationService, ValidateCommandRequestDto } from '../services/CommandValidationService';

export class CommandController {
  public async validateCommand(req: Request, res: Response): Promise<void> {
    try {
      const { command, questId, currentStep } = req.body as ValidateCommandRequestDto;
      
      // Validate required fields
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
        currentStep
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error validating command:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to validate command' 
      });
    }
  }
}

export const commandController = new CommandController();