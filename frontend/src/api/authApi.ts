import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// Interface para o usuário
export interface User {
  id: string;
  username: string;
  email: string;
  experience: number;
  level: number;
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
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
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

// Serviço de autenticação
export const authApi = {
  // Registrar um novo usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Fazer login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },
  
  // Obter perfil do usuário
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Se o token estiver inválido, remova-o do localStorage
        if (error.response.status === 401) {
          localStorage.removeItem('token');
        }
        return error.response.data as AuthResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Fazer logout
  logout(): void {
    localStorage.removeItem('token');
  },

  // Obter o token atual
  getToken(): string | null {
    return localStorage.getItem('token');
  }
};