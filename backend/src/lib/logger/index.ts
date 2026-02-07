/**
 * Structured Logger
 *
 * Purpose: Provide consistent JSON structured logging throughout the application.
 *
 * Rules:
 * - All logs are JSON formatted (structured logging)
 * - Never concatenate strings for logs
 * - Never log sensitive information (passwords, tokens, PII)
 * - Use appropriate log levels
 * - Include correlation IDs for request tracking
 */

import { config } from '@/config';
import type { BaseError } from '@/lib/errors';
import { isBaseError } from '@/lib/errors';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Logger class for structured logging
 */
class Logger {
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = 'info') {
    this.minLevel = minLevel;
  }

  /**
   * Logs a debug message (lowest priority)
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Logs an info message (important application events)
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Logs a warning (degraded performance, retries, etc)
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Logs an error (failures, user issues)
   */
  error(message: string, error?: Error | BaseError | unknown, context?: LogContext): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
    };

    if (error) {
      if (isBaseError(error)) {
        entry.error = {
          message: error.message,
          code: error.code,
          stack: error.stack,
        };
      } else if (error instanceof Error) {
        entry.error = {
          message: error.message,
          stack: error.stack,
        };
      } else {
        entry.error = {
          message: String(error),
        };
      }
    }

    this.writeLog(entry);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.minLevel]) {
      return; // Skip logs below minimum level
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.writeLog(entry);
  }

  /**
   * Writes the log entry (as JSON to stdout)
   */
  private writeLog(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }

  /**
   * Sets the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger(config.logging.level);

/**
 * Middleware to log HTTP requests
 */
export function createRequestLogger() {
  return (
    req: any,
    _res: any,
    next: any
  ): void => {
    const start = Date.now();
    const originalSend = _res.send;

    _res.send = function (data: any) {
      const duration = Date.now() - start;

      logger.info('HTTP Request', {
        method: req.method,
        path: req.path,
        status: _res.statusCode,
        duration: `${duration}ms`,
      });

      originalSend.call(this, data);
    };

    next();
  };
}
