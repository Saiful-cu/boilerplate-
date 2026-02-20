import mongoose from 'mongoose';
import { config } from '@/config';
import { logger } from '@/lib/logger';

let isConnected = false;

export async function connectMongo(): Promise<void> {
    const uri = config.mongo.uri;

    if (!uri) {
        logger.warn('No MONGODB_URI configured; skipping MongoDB connection');
        return;
    }

    if (isConnected || mongoose.connection.readyState === 1) {
        logger.info('MongoDB already connected');
        return;
    }

    try {
        await mongoose.connect(uri, {
            maxPoolSize: config.mongo.poolSize,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        logger.info('Connected to MongoDB');
    } catch (error) {
        isConnected = false;
        logger.error('Failed to connect to MongoDB', error as Error);
        throw error;
    }
}

export async function connectWithRetry(retries = 5): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
        try {
            await connectMongo();
            return true;
        } catch (error) {
            logger.error(`MongoDB connection attempt ${i + 1} failed:`, error as Error);
            if (i < retries - 1) {
                logger.info('Retrying in 5 seconds...');
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }
    return false;
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

/** GridFS Bucket */
let gridfsBucket: mongoose.mongo.GridFSBucket | null = null;

export function initGridFS(): void {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads',
        });
        logger.info('GridFS initialized');
    } else {
        throw new Error('MongoDB connection not established');
    }
}

export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
    if (!gridfsBucket) {
        throw new Error('GridFS not initialized. Call initGridFS() first.');
    }
    return gridfsBucket;
}
