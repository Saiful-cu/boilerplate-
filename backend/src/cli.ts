import { connectMongo, disconnectMongo } from '@/lib/mongo';
import { userService } from '@/modules/users/service';
import { logger } from '@/lib/logger';

async function main(): Promise<void> {
    const cmd = process.argv[2] || 'help';

    try {
        if (cmd === 'help') {
            console.log('Usage: npm run db:cli -- <command>');
            console.log('Commands:');
            console.log('  list-users      List all users');
            console.log('  seed            Run seed script');
            process.exit(0);
        }

        if (cmd === 'seed') {
            await connectMongo();
            // Reuse seed script behavior
            const user = await userService.create({ name: 'CLI Seed', email: `cli-seed-${Date.now()}@example.com`, password: 'password' });
            console.log('Seeded user:', { id: (user as any)._id || (user as any).id, email: user.email });
            await disconnectMongo();
            process.exit(0);
        }

        if (cmd === 'list-users') {
            await connectMongo();
            const users = await userService.list();
            console.log(JSON.stringify(users.map(u => ({ ...u, password: undefined })), null, 2));
            await disconnectMongo();
            process.exit(0);
        }

        console.log(`Unknown command: ${cmd}`);
        process.exit(2);
    } catch (err) {
        logger.error('CLI error', err as Error);
        await disconnectMongo();
        process.exit(1);
    }
}

main();
