/**
 * Error Handling
 *
 * Purpose: Define consistent error types across the frontend.
 *
 * Rules:
 * - All user-facing errors are wrapped in AppError
 * - Error codes are standardized for client-server communication
 * - No raw error messages shown to users
 * - Error context is preserved for debugging
 */

/**
 * Standardized error response from the API or internal application
 */
export interface AppError {
  message: string;
  code: string;
  status: number;
  context?: Record<string, unknown>;
}

/**
 * Error codes that match backend error types
 */
export enum ErrorCode {
  // HTTP/Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Authentication/Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',

  // Client-side errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
}

/**
 * User-friendly error messages (never expose internal details)
 */
const userFriendlyMessages: Record<string, string> = {
  [ErrorCode.NETWORK_ERROR]: 'Unable to reach the server. Please check your connection.',
  [ErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCode.UNAUTHORIZED]: 'Please log in to continue.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource.',
  [ErrorCode.VALIDATION_ERROR]: 'Invalid input. Please check your data and try again.',
  [ErrorCode.BAD_REQUEST]: 'Invalid request. Please try again.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Something went wrong. Please try again later.',
  [ErrorCode.NOT_FOUND]: 'Resource not found.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCode.CONFIG_ERROR]: 'Application configuration error. Please contact support.',
};

/**
 * Creates a standardized error object
 */
export function createAppError(
  message: string,
  code: string = ErrorCode.UNKNOWN_ERROR,
  status: number = 500,
  context?: Record<string, unknown>
): AppError {
  return {
    message,
    code,
    status,
    context,
  };
}

/**
 * Gets user-friendly error message (never shows internal details)
 */
export function getUserFriendlyMessage(code: string): string {
  return userFriendlyMessages[code] || userFriendlyMessages[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Normalizes different error types into a consistent AppError
 */
export function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error && typeof error === 'object' && 'code' in error && 'status' in error) {
    return error as AppError;
  }

  // Error from fetch/axios
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as Record<string, unknown>).response;
    if (response && typeof response === 'object') {
      const status = (response as Record<string, unknown>).status as number;
      const data = (response as Record<string, unknown>).data;

      if (data && typeof data === 'object' && 'code' in data) {
        return createAppError(
          (data as Record<string, unknown>).message as string,
          (data as Record<string, unknown>).code as string,
          status,
          { originalError: error }
        );
      }

      return createAppError(
        `Server error (${status})`,
        ErrorCode.INTERNAL_SERVER_ERROR,
        status,
        { originalError: error }
      );
    }
  }

  // Standard Error or Error-like object
  if (error instanceof Error) {
    // Network error
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createAppError(
        'Network error',
        ErrorCode.NETWORK_ERROR,
        0,
        { originalError: error }
      );
    }

    // Default error
    return createAppError(
      error.message,
      ErrorCode.UNKNOWN_ERROR,
      500,
      { originalError: error }
    );
  }

  // Unknown error type
  return createAppError(
    'An unknown error occurred',
    ErrorCode.UNKNOWN_ERROR,
    500,
    { originalError: error }
  );
}

/**
 * Type guard to check if a value is an AppError
 */
export function isAppError(value: unknown): value is AppError {
  return (
    value !== null &&
    typeof value === 'object' &&
    'message' in value &&
    'code' in value &&
    'status' in value &&
    typeof (value as AppError).message === 'string' &&
    typeof (value as AppError).code === 'string' &&
    typeof (value as AppError).status === 'number'
  );
}
