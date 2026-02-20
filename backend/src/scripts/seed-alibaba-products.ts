import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '@/modules/products/model';

dotenv.config();

const alibabaProducts = [
  {
    name: 'BIKI Instant Shoe Shine Sponge - Quick Leather Bright',
    description:
      'Colorless quick leather bright sponge — easy to use, eco-friendly formula that provides instant shine and nourishment to leather products. Ideal for hotels and retail resale.',
    price: 20.78,
    originalPrice: 25.0,
    category: 'Shoe Care',
    stock: 500,
    images: [
      'https://s.alicdn.com/@sc04/kf/H8e272e403aed4ac4ab23ccb9c19f6063X.jpg',
      'https://s.alicdn.com/@sc04/kf/H640545dc18844a0f8947d0535f9a41d5j.jpg',
      'https://s.alicdn.com/@sc04/kf/Ha8ecd19ac5554b88868e954b7c1474e0K.jpg'
    ],
    featured: true,
    rating: 5.0,
    brand: 'BIKI',
    modelNumber: 'BK6650B',
    features: ['Easy to Clean', 'Eco-Friendly', 'Nourish', 'Quick Shine'],
    moq: 5000,
    unitsSold: 396294,
    reviewCount: 87,
    placeOfOrigin: 'Guangdong, China',
    leadTime: '15-30 days',
    customization: true,
    colors: [{ name: 'Black', image: '' }, { name: 'Colorless', image: '' }],
    tags: ['shoe polish', 'leather care', 'instant shine']
  },
  {
    name: 'Hot Selling Portable White Sport Shoe Foam Cleaner',
    description:
      'Portable foam cleaner for white sports shoes — quick stain removal, travel-friendly 60ML size.',
    price: 51.33,
    originalPrice: 55.0,
    category: 'Shoe Care',
    stock: 350,
    images: [
      'https://s.alicdn.com/@sc04/kf/H914c1c28bb974b94a83c4da6487886edK.jpg',
      'https://s.alicdn.com/@sc04/kf/H3a830040e261485c9d7c89b767199a3eb.jpg'
    ],
    featured: true,
    rating: 5.0,
    brand: 'BIKI',
    modelNumber: 'BK7740',
    features: ['Quick', 'Easy to Clean', 'Portable', 'Stain Remover'],
    moq: 960,
    unitsSold: 101411,
    reviewCount: 19,
    placeOfOrigin: 'Guangdong, China',
    leadTime: '15-30 days',
    customization: true,
    volume: '60ML',
    colors: [{ name: 'White', image: '' }],
    tags: ['sneaker cleaner', 'foam cleaner', 'stain remover']
  },
  {
    name: 'Deep Nourishment 50ml Shoe Polish With Sponge',
    description:
      '50ml shoe polish with integrated sponge for deep nourishment and quick bright finish. Suitable for all leather types.',
    price: 34.22,
    originalPrice: 40.0,
    category: 'Shoe Care',
    stock: 600,
    images: [
      'https://s.alicdn.com/@sc04/kf/H2958bbd90dca41549c6e4d97d0f11849r.jpg',
      'https://s.alicdn.com/@sc04/kf/Ha7d737ee59c44b4196e6a1189e032779h.jpg'
    ],
    featured: true,
    rating: 5.0,
    brand: 'BIKI',
    modelNumber: 'BK350',
    features: ['Deep Nourishment', 'Easy to Clean', 'Color Refreshing'],
    moq: 144,
    unitsSold: 300364,
    reviewCount: 115,
    placeOfOrigin: 'Guangdong, China',
    packaging: '1 batch = 144 pieces',
    leadTime: '15-30 days',
    customization: true,
    weight: '50ml',
    colors: [{ name: 'Black', image: '' }, { name: 'Neutral', image: '' }, { name: 'Brown', image: '' }],
    tags: ['shoe polish', 'leather care', 'deep nourishment']
  },
  {
    name: 'OEM Shoe Foam Cleaner 200ml - Easy Use Quick Solution',
    description:
      '200ml liquid sneaker cleaner with neutral, alcohol-free formula. OEM/ODM options available.',
    price: 48.89,
    originalPrice: 51.33,
    category: 'Shoe Care',
    stock: 400,
    images: [
      'https://s.alicdn.com/@sc04/kf/H2656736889424bb3945c9dade81c9fe24.jpg',
      'https://s.alicdn.com/@sc04/kf/H13c5de400e804c7081cfcd009b121731i.jpg'
    ],
    featured: false,
    rating: 5.0,
    brand: 'BIAOQI',
    modelNumber: 'BK7733',
    features: ['Neutral Formula', 'Alcohol Free', 'Quick Cleaning'],
    moq: 2000,
    unitsSold: 43813,
    reviewCount: 23,
    placeOfOrigin: 'Guangdong, China',
    volume: '200ml',
    leadTime: '15-30 days',
    customization: true,
    colors: [{ name: 'White', image: '' }],
    tags: ['foam cleaner', 'sneaker cleanser']
  },
  {
    name: 'Factory Direct Shoe Cleaner Set - Foam Brush Kit',
    description:
      '4-piece shoe cleaning kit with foam cleaner and brushes. Neutral formula with waterproof protection and leather conditioner.',
    price: 174.76,
    originalPrice: 193.09,
    category: 'Shoe Care',
    stock: 250,
    images: [
      'https://s.alicdn.com/@sc04/kf/H58908aff0bdc4a67b79d35c630acc3f66.jpg',
      'https://s.alicdn.com/@sc04/kf/H5473657de5f5452b8e4e0062f2d504f7U.jpg'
    ],
    featured: true,
    rating: 5.0,
    brand: 'BIKI',
    modelNumber: 'TB235',
    features: ['Neutral Formula', 'Waterproof', 'Leather Conditioner'],
    moq: 24,
    unitsSold: 80190,
    reviewCount: 39,
    placeOfOrigin: 'Guangdong, China',
    packaging: 'Multiple of 24',
    volume: '150mL',
    leadTime: '15-30 days',
    customization: true,
    colors: [{ name: 'Yellow', image: '' }],
    tags: ['cleaning kit', 'foam brush', 'stain remover']
  }
];

const seedAlibabaProducts = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGODB_DSN || process.env.MONGODB_URI || 'mongodb://localhost:27017/noboraz';
    console.log('Connecting to MongoDB...', mongoUrl);
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    console.log('Removing existing products...');
    await Product.deleteMany({});
    console.log('Existing products removed');

    console.log('Inserting Alibaba products...');
    const inserted = await Product.insertMany(alibabaProducts as any[]);
    console.log(`Inserted ${inserted.length} products`);

    console.log('\nProduct list:');
    inserted.forEach((p, i) => console.log(`${i + 1}. ${p.name} — ${p.brand} — ${p.price}`));

    console.log('\nSeeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedAlibabaProducts();
