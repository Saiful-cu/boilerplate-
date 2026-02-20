import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HomePage from '@/modules/homepage/model';

dotenv.config();

const seedHomepage = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_DSN || process.env.MONGODB_URI || 'mongodb://localhost:27017/noboraz-ecommerce');
        console.log('Connected to MongoDB');

        // Delete existing homepage
        await HomePage.deleteMany({});
        console.log('Cleared existing homepage data');

        // Create new homepage with complete configuration
        const homepage = new HomePage({
            isActive: true,
            sections: [
                {
                    type: 'hero',
                    title: '',
                    order: 1,
                    isActive: true,
                    config: {
                        title: 'Welcome to Our Store',
                        subtitle: 'Discover amazing products at great prices',
                        buttonText: 'Shop Now',
                        buttonLink: '/products',
                        showButton: true
                    }
                },
                {
                    type: 'product_grid',
                    title: 'Best Seller',
                    order: 2,
                    isActive: true,
                    config: {
                        productType: 'best_sellers',
                        limit: 4,
                        showTabs: false,
                        showViewAll: true
                    }
                },
                {
                    type: 'collection_banners',
                    title: '',
                    order: 3,
                    isActive: true,
                    config: {
                        banners: [
                            {
                                title: 'Top Trending Products',
                                subtitle: 'Discover the latest trends',
                                link: '/products?featured=true',
                                gradient: 'from-blue-500 to-purple-600'
                            },
                            {
                                title: 'Premium Collection',
                                subtitle: 'Quality you can trust',
                                link: '/products?sort=-price',
                                gradient: 'from-pink-500 to-red-600'
                            }
                        ]
                    }
                },
                {
                    type: 'product_grid',
                    title: 'Just Landed',
                    order: 4,
                    isActive: true,
                    config: {
                        productType: 'new_arrivals',
                        limit: 8,
                        showTabs: true,
                        showViewAll: true
                    }
                },
                {
                    type: 'category_grid',
                    title: 'Shop by Category',
                    order: 5,
                    isActive: true,
                    config: {
                        limit: 6
                    }
                },
                {
                    type: 'product_grid',
                    title: 'Featured Products',
                    order: 6,
                    isActive: true,
                    config: {
                        productType: 'featured',
                        limit: 4,
                        showTabs: false,
                        showViewAll: true
                    }
                },
                {
                    type: 'promotional_cards',
                    title: 'Pick Your Favourites',
                    order: 7,
                    isActive: true,
                    config: {
                        cards: [
                            {
                                title: 'Best Deals',
                                subtitle: 'Save up to 50% off',
                                link: '/products?onSale=true',
                                gradient: 'from-orange-400 to-red-500'
                            },
                            {
                                title: 'New Arrivals',
                                subtitle: "Check out what's new",
                                link: '/products?sort=-createdAt',
                                gradient: 'from-green-400 to-blue-500'
                            }
                        ]
                    }
                },
                {
                    type: 'features',
                    title: 'Why Shop With Us?',
                    order: 8,
                    isActive: true,
                    config: {
                        features: [
                            {
                                icon: 'shipping',
                                title: 'Free Shipping',
                                description: 'On orders over ৳1000'
                            },
                            {
                                icon: 'secure',
                                title: 'Secure Payment',
                                description: 'Safe & secure checkout'
                            },
                            {
                                icon: 'return',
                                title: 'Easy Returns',
                                description: '7 days return policy'
                            },
                            {
                                icon: 'support',
                                title: '24/7 Support',
                                description: 'Dedicated customer support'
                            }
                        ]
                    }
                },
                {
                    type: 'newsletter',
                    title: '',
                    order: 9,
                    isActive: true,
                    config: {
                        title: 'Subscribe to Our Newsletter',
                        subtitle: 'Get the latest updates on new products and upcoming sales'
                    }
                }
            ]
        });

        await homepage.save();
        console.log('✅ Homepage seeded successfully with 9 sections!');
        console.log('Sections created:');
        homepage.sections.forEach((section: any, index: number) => {
            console.log(`  ${index + 1}. ${section.type} - "${section.title || section.type}"`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding homepage:', error);
        process.exit(1);
    }
};

seedHomepage();
