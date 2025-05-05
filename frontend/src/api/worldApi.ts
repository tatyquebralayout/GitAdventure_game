import axios from 'axios';
import { api } from './authApi';

// Interface para o mundo
export interface World {
  id: string;
  name: string;
  description: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'review' | 'published';
}

// Interface para o progresso do jogador em um mundo
export interface PlayerWorld {
  id: string;
  userId: string;
  worldId: string;
  status: 'started' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Interface para resposta de mundo
export interface WorldResponse {
  success: boolean;
  message?: string;
  world?: World;
  worlds?: World[];
}

// Interface para resposta de progresso
export interface PlayerWorldResponse {
  success: boolean;
  message?: string;
  playerWorld?: PlayerWorld;
}

interface Coordinate {
  x: number;
  y: number;
}

// Serviço de mundos
export const worldApi = {
  // Obter todos os mundos
  async getAllWorlds(): Promise<WorldResponse> {
    try {
      const response = await api.get('/worlds');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as WorldResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Obter mundo por ID
  async getWorldById(id: string): Promise<WorldResponse> {
    try {
      const response = await api.get(`/worlds/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as WorldResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Obter quests de um mundo
  async getWorldQuests(worldId: string): Promise<any> {
    try {
      const response = await api.get(`/worlds/${worldId}/quests`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Iniciar um mundo
  async startWorld(worldId: string): Promise<PlayerWorldResponse> {
    try {
      const response = await api.post(`/worlds/${worldId}/start`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as PlayerWorldResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Completar um mundo
  async completeWorld(worldId: string): Promise<PlayerWorldResponse> {
    try {
      const response = await api.post(`/worlds/${worldId}/complete`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as PlayerWorldResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  }
}; 