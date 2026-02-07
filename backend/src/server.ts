/**
 * Worker Entry Point
 *
 * Purpose: Start the long-running MongoDB worker and run scheduled/maintenance tasks
 */

import { logger } from '@/lib/logger';
import { connectMongo, disconnectMongo } from '@/lib/mongo';
import { userService } from '@/modules/users/service';

/**
 * Long-running worker process (degraded-mode friendly)
 * - Attempts to connect to MongoDB and will retry on failure
 * - Logs heartbeat and DB status periodically
 */
async function startWorker(): Promise<void> {
  let dbConnected = false;
  let retryTimer: NodeJS.Timeout | null = null;

  async function tryConnect() {
    try {
      await connectMongo();
      dbConnected = true;
      logger.info('Connected to MongoDB');
      if (retryTimer) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    } catch (err) {
      dbConnected = false;
      logger.warn('Failed to connect to MongoDB (will retry)', { error: { message: (err as Error).message, stack: (err as Error).stack } });
      if (!retryTimer) {
        retryTimer = setInterval(async () => {
          try {
            await connectMongo();
            dbConnected = true;
            logger.info('MongoDB reconnection successful');
            if (retryTimer) {
              clearInterval(retryTimer);
              retryTimer = null;
            }
          } catch (err) {
            logger.warn('MongoDB reconnection attempt failed', { error: { message: (err as Error).message, stack: (err as Error).stack } });
          }
        }, 15000);
      }
    }
  }

  await tryConnect();

  // Heartbeat: report counts and DB status every 30s
  const heartbeat = setInterval(async () => {
    try {
      const users = dbConnected ? await userService.list() : [];
      logger.info('Worker heartbeat', { usersCount: users.length, dbConnected });
    } catch (err) {
      logger.error('Heartbeat failed', err as Error);
    }
  }, 30000);

  const gracefulShutdown = async (signal: string) => {
    logger.info('Shutdown signal received', { signal });
    if (heartbeat) clearInterval(heartbeat);
    if (retryTimer) clearInterval(retryTimer);
    if (dbConnected) await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startWorker();
