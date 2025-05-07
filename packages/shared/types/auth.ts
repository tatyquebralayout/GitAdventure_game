// Tipos compartilhados de autenticação para uso em contratos de API/DTO
// Não usar para manipulação de dados do banco

export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface UserShared {
  id: string;
  username: string;
  email: string;
  experience: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserShared;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RefreshTokenData {
  refreshToken: string;
} 