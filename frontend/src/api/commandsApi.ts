// API service for command validation
import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// Interface para validação de comando (request)
export interface ValidateCommandRequest {
  command: string;
  questId: number;
  currentStep?: number;
}

// Interface para resposta da validação de comando
export interface ValidateCommandResponse {
  success: boolean;
  valid: boolean;
  message: string;
  nextStep?: number;
  commandName?: string;
  isQuestCompleted?: boolean;
}

// Configuração do axios com interceptor para adicionar o token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const commandsApi = {
  validateCommand: async (
    command: string, 
    questId = 1, 
    currentStep?: number
  ): Promise<ValidateCommandResponse> => {
    try {
      const response = await api.post('/commands/validate', {
        command,
        questId,
        currentStep,
      });

      return response.data;
    } catch (error) {
      console.error('Error validating command:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        // Se recebemos uma resposta do servidor com erro
        return error.response.data as ValidateCommandResponse;
      }
      
      // Erro genérico, como falha de rede
      return {
        success: false,
        valid: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  },
};