import apiClient from '../services/apiClient';
import { ApiResponse } from '../types/api'; // Assuming ApiResponse is defined in types/api

// Interface para o usuário
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para registro de usuário
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Interface para login
export interface LoginData {
  username: string;
  password: string;
}

// Interface para resposta de autenticação
export interface AuthResponse extends ApiResponse {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  };
}

// Helper function for logout actions (can be kept here or moved)
const performLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Optionally add redirect logic here if needed upon explicit logout call
};

// Serviço de autenticação usando apiClient
export const authApi = {
  // Registrar um novo usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data.success && response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
    }
    return response.data;
  },

  // Fazer login
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data.success && response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
    }
    return response.data;
  },
  
  // Obter perfil do usuário
  async getProfile(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>('/auth/profile');
    return response.data;
  },

  // Fazer logout
  async logout(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/logout');
      performLogout(); // Ensure local cleanup happens regardless of backend success
      return response.data;
    } catch (error) {
      console.warn('Logout API call failed, performing local logout anyway.', error);
      performLogout(); // Ensure local cleanup even if API call fails
      return { 
        success: true, 
        message: 'Logout realizado localmente.' 
      } as AuthResponse;
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  // Obter o token atual
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
};