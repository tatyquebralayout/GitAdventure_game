import apiClient from '../services/apiClient';
import { ApiResponse } from '../types/api';

// Interface para GameState
export interface GameState {
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

// Define specific types instead of using 'any'
interface ProgressData {
  level?: number;
  questsCompleted?: string[];
}

interface UpdateProgressPayload {
  questId?: string;
  action?: string;
}

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

// Serviço de progresso do jogo usando apiClient
export const progressApi = {
  // Salvar o progresso do jogo
  async saveProgress(saveSlot: number, saveName: string, gameState: GameState): Promise<ApiResponse<GameSave>> {
    const response = await apiClient.post<ApiResponse<GameSave>>('/progress/save', {
      saveSlot,
      saveName,
      gameState
    });
    return response.data;
  },
  
  // Carregar o progresso do jogo
  async loadProgress(saveSlot: number): Promise<ApiResponse<GameSave>> {
    const response = await apiClient.get<ApiResponse<GameSave>>(`/progress/load/${saveSlot}`);
    return response.data;
  },
  
  // Listar todos os saves do usuário
  async listSaves(): Promise<ApiResponse<GameSave[]>> {
    const response = await apiClient.get<ApiResponse<GameSave[]>>('/progress/list');
    return response.data;
  },
  
  // Excluir um save
  async deleteSave(saveSlot: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/progress/delete/${saveSlot}`);
    return response.data;
  },

  // Obter progresso do jogo
  async getProgress(): Promise<ApiResponse<ProgressData>> {
    const response = await apiClient.get<ApiResponse<ProgressData>>('/progress');
    return response.data;
  },

  // Atualizar progresso do jogo
  async updateProgress(payload: UpdateProgressPayload): Promise<ApiResponse<ProgressData>> {
    const response = await apiClient.post<ApiResponse<ProgressData>>('/progress', payload);
    return response.data;
  },

  /**
   * Atualiza o progresso de um usuário em um mundo
   */
  async updateUserProgress(
    worldId: number, 
    progressData: Partial<UserProgress>
  ): Promise<ApiResponse<UserProgress>> {
    const response = await apiClient.post<ApiResponse<UserProgress>>(`/progress/worlds/${worldId}`, progressData);
    return response.data;
  },

  /**
   * Atualiza o progresso de uma missão específica
   */
  async updateMissionProgress(
    missionId: number, 
    progressData: Partial<MissionProgress>
  ): Promise<ApiResponse<MissionProgress>> {
    const response = await apiClient.post<ApiResponse<MissionProgress>>(`/progress/missions/${missionId}`, progressData);
    return response.data;
  }
};