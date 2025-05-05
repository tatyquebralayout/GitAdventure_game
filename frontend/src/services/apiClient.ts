import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types/api'; // Importar tipo ApiResponse

// Obter URL da API a partir das variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Interface padrão para respostas da API (pode ser movida para types/api.ts)
/*
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: unknown;
  };
}
*/

// Criar a instância centralizada do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Se precisar enviar cookies (ex: para refresh tokens HttpOnly)
});

// Interceptor de Request: Adicionar token de autenticação
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken'); // Assumindo que o token se chama 'accessToken'
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor de Response: Tratamento padronizado de sucesso e erro
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse<ApiResponse> => {
    // Assumindo que respostas de sucesso sempre retornam um objeto
    // com a estrutura { success: true, data: ... } ou similar
    // Se a API retornar dados diretamente no sucesso, ajuste aqui.
    return {
      ...response,
      data: response.data, // Mantém a estrutura original da resposta da API
    };
  },
  (error: AxiosError<ApiResponse>): Promise<ApiResponse> => {
    console.error('Erro na resposta da API:', error.response?.status, error.message);
    
    // Resposta padronizada para erros
    const apiResponse: ApiResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'Erro desconhecido na API',
      error: {
        code: error.response?.status?.toString(),
        details: error.response?.data, // Inclui a resposta completa do erro da API
      },
    };

    // Tratamento específico para erro 401 (Não autorizado) - Ex: redirecionar para login
    if (error.response?.status === 401) {
      console.warn('Erro 401: Não autorizado. Implementar lógica de refresh token ou logout.');
      // Exemplo: Tentar refresh token ou deslogar usuário
      // localStorage.removeItem('accessToken');
      // window.location.href = '/login';
    }

    // Retornar a resposta padronizada de erro
    // Envolver em Promise.reject para que o .catch() na chamada original funcione
    return Promise.reject(apiResponse);
  }
);

export default apiClient; 