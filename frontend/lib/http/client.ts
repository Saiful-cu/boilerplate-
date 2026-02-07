/**
 * HTTP Client
 *
 * Purpose: Centralized HTTP communication with automatic base URL injection,
 * error normalization, and request/response handling.
 *
 * Rules:
 * - All API calls go through this client
 * - Response errors are normalized into AppError
 * - Base URL is injected automatically
 * - Supports request/response interceptors
 * - No direct fetch() calls elsewhere
 */

import { config } from '@/config';
import { createAppError, ErrorCode, normalizeError, type AppError } from './errors';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeout?: number;
}

export interface ResponseData<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Creates an AbortSignal that times out after the specified duration
 */
function createTimeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  // Clean up timeout if request completes
  const signal = controller.signal;
  const originalListener = signal.onabort;

  signal.onabort = () => {
    clearTimeout(timeoutId);
    if (originalListener) {
      originalListener.call(signal);
    }
  };

  return signal;
}

/**
 * Centralized HTTP client for all API communication
 */
class HttpClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000; // 30 seconds

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Performs a GET request
   */
  async get<T>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * Performs a POST request
   */
  async post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  /**
   * Performs a PUT request
   */
  async put<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  /**
   * Performs a DELETE request
   */
  async delete<T>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ResponseData<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Core request method that handles all HTTP communication
   *
   * @throws {AppError} Normalized error from API or network
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<ResponseData<T>> {
    const url = this.buildUrl(path);
    const timeout = options.timeout || this.defaultTimeout;

    const requestInit = this.buildRequestInit(options);

    try {
      const timeoutSignal = createTimeoutSignal(timeout);
      const response = await fetch(url, {
        ...requestInit,
        signal: timeoutSignal,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Builds the full request URL
   */
  private buildUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  /**
   * Builds the RequestInit object with proper headers and serialization
   */
  private buildRequestInit(options: RequestOptions): RequestInit {
    const headers = new Headers(options.headers);

    // Set content type for requests with body
    if (options.body && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    const body = options.body ? JSON.stringify(options.body) : undefined;

    return {
      ...options,
      headers,
      body,
    };
  }

  /**
   * Handles the response and throws AppError if not ok
   */
  private async handleResponse<T>(response: Response): Promise<ResponseData<T>> {
    let data: unknown;

    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      // Response body is not valid JSON
      data = null;
    }

    if (!response.ok) {
      throw this.createErrorFromResponse(response, data);
    }

    return {
      data: (data as T) || ({} as T),
      status: response.status,
      headers: response.headers,
    };
  }

  /**
   * Creates an AppError from the response
   */
  private createErrorFromResponse(response: Response, data: unknown): AppError {
    // Server returned structured error
    if (
      data &&
      typeof data === 'object' &&
      'code' in data &&
      'message' in data &&
      typeof (data as Record<string, unknown>).code === 'string'
    ) {
      return createAppError(
        (data as Record<string, unknown>).message as string,
        (data as Record<string, unknown>).code as string,
        response.status
      );
    }

    // Map status codes to error codes
    const errorCodeMap: Record<number, string> = {
      400: ErrorCode.BAD_REQUEST,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.FORBIDDEN,
      404: ErrorCode.NOT_FOUND,
      500: ErrorCode.INTERNAL_SERVER_ERROR,
    };

    const code = errorCodeMap[response.status] || ErrorCode.INTERNAL_SERVER_ERROR;

    return createAppError(`HTTP ${response.status} Error`, code, response.status, {
      responseBody: data,
    });
  }

  /**
   * Handles errors from fetch (network errors, timeouts, etc)
   */
  private handleError(error: unknown): AppError {
    // AbortError from timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      return createAppError('Request timed out', ErrorCode.TIMEOUT, 0);
    }

    // Network error (no internet, CORS, etc)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return createAppError('Network error', ErrorCode.NETWORK_ERROR, 0);
    }

    // Normalize and return
    return normalizeError(error);
  }
}

/**
 * Global HTTP client instance initialized with base URL from config
 */
export const httpClient = new HttpClient(config.apiBaseUrl);

/**
 * Helper to validate successful response has expected data
 */
export function assertResponseData<T>(
  data: unknown,
  fields: (keyof T)[]
): asserts data is T {
  if (!data || typeof data !== 'object') {
    throw createAppError('Invalid response format', ErrorCode.INTERNAL_SERVER_ERROR, 500);
  }

  for (const field of fields) {
    if (!(field in data)) {
      throw createAppError(
        `Missing required field: ${String(field)}`,
        ErrorCode.INTERNAL_SERVER_ERROR,
        500
      );
    }
  }
}
