import { Request, Response, NextFunction } from 'express';
import { AuditLogModel, AuditAction, AuditResourceType } from '@/modules/auditLogs/model';
import { logger } from '@/lib/logger';
import { IUserDoc } from '@/modules/users/model';

interface CreateAuditLogOptions {
    userId: any;
    userEmail: string;
    userRole: string;
    action: AuditAction;
    resourceType: AuditResourceType;
    resourceId?: any;
    resourceName?: string;
    previousValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    requestMethod?: string;
    requestPath?: string;
    description?: string;
    metadata?: any;
    status?: 'success' | 'failure';
    errorMessage?: string;
}

/**
 * Create an audit log entry
 */
export const createAuditLog = async (options: CreateAuditLogOptions) => {
    try {
        const auditLog = new AuditLogModel({
            ...options,
            status: options.status || 'success',
        });
        await auditLog.save();
        logger.info(`AUDIT: ${options.action} by ${options.userEmail} on ${options.resourceType}${options.resourceId ? `:${options.resourceId}` : ''}`);
        return auditLog;
    } catch (error) {
        logger.error('Failed to create audit log:', error as Error);
        return null;
    }
};

/**
 * Middleware to automatically log admin actions
 */
export const auditMiddleware = (action: AuditAction, resourceType: AuditResourceType) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const originalJson = res.json.bind(res);

        res.json = ((data: any) => {
            if (req.user && res.statusCode < 400) {
                createAuditLog({
                    userId: req.user._id,
                    userEmail: (req.user as IUserDoc).email,
                    userRole: (req.user as IUserDoc).role,
                    action,
                    resourceType,
                    resourceId: data?._id || data?.id || req.params?.id,
                    resourceName: data?.name || data?.title,
                    newValue: req.body,
                    ipAddress: req.ip || '',
                    userAgent: req.get('User-Agent') || '',
                    requestMethod: req.method,
                    requestPath: req.originalUrl,
                    status: 'success',
                });
            }
            return originalJson(data);
        }) as any;

        next();
    };
};

/**
 * Log admin login
 */
export const logAdminLogin = async (
    user: IUserDoc,
    req: Request,
    success = true,
    errorMessage: string | null = null
) => {
    return createAuditLog({
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        action: 'ADMIN_LOGIN',
        resourceType: 'Auth',
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        requestMethod: 'POST',
        requestPath: '/api/auth/login',
        description: success ? 'Admin login successful' : 'Admin login failed',
        status: success ? 'success' : 'failure',
        errorMessage: errorMessage || undefined,
    });
};

/**
 * Log order status changes
 */
export const logOrderStatusChange = async (
    user: IUserDoc,
    req: Request,
    order: any,
    previousStatus: string,
    newStatus: string
) => {
    return createAuditLog({
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        action: 'ORDER_STATUS_UPDATE',
        resourceType: 'Order',
        resourceId: order._id,
        previousValue: { orderStatus: previousStatus },
        newValue: { orderStatus: newStatus },
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        requestMethod: req.method,
        requestPath: req.originalUrl,
        description: `Order status changed from ${previousStatus} to ${newStatus}`,
    });
};

/**
 * Log product changes
 */
export const logProductChange = async (
    user: IUserDoc,
    req: Request,
    action: AuditAction,
    product: any,
    previousValue: any = null
) => {
    return createAuditLog({
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        action,
        resourceType: 'Product',
        resourceId: product._id,
        resourceName: product.name,
        previousValue,
        newValue: action === 'PRODUCT_DELETE' ? null : product.toObject?.() || product,
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        requestMethod: req.method,
        requestPath: req.originalUrl,
    });
};

/**
 * Log user role changes
 */
export const logUserRoleChange = async (
    adminUser: IUserDoc,
    req: Request,
    targetUser: any,
    previousRole: string,
    newRole: string
) => {
    return createAuditLog({
        userId: adminUser._id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'USER_ROLE_CHANGE',
        resourceType: 'User',
        resourceId: targetUser._id,
        resourceName: targetUser.email,
        previousValue: { role: previousRole },
        newValue: { role: newRole },
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        requestMethod: req.method,
        requestPath: req.originalUrl,
        description: `User role changed from ${previousRole} to ${newRole}`,
    });
};

/**
 * Log settings changes
 */
export const logSettingsChange = async (
    user: IUserDoc,
    req: Request,
    settingsType: string,
    previousValue: any,
    newValue: any
) => {
    return createAuditLog({
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        action: 'SETTINGS_UPDATE',
        resourceType: 'Settings',
        resourceName: settingsType,
        previousValue,
        newValue,
        ipAddress: req.ip || '',
        userAgent: req.get('User-Agent') || '',
        requestMethod: req.method,
        requestPath: req.originalUrl,
        description: `Settings updated: ${settingsType}`,
    });
};
