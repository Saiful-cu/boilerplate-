import { Router, Request, Response } from 'express';
import Review from '@/modules/reviews/model';
import { adminAuth } from '@/middleware/auth';

const router = Router();

// Get all reviews (admin)
router.get('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', status, rating, search } = req.query;

        const query: any = {};

        if (status) query.status = status;
        if (rating) query.rating = Number(rating);
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { comment: { $regex: search, $options: 'i' } }
            ];
        }

        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);

        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .populate('product', 'name images')
            .sort('-createdAt')
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await Review.countDocuments(query);

        const statusCounts = await Review.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            },
            statusCounts: statusCounts.reduce((acc: Record<string, number>, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
});

// Update review status (approve/reject)
router.put('/:id/status', adminAuth, async (req: Request, res: Response) => {
    try {
        const { status, adminResponse } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { status, adminResponse },
            { new: true }
        ).populate('user', 'name email')
            .populate('product', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            data: review,
            message: `Review ${status} successfully`
        });
    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review status'
        });
    }
});

// Delete review (admin)
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const review = await Review.findById(req.params.id);

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

// Add admin response to review
router.put('/:id/respond', adminAuth, async (req: Request, res: Response) => {
    try {
        const { adminResponse } = req.body;

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { adminResponse },
            { new: true }
        ).populate('user', 'name email')
            .populate('product', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            data: review,
            message: 'Response added successfully'
        });
    } catch (error) {
        console.error('Error adding response:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding response'
        });
    }
});

export default router;
