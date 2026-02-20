import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async handler to catch errors in async functions
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export const badRequest = (message = 'Bad request'): AppError => new AppError(message, 400);
export const unauthorized = (message = 'Unauthorized'): AppError => new AppError(message, 401);
export const forbidden = (message = 'Access forbidden'): AppError => new AppError(message, 403);
export const notFound = (message = 'Resource not found'): AppError => new AppError(message, 404);
export const conflict = (message = 'Resource already exists'): AppError => new AppError(message, 409);
export const unprocessable = (message = 'Unprocessable entity'): AppError => new AppError(message, 422);
export const tooManyRequests = (message = 'Too many requests'): AppError => new AppError(message, 429);
export const serverError = (message = 'Internal server error'): AppError => new AppError(message, 500);
