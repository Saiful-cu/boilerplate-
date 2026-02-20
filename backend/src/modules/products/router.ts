import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import Product from '@/modules/products/model';
import { adminAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validators';

const router = Router();

const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }).withMessage('Product name must be under 200 characters'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a non-negative number'),
    body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a non-negative number'),
    body('externalCost').optional().isFloat({ min: 0 }).withMessage('External cost must be a non-negative number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    body('images').optional().isArray().withMessage('Images must be an array'),
    body('images.*').optional().isString().withMessage('Each image value must be a string URL/path'),
    body('colors').optional().isArray().withMessage('Colors must be an array'),
    body('colors.*.name').optional().isString().notEmpty().withMessage('Each color must have a valid name'),
    body('colors.*.image').optional().isString().withMessage('Color image must be a string'),
    body('features').optional().isArray().withMessage('Features must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('certifications').optional().isArray().withMessage('Certifications must be an array'),
    validate,
];

// Get all products
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, search, featured } = req.query;
        const query: any = {};

        if (category) query.category = category;
        if (featured) query.featured = true;
        if (search) query.name = { $regex: search, $options: 'i' };

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single product
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create product (Admin only)
router.post('/', adminAuth, productValidation, async (req: Request, res: Response) => {
    try {
        const price = Number(req.body.price || 0);
        const totalCost = Number(req.body.cost || 0) + Number(req.body.externalCost || 0);
        if (price < totalCost) {
            return res.status(400).json({ message: 'Selling price cannot be lower than total cost' });
        }
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update product (Admin only)
router.put('/:id', adminAuth, productValidation, async (req: Request, res: Response) => {
    try {
        const price = Number(req.body.price || 0);
        const totalCost = Number(req.body.cost || 0) + Number(req.body.externalCost || 0);
        if (price < totalCost) {
            return res.status(400).json({ message: 'Selling price cannot be lower than total cost' });
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete product (Admin only)
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
