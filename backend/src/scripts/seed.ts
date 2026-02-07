import { connectMongo, disconnectMongo } from '@/lib/mongo';
import { userService } from '@/modules/users/service';
import { logger } from '@/lib/logger';

async function seed(): Promise<void> {
    try {
        await connectMongo();

        logger.info('Seeding database with example user');

        // Create a sample user (id/email unique check is handled by service)
        const sample = await userService.create({
            name: 'Seed User',
            email: 'admin@yopmail.com',
            password: 'admin', // NOTE: in real apps, never use raw passwords
        });

        logger.info('Seed complete', { userId: (sample as any)._id || (sample as any).id, email: sample.email });
    } catch (err) {
        logger.error('Seed failed', err as Error);
        process.exitCode = 1;
    } finally {
        await disconnectMongo();
    }
}

seed();
