import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '@/modules/users/model';
import Product from '@/modules/products/model';

dotenv.config();

const realProducts = [
    {
        name: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
        description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo. Up to 30-hour battery life with quick charge. Optimized for Amazon Alexa and Google Assistant.',
        price: 349.99,
        originalPrice: 399.99,
        category: 'Electronics',
        stock: 50,
        featured: true,
        rating: 4.8,
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop'
        ],
        brand: 'Sony',
        tags: ['wireless', 'noise-canceling', 'premium', 'music']
    },
    {
        name: 'Apple iPod Touch (7th Generation)',
        description: 'All the fun of iPod, now with more fun. Listen to over 60 million songs with Apple Music. Shoot incredible photos and 4K video. Experience augmented reality. And connect with friends through Messages, FaceTime, and social apps.',
        price: 199.99,
        category: 'Electronics',
        stock: 30,
        featured: true,
        rating: 4.6,
        images: [
            'https://images.unsplash.com/photo-1512909006721-3d6018887943?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1542367787-1f71465c7f18?w=600&h=600&fit=crop'
        ],
        brand: 'Apple',
        tags: ['apple', 'music', 'portable', 'entertainment']
    },
    {
        name: 'Peak Design Everyday Backpack V2',
        description: 'The most functional, uncompromising camera and laptop bag ever created. External access, customizable internal dividers, plus laptop and tablet protection. Made from weatherproof 400D nylon canvas shell with ultra-durable 1680D ballistic nylon base.',
        price: 279.99,
        category: 'Bags & Accessories',
        stock: 75,
        featured: false,
        rating: 4.7,
        images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&h=600&fit=crop'
        ],
        brand: 'Peak Design',
        tags: ['backpack', 'camera', 'laptop', 'professional', 'durable']
    },
    {
        name: 'Anker PowerCore 26800 Portable Charger',
        description: 'Ultra-high capacity power bank provides multiple charges for your devices. PowerIQ and VoltageBoost technology charges devices up to 3A. Triple recharging via Micro USB. LED power indicator. Compact size with massive power.',
        price: 65.99,
        category: 'Electronics',
        stock: 120,
        featured: true,
        rating: 4.5,
        images: [
            'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1620072814833-fdc3d33071b0?w=600&h=600&fit=crop'
        ],
        brand: 'Anker',
        tags: ['power-bank', 'fast-charging', 'portable', 'travel']
    },
    {
        name: 'Braun Multimix 3 Hand Mixer',
        description: 'Professional 400W hand mixer with SmartMix technology. 5 speed settings plus turbo function. Patented PowerBell Plus whisks and dough hooks included. Ergonomic soft-grip handle for comfortable use.',
        price: 89.99,
        category: 'Home & Kitchen',
        stock: 45,
        featured: false,
        rating: 4.3,
        images: [
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1574269910136-ac999ba093c4?w=600&h=600&fit=crop'
        ],
        brand: 'Braun',
        tags: ['kitchen', 'appliance', 'baking', 'mixer']
    },
    {
        name: 'JBL Flip 5 Waterproof Portable Bluetooth Speaker',
        description: 'Bring your speakers anywhere. Pool party? Perfect. Sudden downpour? Just keep jamming. The IPX7 waterproof JBL Flip 5 delivers surprisingly powerful stereo sound. This ultra-portable speaker is perfect for any adventure.',
        price: 119.99,
        category: 'Electronics',
        stock: 80,
        featured: true,
        rating: 4.6,
        images: [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'
        ],
        brand: 'JBL',
        tags: ['speaker', 'bluetooth', 'waterproof', 'portable', 'party']
    },
    {
        name: 'Levi\'s Classic Trucker Jacket',
        description: 'An authentic classic since 1967. The iconic trucker jacket is a timeless style that\'s always in season. Made with classic denim and iconic stitching, finished with signature red tab. Perfect for layering.',
        price: 79.99,
        originalPrice: 98.00,
        category: 'Fashion',
        stock: 60,
        featured: false,
        rating: 4.4,
        images: [
            'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=600&h=600&fit=crop'
        ],
        brand: 'Levi\'s',
        tags: ['denim', 'jacket', 'classic', 'fashion', 'casual']
    },
    {
        name: 'Nike Air Force 1 \'07 Sneakers',
        description: 'The radiance lives on in the Nike Air Force1 \'07, the basketball original that puts a fresh spin on what you know best: durably stitched overlays, clean finishes and the perfect amount of flash to make you shine.',
        price: 89.99,
        category: 'Fashion',
        stock: 95,
        featured: true,
        rating: 4.7,
        images: [
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop'
        ],
        brand: 'Nike',
        tags: ['sneakers', 'shoes', 'classic', 'basketball', 'lifestyle']
    },
    {
        name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
        description: 'Instant Pot Duo replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, saute, yogurt maker and warmer. Features 13 One-Touch Smart Programs. Stainless steel inner pot is dishwasher safe.',
        price: 79.95,
        originalPrice: 99.95,
        category: 'Home & Kitchen',
        stock: 40,
        featured: true,
        rating: 4.8,
        images: [
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1556909045-f23c14b94cc1?w=600&h=600&fit=crop'
        ],
        brand: 'Instant Pot',
        tags: ['pressure-cooker', 'kitchen', 'multi-cooker', 'appliance']
    },
    {
        name: 'The Coffee Bean & Tea Leaf Premium Ground Coffee',
        description: 'Our signature blend combines the best Central and South American arabica beans, medium roasted to perfection. Rich, smooth taste with notes of chocolate and nuts. Perfect for drip coffee makers, French press, or pour over.',
        price: 12.99,
        category: 'Food & Beverages',
        stock: 150,
        featured: false,
        rating: 4.2,
        images: [
            'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&h=600&fit=crop'
        ],
        brand: 'The Coffee Bean & Tea Leaf',
        tags: ['coffee', 'ground', 'arabica', 'medium-roast', 'premium']
    },
    {
        name: 'Samsung Galaxy Buds Pro',
        description: 'Galaxy Buds Pro deliver spacious sound unlike anything you\'ve heard in earbuds before. The 11-mm woofer and 6.5-mm tweeter deliver studio-quality sound. Intelligent Active Noise Cancellation. 360 Audio with Dolby Head Tracking.',
        price: 199.99,
        category: 'Electronics',
        stock: 70,
        featured: true,
        rating: 4.5,
        images: [
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop'
        ],
        brand: 'Samsung',
        tags: ['earbuds', 'wireless', 'noise-canceling', 'premium']
    },
    {
        name: 'Fitbit Versa 3 Health & Fitness Smartwatch',
        description: 'Get motivated, get moving, and get the insights you need with this health and fitness smartwatch with 6+ day battery, built-in GPS, music storage, Amazon Alexa Built-in, sleep score and 20+ exercise modes.',
        price: 199.95,
        originalPrice: 229.95,
        category: 'Electronics',
        stock: 85,
        featured: true,
        rating: 4.4,
        images: [
            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop'
        ],
        brand: 'Fitbit',
        tags: ['smartwatch', 'fitness', 'health', 'gps', 'activity-tracker']
    }
];

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

        // Create real products
        await Product.insertMany(realProducts);
        console.log(`${realProducts.length} real products created`);

        console.log('✅ Database seeded successfully!');
        console.log('\nAdmin credentials:');
        console.log('Email: admin@noboraz.com');
        console.log('Password: admin123');
        console.log('\nCustomer credentials:');
        console.log('Email: customer@example.com');
        console.log('Password: customer123');

        console.log('\n📦 Products seeded with real data and images');
        console.log('   - Sony WH-1000XM4 Headphones');
        console.log('   - Apple iPod Touch');
        console.log('   - Peak Design Backpack');
        console.log('   - JBL Flip 5 Speaker');
        console.log('   - Nike Air Force 1');
        console.log('   - Instant Pot');
        console.log('   - Samsung Galaxy Buds Pro');
        console.log('   - Fitbit Versa 3');
        console.log('   - And more premium products...');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();