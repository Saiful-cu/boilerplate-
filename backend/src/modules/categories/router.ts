import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import Category from '@/modules/categories/model';
import Product from '@/modules/products/model';
import { adminAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validators';
import {
    sendSuccess,
    sendError,
    sendNotFound,
    asyncHandler,
    handleDuplicateKeyError,
    handleValidationError,
} from '@/utils/responseHelpers';

const router = Router();

const categoryValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be 500 characters or less'),
    body('image')
        .optional()
        .trim()
        .isString()
        .withMessage('Image must be a string'),
    body('icon')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Icon must be 20 characters or less'),
    body('displayOrder')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Display order must be a non-negative integer'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be true or false'),
    body('parentCategory')
        .optional({ values: 'falsy' })
        .isMongoId()
        .withMessage('Parent category must be a valid category id'),
    validate,
];

const createCategoryValidation = [
    body('name')
        .exists({ checkFalsy: true })
        .withMessage('Category name is required')
        .bail()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters'),
    ...categoryValidation,
];

const idParamValidation = [
    param('id').isMongoId().withMessage('Invalid category id'),
];

const idValidation = [
    ...idParamValidation,
    validate,
];

// Get all categories (public)
router.get('/', [
    query('active').optional().isIn(['true', 'false']).withMessage('active must be true or false'),
    query('parent').optional().custom((value) => {
        if (value === 'null') return true;
        if (/^[0-9a-fA-F]{24}$/.test(String(value))) return true;
        throw new Error('parent must be null or a valid category id');
    }),
    validate,
], asyncHandler(async (req: Request, res: Response) => {
    const { active, parent } = req.query;
    const queryObj: any = {};

    if (active === 'true') queryObj.isActive = true;
    if (active === 'false') queryObj.isActive = false;
    if (parent === 'null') queryObj.parentCategory = null;
    else if (parent) queryObj.parentCategory = parent;

    const categories = await Category.find(queryObj)
        .populate('parentCategory', 'name slug')
        .sort({ displayOrder: 1, name: 1 });

    sendSuccess(res, categories);
}));

// Get category by slug (public)
router.get('/slug/:slug', asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findOne({ slug: req.params.slug })
        .populate('parentCategory', 'name slug');

    if (!category) {
        return sendNotFound(res, 'Category');
    }

    const productCount = await Product.countDocuments({ category: category.name });
    sendSuccess(res, { ...category.toObject(), productCount });
}));

// Get single category (public)
router.get('/:id', idValidation, asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id)
        .populate('parentCategory', 'name slug');

    if (!category) {
        return sendNotFound(res, 'Category');
    }
    sendSuccess(res, category);
}));

// Create category (Admin only)
router.post('/', adminAuth, createCategoryValidation, asyncHandler(async (req: Request, res: Response) => {
    try {
        const category = new Category(req.body);
        await category.save();
        sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error: any) {
        const validationResponse = handleValidationError(error, res);
        if (validationResponse) return validationResponse;
        if (error.code === 11000) {
            return handleDuplicateKeyError(error, res, 'Category name');
        }
        throw error;
    }
}));

// Update category (Admin only)
router.put('/:id', adminAuth, [...idParamValidation, ...categoryValidation], asyncHandler(async (req: Request, res: Response) => {
    try {
        const oldCategory = await Category.findById(req.params.id);
        if (!oldCategory) {
            return sendNotFound(res, 'Category');
        }

        if (req.body.parentCategory && req.body.parentCategory === req.params.id) {
            return sendError(res, 'Category cannot be its own parent', 400);
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return sendNotFound(res, 'Category');
        }

        if (req.body.name && oldCategory.name !== req.body.name) {
            await Product.updateMany(
                { category: oldCategory.name },
                { category: req.body.name }
            );
        }

        sendSuccess(res, category, 'Category updated successfully');
    } catch (error: any) {
        const validationResponse = handleValidationError(error, res);
        if (validationResponse) return validationResponse;
        if (error.code === 11000) {
            return handleDuplicateKeyError(error, res, 'Category name');
        }
        throw error;
    }
}));

// Delete category (Admin only)
router.delete('/:id', adminAuth, idValidation, asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return sendNotFound(res, 'Category');
    }

    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
        return sendError(res, `Cannot delete category. ${productCount} products are using this category.`, 400);
    }

    const subcategoryCount = await Category.countDocuments({ parentCategory: req.params.id });
    if (subcategoryCount > 0) {
        return sendError(res, `Cannot delete category. It has ${subcategoryCount} subcategories.`, 400);
    }

    await Category.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, 'Category deleted successfully');
}));

// Update product counts for all categories (Admin only)
router.post('/update-counts', adminAuth, asyncHandler(async (_req: Request, res: Response) => {
    const categories = await Category.find();

    for (const category of categories) {
        const count = await Product.countDocuments({ category: category.name });
        (category as any).productCount = count;
        await category.save();
    }

    sendSuccess(res, null, 'Product counts updated successfully');
}));

export default router;
