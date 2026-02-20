import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '@/modules/users/model';
import Product from '@/modules/products/model';

dotenv.config();

const seedDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_DSN || process.env.MONGODB_URI || 'mongodb://localhost:27017/noboraz');
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'Admin',
            email: 'admin@noboraz.com',
            password: adminPassword,
            role: 'admin',
            isVerified: true
        });

        // Create sample customer
        const customerPassword = await bcrypt.hash('customer123', 10);
        await User.create({
            name: 'John Doe',
            email: 'customer@example.com',
            password: customerPassword,
            role: 'customer',
            isVerified: true
        });

        console.log('Users created');

        // Create sample products
        const products = [
            {
                name: 'Wireless Headphones',
                description: 'High-quality wireless headphones with noise cancellation',
                price: 99.99,
                category: 'Electronics',
                stock: 50,
                featured: true,
                rating: 4.5,
                images: ['https://via.placeholder.com/300x300?text=Headphones']
            },
            {
                name: 'Smart Watch',
                description: 'Fitness tracking smartwatch with heart rate monitor',
                price: 199.99,
                category: 'Electronics',
                stock: 30,
                featured: true,
                rating: 4.7,
                images: ['https://via.placeholder.com/300x300?text=Smart+Watch']
            },
            {
                name: 'Laptop Backpack',
                description: 'Durable backpack with laptop compartment',
                price: 49.99,
                category: 'Accessories',
                stock: 100,
                featured: false,
                rating: 4.3,
                images: ['https://via.placeholder.com/300x300?text=Backpack']
            },
            {
                name: 'USB-C Cable',
                description: 'Fast charging USB-C cable, 6ft length',
                price: 14.99,
                category: 'Accessories',
                stock: 200,
                featured: false,
                rating: 4.0,
                images: ['https://via.placeholder.com/300x300?text=USB+Cable']
            },
            {
                name: 'Portable Charger',
                description: '20000mAh portable power bank',
                price: 39.99,
                category: 'Electronics',
                stock: 75,
                featured: true,
                rating: 4.6,
                images: ['https://via.placeholder.com/300x300?text=Power+Bank']
            },
            {
                name: 'Bluetooth Speaker',
                description: 'Waterproof bluetooth speaker with 12-hour battery',
                price: 79.99,
                category: 'Electronics',
                stock: 40,
                featured: false,
                rating: 4.4,
                images: ['https://via.placeholder.com/300x300?text=Speaker']
            }
        ];

        await Product.insertMany(products);
        console.log('Products created');

        console.log('✅ Database seeded successfully!');
        console.log('\nAdmin credentials:');
        console.log('Email: admin@noboraz.com');
        console.log('Password: admin123');
        console.log('\nCustomer credentials:');
        console.log('Email: customer@example.com');
        console.log('Password: customer123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
