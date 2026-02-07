import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

let isConnected = false;

export async function connectMongo(): Promise<void> {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        logger.info('No MONGO_URI configured; skipping MongoDB connection');
        return;
    }

    if (isConnected || mongoose.connection.readyState === 1) {
        logger.info('MongoDB already connected');
        return;
    }

    try {
        await mongoose.connect(uri);
        isConnected = true;
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('Failed to connect to MongoDB', error as Error);
        throw error;
    }
}

export async function disconnectMongo(): Promise<void> {
    try {
        if (mongoose.connection.readyState === 0) {
            logger.info('MongoDB not connected, skipping disconnect');
            return;
        }

        await mongoose.disconnect();
        isConnected = false;
        logger.info('Disconnected from MongoDB');
    } catch (error) {
        logger.error('Error disconnecting MongoDB', error as Error);
    }
}
