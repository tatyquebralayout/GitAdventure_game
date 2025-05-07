// Interface padrão para respostas da API
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    details?: unknown;
  };
  data?: unknown;
}