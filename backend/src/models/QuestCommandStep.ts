// Model for the quest_command_steps table
export interface QuestCommandStep {
  id: number;
  questId: number;
  stepNumber: number;
  commandName: string;
  commandRegex: string;
  description: string;
  hint?: string;
  isOptional: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new quest command step
export interface CreateQuestCommandStepDto {
  questId: number;
  stepNumber: number;
  commandName: string;
  commandRegex: string;
  description: string;
  hint?: string;
  isOptional?: boolean;
}