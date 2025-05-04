import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// Interface para Quest
export interface Quest {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  difficulty: number;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
  commandSteps?: QuestCommandStep[];
}

// Interface para QuestCommandStep
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

// Interface para UserProgress
export interface UserProgress {
  id: number;
  userId: string;
  questId: number;
  currentStep: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  quest?: Quest;
}

// Interface para resposta da API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
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

// Serviço de quests
export const questsApi = {
  // Buscar todas as quests
  async getAllQuests(): Promise<ApiResponse<Quest[]>> {
    try {
      const response = await api.get('/quests');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Quest[]>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Buscar quest por ID
  async getQuestById(id: number): Promise<ApiResponse<Quest>> {
    try {
      const response = await api.get(`/quests/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Quest>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Buscar progresso do usuário em todas as quests
  async getUserProgress(): Promise<ApiResponse<UserProgress[]>> {
    try {
      const response = await api.get('/quests/user/progress');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<UserProgress[]>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Buscar progresso do usuário em uma quest específica
  async getUserQuestProgress(questId: number): Promise<ApiResponse<UserProgress>> {
    try {
      const response = await api.get(`/quests/user/progress/${questId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<UserProgress>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Iniciar uma nova quest
  async startQuest(questId: number): Promise<ApiResponse<UserProgress>> {
    try {
      const response = await api.post('/quests/start', { questId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<UserProgress>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Buscar passos de uma quest
  async getQuestSteps(questId: number): Promise<ApiResponse<QuestCommandStep[]>> {
    try {
      const response = await api.get(`/quests/${questId}/steps`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<QuestCommandStep[]>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  }
};