// Interface para resultados de comandos
export interface CommandResult {
  success: boolean;
  message: string;
  effects?: {
    setFlag?: Record<string, boolean>;
    // Outros possíveis efeitos podem ser adicionados aqui
  };
} 