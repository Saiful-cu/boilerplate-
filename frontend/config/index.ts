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

interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validates that a required environment variable exists and returns its value.
 * Throws an error if the variable is missing or empty.
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please check your .env.local file and ensure ${key} is set.`
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
 * Validates the API base URL format.
 */
function validateApiBaseUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new Error(
      `Invalid API_BASE_URL format: ${url}. ` +
      `Must be a valid URL (e.g., http://localhost:4000 or https://api.example.com)`
    );
  }
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
 * Initializes and validates the application configuration.
 * This function is called at module load time to fail fast if config is invalid.
 */
function initializeConfig(): EnvironmentConfig {
  // Use an explicit default so frontend doesn't crash when .env.local is missing
  const defaultApi = 'http://localhost:5000';
  const apiBaseUrl = getOptionalEnvVar('NEXT_PUBLIC_API_BASE_URL', defaultApi);

  // Inform developer if using default in development mode
  if (!process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(`NEXT_PUBLIC_API_BASE_URL not set — defaulting to ${defaultApi}. Add to .env.local to override.`);
  }

  validateApiBaseUrl(apiBaseUrl);

  const environment = getEnvironment();

  return {
    apiBaseUrl,
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
  };
}

/**
 * Application configuration object.
 * Initialized at module load time - will throw if configuration is invalid.
 */
export const config: EnvironmentConfig = initializeConfig();

/**
 * Legacy export for API base URL (use config.apiBaseUrl instead).
 * @deprecated Use config.apiBaseUrl for better discoverability.
 */
export const API_BASE_URL = config.apiBaseUrl;
