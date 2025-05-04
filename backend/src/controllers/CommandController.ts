import { Request, Response } from 'express';
import { commandValidationService, ValidateCommandRequestDto } from '../services/CommandValidationService';

export class CommandController {
  public validateCommand(req: Request, res: Response): void {
    try {
      const { command, questId, currentStep } = req.body as ValidateCommandRequestDto;
      const userId = req.userId; // Obter userId do middleware de autenticação
      
      // Validar campos obrigatórios
      if (!command || !questId) {
        res.status(400).json({ 
          success: false, 
          message: 'Command and questId are required' 
        });
        return;
      }

      // Using Promise.resolve to handle the async operation
      commandValidationService.validateCommand({
        command,
        questId,
        currentStep,
        userId // Passar o userId para o serviço
      }).then(result => {
        res.status(200).json({
          success: true,
          ...result
        });
      }).catch(error => {
        console.error('Error validating command:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to validate command' 
        });
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