/**
 * Server Entry Point
 *
 * Purpose: Start Express server with MongoDB connection and GridFS initialization
 */

import http from 'http';
import mongoose from 'mongoose';
import app from '@/app';
import { config } from '@/config';
import logger from '@/utils/logger';
import { connectWithRetry, initGridFS } from '@/lib/mongo';

let server: http.Server;

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB with retry logic
    await connectWithRetry();
    logger.info('MongoDB connected successfully');

    // Initialize GridFS for file storage
    initGridFS();
    logger.info('GridFS initialized');

    // Start the HTTP server
    const PORT = config.port;
    server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Close HTTP server first (stop accepting new connections)
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  try {
    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (error: any) {
    logger.error('Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  // Give it time to log, then exit
  setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', {
    promise: String(promise),
    reason: reason instanceof Error ? { message: reason.message, stack: reason.stack } : String(reason)
  });
});

// Start the server
startServer();
