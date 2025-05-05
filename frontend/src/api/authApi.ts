import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

// Configuração do axios com interceptor para adicionar o token
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para renovar o token quando expirar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh-token')) {
      originalRequest._retry = true;
      
      try {
        // Tente renovar o token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Se não houver refresh token, faça logout
          authApi.logout();
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        
        if (response.data.accessToken) {
          // Salve os novos tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Configure o token para a requisição original e repita
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Se falhar ao renovar o token, faça logout
        authApi.logout();
      }
    }
    
    return Promise.reject(error);
  }
);

// Serviço de autenticação
export const authApi = {
  // Registrar um novo usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
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
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
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
        return error.response.data as AuthResponse;
      }
      return { 
        success: false, 
        message: 'Erro ao conectar ao servidor' 
      };
    }
  },

  // Fazer logout
  async logout(): Promise<AuthResponse> {
    try {
      // Enviar requisição para o backend para invalidar tokens
      const response = await api.post('/auth/logout');
      
      // Limpar localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return response.data;
    } catch (error) {
      // Mesmo que haja erro, limpar tokens locais
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return { 
        success: true, 
        message: 'Logout realizado com sucesso' 
      };
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