// Database indexes for production performance
// Run: npx ts-node -r tsconfig-paths/register src/scripts/create-indexes.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_DSN || process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
}

async function createIndexes(): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db!;

        // ==========================================
        // PRODUCTS COLLECTION
        // ==========================================
        console.log('\n📦 Creating Product indexes...');

        await db.collection('products').createIndex(
            { name: 'text', description: 'text' },
            { name: 'products_text_search', weights: { name: 10, description: 5 } }
        );
        console.log('  ✓ Text search index');

        await db.collection('products').createIndex(
            { category: 1 },
            { name: 'products_category' }
        );
        console.log('  ✓ Category index');

        await db.collection('products').createIndex(
            { price: 1 },
            { name: 'products_price' }
        );
        console.log('  ✓ Price index');

        await db.collection('products').createIndex(
            { featured: 1, createdAt: -1 },
            { name: 'products_featured' }
        );
        console.log('  ✓ Featured products index');

        await db.collection('products').createIndex(
            { stock: 1 },
            { name: 'products_stock' }
        );
        console.log('  ✓ Stock index');

        await db.collection('products').createIndex(
            { createdAt: -1 },
            { name: 'products_created' }
        );
        console.log('  ✓ Created date index');

        // ==========================================
        // ORDERS COLLECTION
        // ==========================================
        console.log('\n🛒 Creating Order indexes...');

        await db.collection('orders').createIndex(
            { user: 1, createdAt: -1 },
            { name: 'orders_user_date' }
        );
        console.log('  ✓ User orders index');

        await db.collection('orders').createIndex(
            { orderStatus: 1, createdAt: -1 },
            { name: 'orders_status' }
        );
        console.log('  ✓ Order status index');

        await db.collection('orders').createIndex(
            { paymentStatus: 1 },
            { name: 'orders_payment_status' }
        );
        console.log('  ✓ Payment status index');

        await db.collection('orders').createIndex(
            { createdAt: -1 },
            { name: 'orders_created' }
        );
        console.log('  ✓ Created date index');

        await db.collection('orders').createIndex(
            { 'items.product': 1 },
            { name: 'orders_products' }
        );
        console.log('  ✓ Order items product index');

        // ==========================================
        // USERS COLLECTION
        // ==========================================
        console.log('\n👤 Creating User indexes...');

        await db.collection('users').createIndex(
            { email: 1 },
            { name: 'users_email', unique: true }
        );
        console.log('  ✓ Email unique index');

        await db.collection('users').createIndex(
            { role: 1 },
            { name: 'users_role' }
        );
        console.log('  ✓ Role index');

        await db.collection('users').createIndex(
            { createdAt: -1 },
            { name: 'users_created' }
        );
        console.log('  ✓ Created date index');

        await db.collection('users').createIndex(
            { verificationToken: 1 },
            { name: 'users_verification_token', sparse: true }
        );
        console.log('  ✓ Verification token index');

        // ==========================================
        // CATEGORIES COLLECTION
        // ==========================================
        console.log('\n📁 Creating Category indexes...');

        await db.collection('categories').createIndex(
            { slug: 1 },
            { name: 'categories_slug', unique: true }
        );
        console.log('  ✓ Slug unique index');

        await db.collection('categories').createIndex(
            { parent: 1 },
            { name: 'categories_parent' }
        );
        console.log('  ✓ Parent category index');

        await db.collection('categories').createIndex(
            { order: 1 },
            { name: 'categories_order' }
        );
        console.log('  ✓ Order index');

        // ==========================================
        // REVIEWS COLLECTION
        // ==========================================
        console.log('\n⭐ Creating Review indexes...');

        await db.collection('reviews').createIndex(
            { product: 1, createdAt: -1 },
            { name: 'reviews_product' }
        );
        console.log('  ✓ Product reviews index');

        await db.collection('reviews').createIndex(
            { user: 1 },
            { name: 'reviews_user' }
        );
        console.log('  ✓ User reviews index');

        await db.collection('reviews').createIndex(
            { status: 1 },
            { name: 'reviews_status' }
        );
        console.log('  ✓ Status index');

        // ==========================================
        // PROMO CODES COLLECTION
        // ==========================================
        console.log('\n🎟️ Creating PromoCode indexes...');

        await db.collection('promocodes').createIndex(
            { code: 1 },
            { name: 'promocodes_code', unique: true }
        );
        console.log('  ✓ Code unique index');

        await db.collection('promocodes').createIndex(
            { isActive: 1, startDate: 1, endDate: 1 },
            { name: 'promocodes_active' }
        );
        console.log('  ✓ Active codes index');

        // ==========================================
        // AUDIT LOGS COLLECTION
        // ==========================================
        console.log('\n📋 Creating AuditLog indexes...');

        await db.collection('auditlogs').createIndex(
            { createdAt: -1 },
            { name: 'auditlogs_created' }
        );
        console.log('  ✓ Created date index');

        await db.collection('auditlogs').createIndex(
            { userId: 1, createdAt: -1 },
            { name: 'auditlogs_user' }
        );
        console.log('  ✓ User audit logs index');

        await db.collection('auditlogs').createIndex(
            { action: 1, createdAt: -1 },
            { name: 'auditlogs_action' }
        );
        console.log('  ✓ Action index');

        await db.collection('auditlogs').createIndex(
            { resourceType: 1, resourceId: 1 },
            { name: 'auditlogs_resource' }
        );
        console.log('  ✓ Resource index');

        // TTL index for auto-cleanup (1 year retention)
        await db.collection('auditlogs').createIndex(
            { createdAt: 1 },
            { name: 'auditlogs_ttl', expireAfterSeconds: 365 * 24 * 60 * 60 }
        );
        console.log('  ✓ TTL index (1 year retention)');

        // ==========================================
        // EMAIL LOGS COLLECTION
        // ==========================================
        console.log('\n📧 Creating EmailLog indexes...');

        await db.collection('emaillogs').createIndex(
            { createdAt: -1 },
            { name: 'emaillogs_created' }
        );
        console.log('  ✓ Created date index');

        await db.collection('emaillogs').createIndex(
            { recipient: 1 },
            { name: 'emaillogs_recipient' }
        );
        console.log('  ✓ Recipient index');

        // TTL index for auto-cleanup (90 days retention)
        await db.collection('emaillogs').createIndex(
            { createdAt: 1 },
            { name: 'emaillogs_ttl', expireAfterSeconds: 90 * 24 * 60 * 60 }
        );
        console.log('  ✓ TTL index (90 days retention)');

        // ==========================================
        // SESSIONS COLLECTION
        // ==========================================
        console.log('\n🔐 Creating Session indexes...');

        try {
            await db.collection('sessions').createIndex(
                { expires: 1 },
                { name: 'sessions_expires', expireAfterSeconds: 0 }
            );
            console.log('  ✓ Sessions TTL index');
        } catch (e) {
            console.log('  ⚠ Sessions collection may not exist yet (OK)');
        }

        console.log('\n✅ All indexes created successfully!\n');

        // Print index summary
        console.log('📊 Index Summary:');
        const collections = ['products', 'orders', 'users', 'categories', 'reviews', 'promocodes', 'auditlogs', 'emaillogs'];

        for (const collection of collections) {
            try {
                const indexes = await db.collection(collection).indexes();
                console.log(`  ${collection}: ${indexes.length} indexes`);
            } catch (e) {
                console.log(`  ${collection}: collection not found`);
            }
        }

    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
    }
}

createIndexes();
