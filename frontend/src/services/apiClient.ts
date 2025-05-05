import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to perform logout actions (clear storage, redirect, etc.)
// This avoids circular dependencies if authApi needs apiClient
const performLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Optionally redirect to login page
  // window.location.href = '/login';
  console.log('User logged out due to token refresh failure or missing token.');
};

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Flag to prevent multiple concurrent token refresh attempts
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Add token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
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

// Response Interceptor: Handle success, errors, and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Pass successful responses through
    return response;
  },
  async (error: AxiosError<ApiResponse>): Promise<any> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log the error
    console.error(
      'Erro na resposta da API:',
      error.response?.status,
      error.message,
      error.response?.data?.message
    );

    // Handle 401 Unauthorized errors (potential token expiry)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      if (isRefreshing) {
        // If already refreshing, queue the original request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        performLogout();
        // Reject with a standard error structure
        return Promise.reject({
          success: false,
          message: 'Sessão expirada. Faça login novamente.',
          error: { code: '401', details: 'Refresh token not found' }
        } as ApiResponse);
      }

      try {
        // Use axios directly to avoid interceptor loop for refresh endpoint
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_URL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true } // Ensure cookies are sent if needed
        );

        if (refreshResponse.data.success && refreshResponse.data.data?.accessToken) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          const newRefreshToken = refreshResponse.data.data.refreshToken; // Assuming backend sends a new one
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest); // Retry the original request with the new token
        } else {
          // If refresh fails server-side
          throw new Error(refreshResponse.data.message || 'Falha ao renovar token');
        }
      } catch (refreshError: any) {
        console.error('Falha ao renovar token:', refreshError);
        processQueue(refreshError, null);
        performLogout();
        // Reject with a standard error structure
        return Promise.reject({
          success: false,
          message: refreshError.message || 'Sessão expirada. Faça login novamente.',
          error: { code: '401', details: 'Token refresh failed' }
        } as ApiResponse);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors or failed retries, create and reject with standard error structure
    const apiResponse: ApiResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'Erro desconhecido na API',
      error: {
        code: error.response?.status?.toString(),
        details: error.response?.data || error.message, // Include API error details or Axios error message
      },
      // Include data if the API error response has it
      ...(error.response?.data && { data: error.response.data }),
    };

    return Promise.reject(apiResponse);
  }
);

export default apiClient;