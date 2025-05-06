import { Request, Response, NextFunction } from 'express';
import { commandValidationService, ValidateCommandRequestDto } from '../services/CommandValidationService';

export class CommandController {
  public async validateCommand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id; // Access user ID via req.user?.id
      const { command, questId, currentStep } = req.body as ValidateCommandRequestDto;
      
      // Validar campos obrigatórios
      if (!command || !questId) {
        res.status(400).json({ 
          success: false, 
          message: 'Command and questId are required' 
        });
        return;
      }

      try {
        const result = await commandValidationService.validateCommand({
          command,
          questId,
          currentStep,
          userId // Passar o userId para o serviço
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
    } catch (error) {
      next(error);
    }
  }
}

export const commandController = new CommandController();