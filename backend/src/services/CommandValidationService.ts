import { QuestCommandStep } from '../models/QuestCommandStep';

// Request DTO for command validation
export interface ValidateCommandRequestDto {
  command: string;
  questId: number;
  currentStep?: number;
}

// Response DTO for command validation
export interface ValidateCommandResponseDto {
  valid: boolean;
  message: string;
  nextStep?: number;
  commandName?: string;
}

export class CommandValidationService {
  // This would typically come from a database
  private async getQuestCommandSteps(): Promise<QuestCommandStep[]> {
    // In a real implementation, this would fetch from the database
    // For now, returning mock data
    return [
      {
        id: 1,
        questId: 1,
        stepNumber: 1,
        commandName: 'git init',
        commandRegex: '^git init$',
        description: 'Initialize a git repository',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        questId: 1,
        stepNumber: 2,
        commandName: 'git add',
        commandRegex: '^git add (\\.|[\\w\\.\\-_]+)$',
        description: 'Add files to staging area',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        questId: 1,
        stepNumber: 3,
        commandName: 'git commit',
        commandRegex: '^git commit -m "(.*)"$',
        description: 'Commit changes to repository',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        questId: 1,
        stepNumber: 4,
        commandName: 'git branch',
        commandRegex: '^git branch ([\\w\\-_]+)$',
        description: 'Create a new branch',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        questId: 1,
        stepNumber: 5,
        commandName: 'git checkout',
        commandRegex: '^git checkout ([\\w\\-_]+)$',
        description: 'Switch to another branch',
        isOptional: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  public async validateCommand(data: ValidateCommandRequestDto): Promise<ValidateCommandResponseDto> {
    const { command, questId, currentStep = 1 } = data;
    
    // Get the command steps for this quest
    const steps = await this.getQuestCommandSteps();
    
    // Find the current step
    const currentStepData = steps.find(step => step.stepNumber === currentStep);
    if (!currentStepData) {
      return {
        valid: false,
        message: 'Invalid step in quest'
      };
    }
    
    // Check if command matches the expected pattern
    const regex = new RegExp(currentStepData.commandRegex);
    const isValidCommand = regex.test(command);
    
    if (isValidCommand) {
      // Determine the next step
      const nextStep = steps.find(step => step.stepNumber > currentStep);
      
      return {
        valid: true,
        message: `Command '${command}' is valid.`,
        nextStep: nextStep?.stepNumber,
        commandName: currentStepData.commandName
      };
    } else {
      return {
        valid: false,
        message: `Invalid command. Expected: ${currentStepData.description}`,
        commandName: currentStepData.commandName
      };
    }
  }
}

export const commandValidationService = new CommandValidationService();