/**
 * Configuration Layer
 *
 * Purpose: Single source of truth for all environment-based configuration.
 *
 * Rules:
 * - All environment variables accessed ONLY through this file
 * - Validation happens at startup (app crashes if config is invalid)
 * - No direct process.env usage outside this file
 * - All config values must have clear documentation
 */

interface ServerConfig {
  port: number;
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
}

interface ApplicationConfig extends ServerConfig {
  logging: LoggingConfig;
}

/**
 * Validates that a required environment variable exists and returns its value.
 * Throws an error if the variable is missing or empty.
 */
function getRequiredEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please check your .env file and ensure ${key} is set.`
    );
  }

  return value.trim();
}

/**
 * Gets an optional environment variable with a default value.
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : defaultValue;
}

/**
 * Validates and returns the port number.
 */
function getPort(): number {
  const portStr = getOptionalEnvVar('PORT', '4000');
  const port = parseInt(portStr, 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT: ${portStr}. Must be a number between 1 and 65535.`
    );
  }

  return port;
}

/**
 * Validates and returns the environment name.
 */
function getEnvironment(): 'development' | 'staging' | 'production' {
  const env = getOptionalEnvVar('NODE_ENV', 'development');

  if (env !== 'development' && env !== 'staging' && env !== 'production') {
    throw new Error(
      `Invalid NODE_ENV: ${env}. Must be one of: development, staging, production`
    );
  }

  return env;
}

/**
 * Validates and returns the log level.
 */
function getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
  const level = getOptionalEnvVar('LOG_LEVEL', 'info');

  if (level !== 'debug' && level !== 'info' && level !== 'warn' && level !== 'error') {
    throw new Error(
      `Invalid LOG_LEVEL: ${level}. Must be one of: debug, info, warn, error`
    );
  }

  return level;
}

/**
 * Initializes and validates the application configuration.
 * This function is called at module load time to fail fast if config is invalid.
 */
function initializeConfig(): ApplicationConfig {
  const port = getPort();
  const environment = getEnvironment();
  const logLevel = getLogLevel();

  return {
    port,
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    logging: {
      level: logLevel,
    },
  };
}

/**
 * Application configuration object.
 * Initialized at module load time - will throw if configuration is invalid.
 */
export const config: ApplicationConfig = initializeConfig();

/**
 * Assertion helper to validate that a required env var is set.
 * Useful for asserting optional config that becomes required.
 */
export function assertEnvVar(key: string): string {
  return getRequiredEnvVar(key);
}
