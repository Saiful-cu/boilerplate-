import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import os from 'os';
import Order from '@/modules/orders/model';
import Product from '@/modules/products/model';
import User from '@/modules/users/model';

const router = Router();

// Track request metrics
const metrics = {
    requests: {
        total: 0,
        success: 0,
        errors: 0,
        byStatusCode: {} as Record<string, number>
    },
    latency: {
        sum: 0,
        count: 0,
        max: 0,
        min: Infinity
    },
    startTime: Date.now()
};

/**
 * Middleware to track request metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;

        metrics.requests.total++;
        metrics.latency.sum += duration;
        metrics.latency.count++;
        metrics.latency.max = Math.max(metrics.latency.max, duration);
        metrics.latency.min = Math.min(metrics.latency.min, duration);

        const statusCode = res.statusCode.toString();
        metrics.requests.byStatusCode[statusCode] = (metrics.requests.byStatusCode[statusCode] || 0) + 1;

        if (res.statusCode >= 400) {
            metrics.requests.errors++;
        } else {
            metrics.requests.success++;
        }
    });

    next();
};

/**
 * Reset metrics (useful for testing)
 */
export const resetMetrics = (): void => {
    metrics.requests = { total: 0, success: 0, errors: 0, byStatusCode: {} };
    metrics.latency = { sum: 0, count: 0, max: 0, min: Infinity };
    metrics.startTime = Date.now();
};

/**
 * Detailed health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
    const healthcheck: any = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime())
    };

    try {
        if (mongoose.connection.readyState === 1) {
            const pingStart = Date.now();
            await mongoose.connection.db!.admin().ping();
            healthcheck.database = {
                status: 'Connected',
                latency: Date.now() - pingStart
            };
        } else {
            healthcheck.database = { status: 'Disconnected' };
            healthcheck.status = 'DEGRADED';
        }
    } catch (error: any) {
        healthcheck.database = { status: 'Error', message: error.message };
        healthcheck.status = 'DEGRADED';
    }

    const memUsage = process.memoryUsage();
    healthcheck.memory = {
        heapUsed: formatBytes(memUsage.heapUsed),
        heapTotal: formatBytes(memUsage.heapTotal),
        rss: formatBytes(memUsage.rss),
        external: formatBytes(memUsage.external)
    };

    res.status(healthcheck.status === 'OK' ? 200 : 503).json(healthcheck);
});

/**
 * Readiness probe
 */
router.get('/ready', async (req: Request, res: Response) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ ready: false, reason: 'Database not connected' });
        }

        await mongoose.connection.db!.admin().ping();

        res.status(200).json({ ready: true });
    } catch (error: any) {
        res.status(503).json({ ready: false, reason: error.message });
    }
});

/**
 * Liveness probe
 */
router.get('/live', (req: Request, res: Response) => {
    res.status(200).json({ alive: true, timestamp: new Date().toISOString() });
});

/**
 * Metrics endpoint (Prometheus-compatible format)
 */
router.get('/metrics', async (req: Request, res: Response) => {
    const uptimeSeconds = Math.floor((Date.now() - metrics.startTime) / 1000);
    const avgLatency = metrics.latency.count > 0 ? metrics.latency.sum / metrics.latency.count : 0;

    let output = '';

    output += '# HELP http_requests_total Total number of HTTP requests\n';
    output += '# TYPE http_requests_total counter\n';
    output += `http_requests_total ${metrics.requests.total}\n`;

    output += '# HELP http_requests_success_total Total number of successful HTTP requests\n';
    output += '# TYPE http_requests_success_total counter\n';
    output += `http_requests_success_total ${metrics.requests.success}\n`;

    output += '# HELP http_requests_errors_total Total number of failed HTTP requests\n';
    output += '# TYPE http_requests_errors_total counter\n';
    output += `http_requests_errors_total ${metrics.requests.errors}\n`;

    output += '# HELP http_request_duration_ms Average request latency in milliseconds\n';
    output += '# TYPE http_request_duration_ms gauge\n';
    output += `http_request_duration_ms_avg ${avgLatency.toFixed(2)}\n`;
    output += `http_request_duration_ms_max ${metrics.latency.max}\n`;
    output += `http_request_duration_ms_min ${metrics.latency.min === Infinity ? 0 : metrics.latency.min}\n`;

    output += '# HELP process_uptime_seconds Process uptime in seconds\n';
    output += '# TYPE process_uptime_seconds gauge\n';
    output += `process_uptime_seconds ${uptimeSeconds}\n`;

    const memUsage = process.memoryUsage();
    output += '# HELP process_memory_heap_used_bytes Heap memory used\n';
    output += '# TYPE process_memory_heap_used_bytes gauge\n';
    output += `process_memory_heap_used_bytes ${memUsage.heapUsed}\n`;

    output += '# HELP process_memory_rss_bytes Resident set size\n';
    output += '# TYPE process_memory_rss_bytes gauge\n';
    output += `process_memory_rss_bytes ${memUsage.rss}\n`;

    output += '# HELP http_requests_by_status HTTP requests by status code\n';
    output += '# TYPE http_requests_by_status counter\n';
    for (const [code, count] of Object.entries(metrics.requests.byStatusCode)) {
        output += `http_requests_by_status{code="${code}"} ${count}\n`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(output);
});

/**
 * JSON metrics endpoint (for custom dashboards)
 */
router.get('/metrics/json', async (req: Request, res: Response) => {
    const uptimeSeconds = Math.floor((Date.now() - metrics.startTime) / 1000);
    const avgLatency = metrics.latency.count > 0 ? metrics.latency.sum / metrics.latency.count : 0;

    let businessMetrics: any = {};
    try {
        const [ordersToday, pendingOrders, totalProducts, totalUsers] = await Promise.all([
            Order.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            Order.countDocuments({ orderStatus: 'pending' }),
            Product.countDocuments(),
            User.countDocuments({ role: 'customer' })
        ]);

        businessMetrics = {
            ordersToday,
            pendingOrders,
            totalProducts,
            totalUsers
        };
    } catch (error) {
        businessMetrics = { error: 'Failed to fetch business metrics' };
    }

    res.json({
        timestamp: new Date().toISOString(),
        uptime: {
            seconds: uptimeSeconds,
            formatted: formatUptime(uptimeSeconds)
        },
        requests: {
            total: metrics.requests.total,
            success: metrics.requests.success,
            errors: metrics.requests.errors,
            errorRate: metrics.requests.total > 0
                ? ((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2) + '%'
                : '0%',
            byStatusCode: metrics.requests.byStatusCode
        },
        latency: {
            average: avgLatency.toFixed(2),
            max: metrics.latency.max,
            min: metrics.latency.min === Infinity ? 0 : metrics.latency.min,
            unit: 'ms'
        },
        memory: {
            heapUsed: formatBytes(process.memoryUsage().heapUsed),
            heapTotal: formatBytes(process.memoryUsage().heapTotal),
            rss: formatBytes(process.memoryUsage().rss)
        },
        system: {
            cpuCount: os.cpus().length,
            loadAverage: os.loadavg(),
            freeMemory: formatBytes(os.freemem()),
            totalMemory: formatBytes(os.totalmem())
        },
        database: {
            status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
            name: mongoose.connection.name
        },
        business: businessMetrics
    });
});

// Helper functions
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
}

function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let value = bytes;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
}

export default router;
