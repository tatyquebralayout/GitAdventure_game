import axios from 'axios';
import { api } from './authApi';

// Interface para GameState
export interface GameState {
  // Aqui você define a estrutura do estado do jogo
  // Por exemplo:
  inventory: string[];
  location: string;
  completedActions: string[];
  playerStats: Record<string, number>;
  [key: string]: unknown;
}

// Interface para GameSave
export interface GameSave {
  id?: string;
  saveSlot: number;
  saveName: string;
  gameState?: GameState;
  updatedAt?: Date;
}

// Interface para resposta da API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  progress?: T;
  saves?: T[];
}

// Define specific types instead of using 'any'
interface ProgressData {
  // Define the expected structure of progress data
  // Example:
  level?: number;
  questsCompleted?: string[];
  // Add other relevant fields
}

interface UpdateProgressPayload {
  // Define the expected structure of the payload for updating progress
  // Example:
  questId?: string;
  action?: string;
  // Add other relevant fields
}

// Adicione esses tipos adequados
interface UserProgress {
  userId: number;
  worldId: number;
  progress: number;
  completedMissions: number[];
  currentMission: number;
  lastUpdate: Date;
}

interface MissionProgress {
  missionId: number;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  objectives: Record<string, boolean>;
  timestamp: Date;
}

// Serviço de progresso do jogo
export const progressApi = {
  // Salvar o progresso do jogo
  async saveProgress(saveSlot: number, saveName: string, gameState: GameState): Promise<ApiResponse<GameSave>> {
    try {
      const response = await api.post('/progress/save', {
        saveSlot,
        saveName,
        gameState
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<GameSave>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },
  
  // Carregar o progresso do jogo
  async loadProgress(saveSlot: number): Promise<ApiResponse<GameSave>> {
    try {
      const response = await api.get(`/progress/load/${saveSlot}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<GameSave>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },
  
  // Listar todos os saves do usuário
  async listSaves(): Promise<ApiResponse<GameSave>> {
    try {
      const response = await api.get('/progress/list');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<GameSave>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },
  
  // Excluir um save
  async deleteSave(saveSlot: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/progress/delete/${saveSlot}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<void>;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Obter progresso do jogo
  async getProgress(token: string): Promise<ProgressData> {
    try {
      const response = await api.get('/progress', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // Assuming response.data matches ProgressData
    } catch {
      throw new Error('Erro ao obter progresso do jogo');
    }
  },

  // Atualizar progresso do jogo
  async updateProgress(payload: UpdateProgressPayload, token: string): Promise<ProgressData> {
    try {
      const response = await api.post('/progress', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // Assuming response.data matches ProgressData
    } catch {
      throw new Error('Erro ao atualizar progresso do jogo');
    }
  },

  /**
   * Atualiza o progresso de um usuário em um mundo
   */
  async updateUserProgress(
    worldId: number, 
    progressData: Partial<UserProgress>
  ): Promise<UserProgress> {
    try {
      const response = await api.post(`/progress/worlds/${worldId}`, progressData);
      return response.data;
    } catch {
      throw new Error('Erro ao atualizar progresso do usuário');
    }
  },

  /**
   * Atualiza o progresso de uma missão específica
   */
  async updateMissionProgress(
    missionId: number, 
    progressData: Partial<MissionProgress>
  ): Promise<MissionProgress> {
    try {
      const response = await api.post(`/progress/missions/${missionId}`, progressData);
      return response.data;
    } catch {
      throw new Error('Erro ao atualizar progresso da missão');
    }
  }
};