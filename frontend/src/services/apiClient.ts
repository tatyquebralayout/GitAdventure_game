import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to perform logout actions (clear storage, redirect, etc.)
// This avoids circular dependencies if authApi needs apiClient
const performLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
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
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle success, errors, and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError<ApiResponse>): Promise<AxiosResponse> => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(new Error('No request configuration available'));
    }
    
    const statusCode = error.response?.status;

    // Handle token expiration
    if (statusCode === 401) {
      if (error.response?.data?.message?.includes('expired')) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post<ApiResponse>(
              `${API_URL}/auth/refresh-token`,
              { refreshToken }
            );

            if (response.data.success && response.data.data) {
              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              
              processQueue(null, accessToken);
              return apiClient(originalRequest);
            } else {
              processQueue(new Error(response.data.message || 'Token refresh failed'));
              performLogout();
              throw new Error(response.data.message || 'Token refresh failed');
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Token refresh failed';
            processQueue(new Error(message));
            performLogout();
            throw error;
          } finally {
            isRefreshing = false;
          }
        }

        // Add request to queue while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      // Other 401 errors (not token related)
      performLogout();
      return Promise.reject(new Error('Authentication required'));
    }

    // Handle other errors
    const message = 
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export default apiClient;