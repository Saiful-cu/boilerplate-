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

import dotenv from 'dotenv';
dotenv.config();

interface ServerConfig {
  port: number;
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
}

interface MongoConfig {
  uri: string;
  poolSize: number;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
}

interface CorsConfig {
  allowedOrigins: string[];
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface EmailConfig {
  sendgridApiKey: string;
  fromEmail: string;
  storeName: string;
}

interface UploadConfig {
  maxImageSize: number;
  maxVideoSize: number;
  maxFileSize: number;
}

interface BkashConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  baseUrl: string;
  callbackUrl: string;
  enabled: boolean;
  // Development-only mock mode (BKASH_MOCK=true)
  mock?: boolean;
}

interface ApplicationConfig extends ServerConfig {
  logging: LoggingConfig;
  mongo: MongoConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  email: EmailConfig;
  upload: UploadConfig;
  bkash: BkashConfig;
  frontendUrl: string;
}

/**
 * Gets an optional environment variable with a default value.
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : defaultValue;
}

function getPort(): number {
  const portStr = getOptionalEnvVar('PORT', '5000');
  const port = parseInt(portStr, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${portStr}. Must be a number between 1 and 65535.`);
  }
  return port;
}

function getEnvironment(): 'development' | 'staging' | 'production' {
  const env = getOptionalEnvVar('NODE_ENV', 'development');
  if (env !== 'development' && env !== 'staging' && env !== 'production') {
    throw new Error(`Invalid NODE_ENV: ${env}. Must be one of: development, staging, production`);
  }
  return env;
}

function getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
  const level = getOptionalEnvVar('LOG_LEVEL', 'info');
  if (level !== 'debug' && level !== 'info' && level !== 'warn' && level !== 'error') {
    throw new Error(`Invalid LOG_LEVEL: ${level}. Must be one of: debug, info, warn, error`);
  }
  return level;
}

function initializeConfig(): ApplicationConfig {
  const port = getPort();
  const environment = getEnvironment();
  const logLevel = getLogLevel();

  const allowedOriginsStr = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = allowedOriginsStr
    ? allowedOriginsStr.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

  return {
    port,
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    logging: {
      level: logLevel,
    },
    mongo: {
      uri: getOptionalEnvVar('MONGODB_DSN', getOptionalEnvVar('MONGODB_URI', 'mongodb://localhost:27017/noboraz')),
      poolSize: parseInt(getOptionalEnvVar('MONGODB_POOL_SIZE', '10'), 10),
    },
    jwt: {
      secret: getOptionalEnvVar('JWT_SECRET', 'change-me-in-production'),
      expiresIn: getOptionalEnvVar('JWT_EXPIRES_IN', '7d'),
    },
    cors: {
      allowedOrigins,
    },
    rateLimit: {
      windowMs: parseInt(getOptionalEnvVar('RATE_LIMIT_WINDOW_MS', String(15 * 60 * 1000)), 10),
      maxRequests: parseInt(getOptionalEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
    },
    email: {
      sendgridApiKey: getOptionalEnvVar('SENDGRID_API_KEY', ''),
      fromEmail: getOptionalEnvVar('SENDGRID_FROM_EMAIL', 'noreply@example.com'),
      storeName: getOptionalEnvVar('STORE_NAME', 'Noboraz'),
    },
    upload: {
      maxImageSize: parseInt(getOptionalEnvVar('MAX_IMAGE_SIZE', String(10 * 1024 * 1024)), 10),
      maxVideoSize: parseInt(getOptionalEnvVar('MAX_VIDEO_SIZE', String(100 * 1024 * 1024)), 10),
      maxFileSize: parseInt(getOptionalEnvVar('MAX_FILE_SIZE', String(50 * 1024 * 1024)), 10),
    },
    bkash: {
      appKey: getOptionalEnvVar('BKASH_APP_KEY', ''),
      appSecret: getOptionalEnvVar('BKASH_APP_SECRET', ''),
      username: getOptionalEnvVar('BKASH_USERNAME', ''),
      password: getOptionalEnvVar('BKASH_PASSWORD', ''),
      baseUrl: getOptionalEnvVar(
        'BKASH_BASE_URL',
        'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      ),
      callbackUrl: getOptionalEnvVar(
        'BKASH_CALLBACK_URL',
        'http://localhost:5000/api/bkash/callback'
      ),
      // Feature flag: enable real bKash integration
      enabled: getOptionalEnvVar('BKASH_ENABLED', 'false') === 'true',
      // Developer-only mock mode — use for local sandbox/testing without real credentials
      mock: getOptionalEnvVar('BKASH_MOCK', 'false') === 'true',
    },
    frontendUrl: getOptionalEnvVar('FRONTEND_URL', 'http://localhost:3000'),
  };
}

export const config: ApplicationConfig = initializeConfig();

export function assertEnvVar(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}
