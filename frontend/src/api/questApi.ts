// import axios from 'axios'; // Não mais necessário
// import { api } from './authApi'; // Não mais necessário, usar apiClient
import apiClient from '../services/apiClient';
import { ApiResponse } from '../types/api';
import { 
  Quest, 
  QuestCommandStep, 
  QuestNarrative, 
  PlayerWorldsQuest, 
  UserProgress 
} from '../types/quests'; // Importar tipos unificados

// Remover interfaces locais
/*
export interface Quest { ... }
export interface QuestCommandStep { ... }
export interface QuestNarrative { ... }
export interface PlayerWorldsQuest { ... }
export interface QuestResponse { ... }
*/

// Serviço de quests unificado
export const questApi = {
  // --- Funções originais de questApi.ts (adaptadas) ---
  
  // Obter quest por ID
  async getQuestById(id: string): Promise<ApiResponse<Quest>> { // Usar ApiResponse<Quest>
    // Remover try/catch, confiar no interceptor
    const response = await apiClient.get<ApiResponse<Quest>>(`/quests/${id}`);
    return response.data; // Retornar response.data diretamente
  },

  // Obter narrativas da quest
  async getQuestNarratives(questId: string): Promise<ApiResponse<QuestNarrative[]>> { // Usar ApiResponse<QuestNarrative[]>
    const response = await apiClient.get<ApiResponse<QuestNarrative[]>>(`/quests/${questId}/narratives`);
    return response.data;
  },

  // Obter passos de comando da quest
  async getQuestCommandSteps(questId: string): Promise<ApiResponse<QuestCommandStep[]>> { // Usar ApiResponse<QuestCommandStep[]>
    const response = await apiClient.get<ApiResponse<QuestCommandStep[]>>(`/quests/${questId}/steps`);
    return response.data;
  },

  // Iniciar uma quest (PlayerWorldsQuest?)
  async startQuest(questId: string, worldId: string): Promise<ApiResponse<PlayerWorldsQuest>> { // Usar ApiResponse<PlayerWorldsQuest>
    const response = await apiClient.post<ApiResponse<PlayerWorldsQuest>>(`/quests/${questId}/start`, { worldId });
    return response.data;
  },

  // Completar um passo da quest (retorna o quê? Vamos assumir que nada específico)
  async completeQuestStep(questId: string, stepId: string, command: string): Promise<ApiResponse> { // Usar ApiResponse
    const response = await apiClient.post<ApiResponse>(`/quests/${questId}/steps/${stepId}/complete`, { command });
    return response.data;
  },

  // Completar uma quest (PlayerWorldsQuest?)
  async completeQuest(questId: string, worldId: string): Promise<ApiResponse<PlayerWorldsQuest>> { // Usar ApiResponse<PlayerWorldsQuest>
    const response = await apiClient.post<ApiResponse<PlayerWorldsQuest>>(`/quests/${questId}/complete`, { worldId });
    return response.data;
  },

  // --- Funções de questsApi.ts (adicionadas e adaptadas) ---

  // Buscar todas as quests
  async getAllQuests(): Promise<ApiResponse<Quest[]>> { // Usar ApiResponse<Quest[]>
    const response = await apiClient.get<ApiResponse<Quest[]>>('/quests');
    return response.data;
  },

  // Buscar progresso do usuário em todas as quests
  async getUserProgress(): Promise<ApiResponse<UserProgress[]>> { // Usar ApiResponse<UserProgress[]>
    const response = await apiClient.get<ApiResponse<UserProgress[]>>('/quests/user/progress');
    return response.data;
  },

  // Buscar progresso do usuário em uma quest específica
  async getUserQuestProgress(questId: string): Promise<ApiResponse<UserProgress>> { // Usar ApiResponse<UserProgress> e id string
    const response = await apiClient.get<ApiResponse<UserProgress>>(`/quests/user/progress/${questId}`);
    return response.data;
  },

  // Iniciar uma nova quest (UserProgress?) - Parece duplicar startQuest acima. Revisar endpoints.
  // async startQuest(questId: string): Promise<ApiResponse<UserProgress>> { // Usar ApiResponse<UserProgress> e id string
  //   const response = await apiClient.post<ApiResponse<UserProgress>>('/quests/start', { questId });
  //   return response.data;
  // },

  // Buscar passos de uma quest - Já existe getQuestCommandSteps acima.
  // async getQuestSteps(questId: string): Promise<ApiResponse<QuestCommandStep[]>> { ... }
}; 