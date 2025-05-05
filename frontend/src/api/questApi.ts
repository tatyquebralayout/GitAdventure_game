import apiClient from '../services/apiClient';
import { ApiResponse } from '../types/api';
import { 
  Quest, 
  QuestCommandStep, 
  QuestNarrative, 
  PlayerWorldsQuest, 
  UserProgress 
} from '../types/quests';

export const questApi = {
  // Obter quest por ID
  async getQuestById(id: string): Promise<ApiResponse<Quest>> {
    const response = await apiClient.get<ApiResponse<Quest>>(`/quests/${id}`);
    return response.data;
  },

  // Obter narrativas da quest
  async getQuestNarratives(questId: string): Promise<ApiResponse<QuestNarrative[]>> {
    const response = await apiClient.get<ApiResponse<QuestNarrative[]>>(`/quests/${questId}/narratives`);
    return response.data;
  },

  // Obter passos de comando da quest
  async getQuestCommandSteps(questId: string): Promise<ApiResponse<QuestCommandStep[]>> {
    const response = await apiClient.get<ApiResponse<QuestCommandStep[]>>(`/quests/${questId}/steps`);
    return response.data;
  },

  // Iniciar uma quest
  async startQuest(questId: string, worldId: string): Promise<ApiResponse<PlayerWorldsQuest>> {
    const response = await apiClient.post<ApiResponse<PlayerWorldsQuest>>(`/quests/${questId}/start`, { worldId });
    return response.data;
  },

  // Completar um passo da quest
  async completeQuestStep(questId: string, stepId: string, command: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(`/quests/${questId}/steps/${stepId}/complete`, { command });
    return response.data;
  },

  // Completar uma quest
  async completeQuest(questId: string, worldId: string): Promise<ApiResponse<PlayerWorldsQuest>> {
    const response = await apiClient.post<ApiResponse<PlayerWorldsQuest>>(`/quests/${questId}/complete`, { worldId });
    return response.data;
  },

  // Buscar todas as quests
  async getAllQuests(): Promise<ApiResponse<Quest[]>> {
    const response = await apiClient.get<ApiResponse<Quest[]>>('/quests');
    return response.data;
  },

  // Buscar progresso do usuário em todas as quests
  async getUserProgress(): Promise<ApiResponse<UserProgress[]>> {
    const response = await apiClient.get<ApiResponse<UserProgress[]>>('/quests/user/progress');
    return response.data;
  },

  // Buscar progresso do usuário em uma quest específica
  async getUserQuestProgress(questId: string): Promise<ApiResponse<UserProgress>> {
    const response = await apiClient.get<ApiResponse<UserProgress>>(`/quests/user/progress/${questId}`);
    return response.data;
  },
};