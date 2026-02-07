/**
 * Error Handling System
 *
 * Purpose: Define consistent error types and handling across the backend.
 *
 * Rules:
 * - All errors extend BaseError
 * - Error codes are standardized
 * - Error context is preserved
 * - Errors have appropriate HTTP status codes
 * - Internal errors never exposed to clients
 */

/**
 * Base error class that all application errors extend
 */
export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly context?: Record<string, unknown>;
  readonly timestamp: Date;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.context = context;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts the error to a client-safe response
   * Never returns internal details or stack traces
   */
  toClientResponse(): {
    message: string;
    code: string;
    status: number;
  } {
    return {
      message: this.message,
      code: this.code,
      status: this.statusCode,
    };
  }

  /**
   * Converts the error to a server-side log object
   * Includes all details for debugging
   */
  toLogObject(): Record<string, unknown> {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Validation error - user input is invalid
 */
export class ValidationError extends BaseError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Authentication error - user is not authenticated
 */
export class AuthenticationError extends BaseError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';

  constructor(message: string = 'Unauthorized', context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Authorization error - user is authenticated but not authorized
 */
export class AuthorizationError extends BaseError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';

  constructor(message: string = 'Forbidden', context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Not found error - resource does not exist
 */
export class NotFoundError extends BaseError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(resource: string = 'Resource', context?: Record<string, unknown>) {
    super(`${resource} not found`, context);
  }
}

/**
 * Conflict error - request conflicts with current state
 */
export class ConflictError extends BaseError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Internal server error - unexpected error
 */
export class InternalServerError extends BaseError {
  readonly statusCode = 500;
  readonly code = 'INTERNAL_SERVER_ERROR';

  constructor(message: string = 'Internal server error', context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Service unavailable error - service is temporarily unavailable
 */
export class ServiceUnavailableError extends BaseError {
  readonly statusCode = 503;
  readonly code = 'SERVICE_UNAVAILABLE';

  constructor(service: string = 'Service', context?: Record<string, unknown>) {
    super(`${service} is temporarily unavailable`, context);
  }
}

/**
 * Type guard to check if a value is a BaseError
 */
export function isBaseError(value: unknown): value is BaseError {
  return value instanceof BaseError;
}

/**
 * Normalizes any error into a BaseError
 */
export function normalizeError(error: unknown): BaseError {
  // Already a BaseError
  if (isBaseError(error)) {
    return error;
  }

  // Standard Error or Error-like object
  if (error instanceof Error) {
    return new InternalServerError(error.message, { originalError: error });
  }

  // Unknown error type
  return new InternalServerError(
    'An unknown error occurred',
    { originalError: error }
  );
}
