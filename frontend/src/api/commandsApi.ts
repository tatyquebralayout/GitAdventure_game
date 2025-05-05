// Use the centralized apiClient
import apiClient from '../services/apiClient';
import { ApiResponse } from '../types/api'; // Assuming ApiResponse is defined

// Interface para validação de comando (request)
export interface ValidateCommandRequest {
  command: string;
  questId: number;
  currentStep?: number;
}

// Update ValidateCommandResponse to align with ApiResponse
export interface ValidateCommandResponseData {
  valid: boolean;
  message: string;
  nextStep?: number;
  commandName?: string;
  isQuestCompleted?: boolean;
}

export type ValidateCommandResponse = ApiResponse<ValidateCommandResponseData>;

export const commandsApi = {
  validateCommand: async (
    command: string, 
    questId = 1, 
    currentStep?: number
  ): Promise<ValidateCommandResponse> => {
    // Remove try...catch, rely on apiClient interceptor
    const response = await apiClient.post<ValidateCommandResponse>('/commands/validate', {
      command,
      questId,
      currentStep,
    });
    return response.data; // Return the data part of the Axios response
  },
};