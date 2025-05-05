import axios from 'axios';
import { api } from './authApi';

// Interface para Quest
export interface Quest {
  id: string;
  name: string;
  description: string;
  type: string;
  parentQuestId: string | null;
}

// Interface para o passo de comando da quest
export interface QuestCommandStep {
  id: string;
  questId: string;
  stepNumber: number;
  commandName: string;
  commandRegex: string;
  description: string;
  hint?: string;
  isOptional: boolean;
  expectedPattern: string;
  successMessage: string;
}

// Interface para narrativa da quest
export interface QuestNarrative {
  id: string;
  questId: string;
  status: 'starting' | 'ongoing' | 'completed';
  context: string;
}

// Interface para progresso do jogador em uma quest
export interface PlayerWorldsQuest {
  id: string;
  playerWorldId: string;
  questId: string;
  status: 'starting' | 'ongoing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Interface para respostas da API
export interface QuestResponse {
  success: boolean;
  message?: string;
  quest?: Quest;
  steps?: QuestCommandStep[];
  narratives?: QuestNarrative[];
  playerQuest?: PlayerWorldsQuest;
}

// Serviço de quests
export const questApi = {
  // Obter quest por ID
  async getQuestById(id: string): Promise<QuestResponse> {
    try {
      const response = await api.get(`/quests/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as QuestResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Obter narrativas da quest
  async getQuestNarratives(questId: string): Promise<QuestResponse> {
    try {
      const response = await api.get(`/quests/${questId}/narratives`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as QuestResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Obter passos de comando da quest
  async getQuestCommandSteps(questId: string): Promise<QuestResponse> {
    try {
      const response = await api.get(`/quests/${questId}/steps`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as QuestResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Iniciar uma quest
  async startQuest(questId: string, worldId: string): Promise<QuestResponse> {
    try {
      const response = await api.post(`/quests/${questId}/start`, { worldId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as QuestResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Completar um passo da quest
  async completeQuestStep(questId: string, stepId: string, command: string): Promise<QuestResponse> {
    try {
      const response = await api.post(`/quests/${questId}/steps/${stepId}/complete`, { command });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as QuestResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Completar uma quest
  async completeQuest(questId: string, worldId: string): Promise<QuestResponse> {
    try {
      const response = await api.post(`/quests/${questId}/complete`, { worldId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as QuestResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  }
}; 