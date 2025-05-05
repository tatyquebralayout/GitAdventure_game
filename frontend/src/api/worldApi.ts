import apiClient from '../services/apiClient';
import { ApiResponse } from '../types/api';
import { World, PlayerWorld } from '../types/worlds';
import { Quest } from '../types/quests';

export const worldApi = {
  // Obter todos os mundos
  async getAllWorlds(): Promise<ApiResponse<World[]>> {
    const response = await apiClient.get<ApiResponse<World[]>>('/worlds');
    return response.data;
  },

  // Obter mundo por ID
  async getWorldById(id: string): Promise<ApiResponse<World>> {
    const response = await apiClient.get<ApiResponse<World>>(`/worlds/${id}`);
    return response.data;
  },

  // Obter quests de um mundo
  async getWorldQuests(worldId: string): Promise<ApiResponse<Quest[]>> {
    const response = await apiClient.get<ApiResponse<Quest[]>>(`/worlds/${worldId}/quests`);
    return response.data;
  },

  // Iniciar um mundo
  async startWorld(worldId: string): Promise<ApiResponse<PlayerWorld>> {
    const response = await apiClient.post<ApiResponse<PlayerWorld>>(`/worlds/${worldId}/start`);
    return response.data;
  },

  // Completar um mundo
  async completeWorld(worldId: string): Promise<ApiResponse<PlayerWorld>> {
    const response = await apiClient.post<ApiResponse<PlayerWorld>>(`/worlds/${worldId}/complete`);
    return response.data;
  }
};