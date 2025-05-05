// backend/src/utils/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;

    // Mantém o stack trace correto para onde o erro foi lançado (apenas em V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // Define o nome do erro
    this.name = 'AppError';
  }
}