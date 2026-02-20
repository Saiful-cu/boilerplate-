import { Response, Request, NextFunction } from 'express';

/**
 * Send success response
 */
export const sendSuccess = (res: Response, data: any, message = 'Success', statusCode = 200): Response => {
    return res.status(statusCode).json({ success: true, message, data });
};

/**
 * Send error response
 */
export const sendError = (res: Response, message = 'Server error', statusCode = 500, error: Error | null = null): Response => {
    const response: Record<string, any> = { success: false, message };
    if (error && process.env.NODE_ENV === 'development') {
        response.error = error.message || error;
    }
    return res.status(statusCode).json(response);
};

/**
 * Send not found response
 */
export const sendNotFound = (res: Response, resource = 'Resource'): Response => {
    return res.status(404).json({ success: false, message: `${resource} not found` });
};

/**
 * Send bad request response
 */
export const sendBadRequest = (res: Response, message = 'Bad request'): Response => {
    return res.status(400).json({ success: false, message });
};

/**
 * Send unauthorized response
 */
export const sendUnauthorized = (res: Response, message = 'Unauthorized'): Response => {
    return res.status(401).json({ success: false, message });
};

/**
 * Send forbidden response
 */
export const sendForbidden = (res: Response, message = 'Forbidden'): Response => {
    return res.status(403).json({ success: false, message });
};

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Handle Mongoose duplicate key error
 */
export const handleDuplicateKeyError = (error: any, res: Response, field = 'Field'): Response | null => {
    if (error.code === 11000) {
        return sendBadRequest(res, `${field} already exists`);
    }
    return null;
};

/**
 * Handle Mongoose validation error
 */
export const handleValidationError = (error: any, res: Response): Response | null => {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        return sendBadRequest(res, messages.join(', '));
    }
    return null;
};
