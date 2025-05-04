// API service for command validation

interface ValidateCommandResponse {
  success: boolean;
  valid: boolean;
  message: string;
  nextStep?: number;
  commandName?: string;
}

// Base API URL from environment or default to localhost:3001
// Usando variável declarada para evitar o erro de TypeScript com import.meta
declare const VITE_API_BASE_URL: string | undefined;
const API_BASE_URL = typeof VITE_API_BASE_URL !== 'undefined' ? VITE_API_BASE_URL : 'http://localhost:3001';

export const commandsApi = {
  validateCommand: async (command: string, questId = 1, currentStep?: number): Promise<ValidateCommandResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          questId,
          currentStep,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating command:', error);
      return {
        success: false,
        valid: false,
        message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};