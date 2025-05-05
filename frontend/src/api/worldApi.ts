// import axios from 'axios'; // Não mais necessário
// import { api } from './authApi'; // Não mais necessário, usar apiClient
import apiClient from '../services/apiClient';
import { ApiResponse } from '../types/api';
import { World, PlayerWorld } from '../types/worlds'; // Importar tipos de mundo
import { Quest } from '../types/quests'; // Importar tipo Quest

// Serviço de mundos refatorado
export const worldApi = {
  // Obter todos os mundos
  async getAllWorlds(): Promise<ApiResponse<World[]>> { // Usar ApiResponse<World[]>
    // Remover try/catch
    const response = await apiClient.get<ApiResponse<World[]>>('/worlds');
    return response.data;
  },

  // Obter mundo por ID
  async getWorldById(id: string): Promise<ApiResponse<World>> { // Usar ApiResponse<World>
    const response = await apiClient.get<ApiResponse<World>>(`/worlds/${id}`);
    return response.data;
  },

  // Obter quests de um mundo
  async getWorldQuests(worldId: string): Promise<ApiResponse<Quest[]>> { // Usar ApiResponse<Quest[]>
    const response = await apiClient.get<ApiResponse<Quest[]>>(`/worlds/${worldId}/quests`);
    return response.data;
  },

  // Iniciar um mundo
  async startWorld(worldId: string): Promise<ApiResponse<PlayerWorld>> { // Usar ApiResponse<PlayerWorld>
    const response = await apiClient.post<ApiResponse<PlayerWorld>>(`/worlds/${worldId}/start`);
    return response.data;
  },

  // Completar um mundo
  async completeWorld(worldId: string): Promise<ApiResponse<PlayerWorld>> { // Usar ApiResponse<PlayerWorld>
    const response = await apiClient.post<ApiResponse<PlayerWorld>>(`/worlds/${worldId}/complete`);
    return response.data;
  }
}; 