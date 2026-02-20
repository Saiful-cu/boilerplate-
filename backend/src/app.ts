import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from '@/config';
import logger from '@/utils/logger';
import { metricsMiddleware } from '@/modules/metrics/router';

// Route imports
import authRoutes from '@/modules/auth/router';
import productRoutes from '@/modules/products/router';
import orderRoutes from '@/modules/orders/router';
import adminRoutes from '@/modules/admin/router';
import uploadRoutes from '@/modules/upload/router';
import filesRoutes from '@/modules/files/router';
import categoryRoutes from '@/modules/categories/router';
import settingsRoutes from '@/modules/settings/router';
import reviewRoutes from '@/modules/reviews/router';
import adminReviewRoutes from '@/modules/adminReviews/router';
import homepageRoutes from '@/modules/homepage/router';
import messageTemplateRoutes from '@/modules/messageTemplates/router';
import promoCodeRoutes from '@/modules/promoCodes/router';
import emailLogRoutes from '@/modules/emailLogs/router';
import emailTemplateRoutes from '@/modules/emailTemplates/router';
import auditLogRoutes from '@/modules/auditLogs/router';
import webhookRoutes from '@/modules/webhooks/router';
import bkashRoutes from '@/modules/bkash/router';
import metricsRoutes from '@/modules/metrics/router';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy (for rate limiting behind reverse proxy like nginx)
if (isProduction) {
    app.set('trust proxy', 1);
}

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: isProduction ? {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", 'https:', 'data:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    } : false
}));

// CORS Configuration
const allowedOrigins = config.cors.allowedOrigins;

app.use(cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || !isProduction) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        return req.path === '/api/health';
    }
});

app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many authentication attempts, please try again later.' }
});

// Compression middleware
app.use(compression());

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp({
    whitelist: ['price', 'category', 'rating', 'sort']
}));

// Logging middleware
if (isProduction) {
    app.use(morgan('combined', {
        stream: { write: (message: string) => logger.http(message.trim()) }
    }));
} else {
    app.use(morgan('dev'));
}

// Metrics collection middleware
app.use(metricsMiddleware);

// Apply stricter rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/message-templates', messageTemplateRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/email-logs', emailLogRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/bkash', bkashRoutes);
app.use('/api/metrics', metricsRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    const healthcheck: any = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    };

    if (mongoose.connection.readyState === 1) {
        healthcheck.database = 'Connected';
    } else {
        healthcheck.database = 'Disconnected';
        healthcheck.status = 'DEGRADED';
    }

    res.status(healthcheck.status === 'OK' ? 200 : 503).json(healthcheck);
});

// Public configuration endpoint (lightweight) - exposes feature flags the frontend can use
app.get('/api/public/config', (_req: Request, res: Response) => {
    // expose whether bKash is available (real or mock) so frontend can enable/disable UI
    res.json({
        bkashEnabled: config.bkash.enabled === true || config.bkash.mock === true
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.user?._id
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy does not allow access from this origin'
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: isProduction ? 'Internal server error' : err.message,
        ...(isProduction ? {} : { stack: err.stack })
    });
});

export default app;
