import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle validation errors
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((err: any) => ({
                field: err.path,
                message: err.msg,
            })),
        });
        return;
    }
    next();
};

/**
 * Common validation rules
 */
export const validators = {
    email: body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),

    password: body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    strongPassword: body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),

    name: body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    phone: body('phone')
        .optional()
        .matches(/^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{3,6}[-\s.]?[0-9]{3,6}$/)
        .withMessage('Please provide a valid phone number'),

    productName: body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Product name must be between 2 and 200 characters'),

    price: body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    stock: body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

    mongoId: (field = 'id') => param(field).isMongoId().withMessage(`Invalid ${field} format`),

    mongoIdBody: (field: string) => body(field).isMongoId().withMessage(`Invalid ${field} format`),

    mongoIdOptional: (field: string) => body(field).optional().isMongoId().withMessage(`Invalid ${field} format`),

    pagination: [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    ],

    search: query('search').optional().trim().isLength({ max: 200 }).withMessage('Search query too long'),

    date: (field: string) => body(field).optional().isISO8601().withMessage(`${field} must be a valid date`),

    shippingAddress: [
        body('shippingAddress.name').trim().notEmpty().withMessage('Recipient name is required'),
        body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
        body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
        body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
    ],

    rating: body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

    reviewText: body('text').optional().trim().isLength({ max: 1000 }).withMessage('Review text must be under 1000 characters'),

    url: (field: string) => body(field).optional().isURL().withMessage(`${field} must be a valid URL`),

    sanitizeHtml: (field: string) => body(field).trim().escape(),
};

/**
 * Validation chains for common operations
 */
export const validationChains = {
    register: [validators.name, validators.email, validators.password, validate],

    login: [validators.email, body('password').notEmpty().withMessage('Password is required'), validate],

    createProduct: [
        validators.productName,
        validators.price,
        validators.stock,
        body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description too long'),
        validate,
    ],

    createOrder: [
        body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
        body('items.*.product').isMongoId().withMessage('Invalid product ID'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        ...validators.shippingAddress,
        validate,
    ],

    createReview: [validators.rating, validators.reviewText, validate],

    updateProfile: [
        body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('phone').optional().trim(),
        validate,
    ],
};
