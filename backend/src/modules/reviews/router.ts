import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import Review from '@/modules/reviews/model';
import Product from '@/modules/products/model';
import Order from '@/modules/orders/model';
import { auth } from '@/middleware/auth';
import multer from 'multer';
import { getGridFSBucket } from '@/lib/mongo';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Helper function to upload file to GridFS
const uploadToGridFS = (file: Express.Multer.File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const bucket = getGridFSBucket();
        const filename = `${Date.now()}-${file.originalname}`;

        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype,
            metadata: {
                originalName: file.originalname,
                uploadDate: new Date(),
                type: 'review'
            }
        });

        const readableStream = Readable.from(file.buffer);

        readableStream.pipe(uploadStream)
            .on('error', (error: Error) => reject(error))
            .on('finish', () => {
                resolve(`/api/files/${uploadStream.id.toString()}`);
            });
    });
};

// Create a review (only verified purchasers)
router.post('/', auth, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
]), async (req: Request, res: Response) => {
    try {
        const { productId, orderId, rating, comment } = req.body;

        const order = await Order.findOne({
            _id: orderId,
            user: req.user!._id,
            'items.product': productId,
            orderStatus: 'delivered'
        });

        if (!order) {
            return res.status(403).json({
                success: false,
                message: 'You can only review products you have purchased'
            });
        }

        const existingReview = await Review.findOne({
            product: productId,
            user: req.user!._id
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        let images: string[] = [];
        let videos: string[] = [];
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (files?.images) {
            const uploadPromises = files.images.map(file => uploadToGridFS(file));
            images = await Promise.all(uploadPromises);
        }

        if (files?.videos) {
            const uploadPromises = files.videos.map(file => uploadToGridFS(file));
            videos = await Promise.all(uploadPromises);
        }

        const review = await Review.create({
            product: productId,
            user: req.user!._id,
            order: orderId,
            rating: Number(rating),
            comment,
            images,
            videos,
            verified: true
        });

        await review.populate('user', 'name email');

        res.status(201).json({
            success: true,
            data: review,
            message: 'Review submitted successfully and pending approval'
        });
    } catch (error: any) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating review'
        });
    }
});

// Get all approved reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '10', sort = '-createdAt', rating } = req.query;
        const productId = req.params.productId;

        const query: any = {
            product: productId,
            status: 'approved'
        };

        if (rating) {
            query.rating = parseInt(rating as string);
        }

        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);

        const reviews = await Review.find(query)
            .populate('user', 'name')
            .sort(sort as string)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .lean();

        const total = await Review.countDocuments(query);

        const ratingStats = await Review.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingStats.forEach(stat => {
            distribution[stat._id] = stat.count;
        });

        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            },
            ratingDistribution: distribution,
            averageRating: Math.round(avgRating * 10) / 10
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
});

// Check if user can review a product
router.get('/can-review/:productId', auth, async (req: Request, res: Response) => {
    try {
        const order = await Order.findOne({
            user: req.user!._id,
            'items.product': req.params.productId,
            orderStatus: 'delivered'
        });

        if (!order) {
            return res.json({
                success: true,
                canReview: false,
                message: 'You can only review products from delivered orders'
            });
        }

        const existingReview = await Review.findOne({
            product: req.params.productId,
            user: req.user!._id
        });

        if (existingReview) {
            return res.json({
                success: true,
                canReview: false,
                message: 'You have already reviewed this product',
                review: existingReview
            });
        }

        res.json({
            success: true,
            canReview: true,
            orderId: order._id
        });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking review eligibility'
        });
    }
});

// Mark review as helpful
router.put('/:id/helpful', auth, async (req: Request, res: Response) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const userId = req.user!._id;
        const index = review.helpful.indexOf(userId);

        if (index > -1) {
            review.helpful.splice(index, 1);
        } else {
            review.helpful.push(userId);
        }

        await review.save();

        res.json({
            success: true,
            helpfulCount: review.helpful.length
        });
    } catch (error) {
        console.error('Error updating helpful:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating helpful status'
        });
    }
});

// Get current user's reviews
router.get('/my-reviews', auth, async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find({ user: req.user!._id })
            .populate('product', 'name images')
            .sort('-createdAt');

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
});

// Update user's own review
router.put('/:id', auth, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
]), async (req: Request, res: Response) => {
    try {
        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user!._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const { rating, title, comment } = req.body;

        if (rating) review.rating = Number(rating);
        if (title) (review as any).title = title;
        if (comment) review.comment = comment;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (files?.images) {
            const uploadPromises = files.images.map(file => uploadToGridFS(file));
            const newImages = await Promise.all(uploadPromises);
            review.images = [...review.images, ...newImages];
        }

        if (files?.videos) {
            const uploadPromises = files.videos.map(file => uploadToGridFS(file));
            const newVideos = await Promise.all(uploadPromises);
            review.videos = [...review.videos, ...newVideos];
        }

        review.status = 'pending';

        await review.save();

        res.json({
            success: true,
            data: review,
            message: 'Review updated successfully'
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review'
        });
    }
});

// Delete user's own review
router.delete('/:id', auth, async (req: Request, res: Response) => {
    try {
        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user!._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.deleteOne();

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review'
        });
    }
});

export default router;
