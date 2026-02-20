// Usage: npx ts-node -r tsconfig-paths/register src/scripts/create-admin.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '@/modules/users/model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_DSN || process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables.');
    process.exit(1);
}

const ADMIN_EMAIL = 'admin@noboraz.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin';

async function createAdmin(): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI as string);
        let user = await User.findOne({ email: ADMIN_EMAIL });
        if (user) {
            if (user.role !== 'admin') {
                user.role = 'admin';
                user.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
                user.isVerified = true;
                await user.save();
                console.log('✅ Existing user promoted to admin and password reset.');
            } else {
                console.log('ℹ️ Admin user already exists.');
            }
        } else {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            user = new User({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            await user.save();
            console.log('✅ Admin user created successfully.');
        }
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdmin();
