/**
 * Standard error codes used across services
 */
export enum ServiceErrorCode {
  // Authentication errors (1xxx)
  INVALID_CREDENTIALS = 1001,
  TOKEN_EXPIRED = 1002,
  TOKEN_INVALID = 1003,
  USER_NOT_FOUND = 1004,
  USER_EXISTS = 1005,

  // Authorization errors (2xxx)
  UNAUTHORIZED = 2001,
  INSUFFICIENT_PERMISSIONS = 2002,

  // Resource errors (3xxx)
  RESOURCE_NOT_FOUND = 3001,
  RESOURCE_EXISTS = 3002,
  RESOURCE_INVALID = 3003,

  // Business logic errors (4xxx)
  VALIDATION_ERROR = 4001,
  BUSINESS_RULE_VIOLATION = 4002,
  OPERATION_NOT_ALLOWED = 4003,

  // System errors (5xxx)
  INTERNAL_ERROR = 5001,
  EXTERNAL_SERVICE_ERROR = 5002,
  DATABASE_ERROR = 5003,
  CACHE_ERROR = 5004
}

/**
 * Maps service error codes to HTTP status codes
 */
const ERROR_CODE_TO_HTTP_STATUS: Record<ServiceErrorCode, number> = {
  [ServiceErrorCode.INVALID_CREDENTIALS]: 401,
  [ServiceErrorCode.TOKEN_EXPIRED]: 401,
  [ServiceErrorCode.TOKEN_INVALID]: 401,
  [ServiceErrorCode.USER_NOT_FOUND]: 404,
  [ServiceErrorCode.USER_EXISTS]: 409,
  [ServiceErrorCode.UNAUTHORIZED]: 401,
  [ServiceErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ServiceErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ServiceErrorCode.RESOURCE_EXISTS]: 409,
  [ServiceErrorCode.RESOURCE_INVALID]: 400,
  [ServiceErrorCode.VALIDATION_ERROR]: 400,
  [ServiceErrorCode.BUSINESS_RULE_VIOLATION]: 422,
  [ServiceErrorCode.OPERATION_NOT_ALLOWED]: 403,
  [ServiceErrorCode.INTERNAL_ERROR]: 500,
  [ServiceErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ServiceErrorCode.DATABASE_ERROR]: 500,
  [ServiceErrorCode.CACHE_ERROR]: 500
};

interface ServiceErrorDetails {
  [key: string]: any;
}

/**
 * Base error class for all service errors
 * Provides consistent error handling and formatting across services
 */
export class ServiceError extends Error {
  public readonly code: ServiceErrorCode;
  public readonly httpStatus: number;
  public readonly details?: ServiceErrorDetails;
  public readonly isMock: boolean;

  constructor(
    code: ServiceErrorCode,
    message: string,
    details?: ServiceErrorDetails,
    isMock: boolean = false
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.httpStatus = ERROR_CODE_TO_HTTP_STATUS[code];
    this.details = details;
    this.isMock = isMock;
  }

  /**
   * Creates an error response object suitable for sending to clients
   */
  public toResponse() {
    const response: any = {
      status: 'error',
      code: this.code,
      message: this.message
    };

    if (process.env.NODE_ENV === 'development' && this.details) {
      response.details = this.details;
    }

    if (process.env.NODE_ENV === 'development' && this.isMock) {
      response.mock = true;
    }

    return response;
  }

  /**
   * Helper method to determine if an error is a ServiceError
   */
  static isServiceError(error: any): error is ServiceError {
    return error instanceof ServiceError;
  }
}