import { Router, Request, Response } from 'express';
import PromoCode from '@/modules/promoCodes/model';
import { adminAuth } from '@/middleware/auth';

const router = Router();

// Validate promo code (public)
router.post('/validate', async (req: Request, res: Response) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Promo code is required' });
        }

        const promoCode = await PromoCode.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!promoCode) {
            return res.status(404).json({ message: 'Invalid promo code' });
        }

        const now = new Date();
        if (now < promoCode.validFrom) {
            return res.status(400).json({ message: 'Promo code is not yet active' });
        }
        if (now > promoCode.validUntil) {
            return res.status(400).json({ message: 'Promo code has expired' });
        }

        if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
            return res.status(400).json({ message: 'Promo code usage limit reached' });
        }

        if (cartTotal < promoCode.minOrderAmount) {
            return res.status(400).json({
                message: `Minimum order amount of BDT ${promoCode.minOrderAmount} required`
            });
        }

        let discountAmount = 0;
        if (promoCode.discountType === 'percentage') {
            discountAmount = (cartTotal * promoCode.discountValue) / 100;

            if (promoCode.maxDiscountAmount && discountAmount > promoCode.maxDiscountAmount) {
                discountAmount = promoCode.maxDiscountAmount;
            }
        } else {
            discountAmount = promoCode.discountValue;
        }

        discountAmount = Math.min(discountAmount, cartTotal);

        res.json({
            valid: true,
            promoCode: {
                code: promoCode.code,
                description: promoCode.description,
                discountType: promoCode.discountType,
                discountValue: promoCode.discountValue,
                discountAmount: parseFloat(discountAmount.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error validating promo code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all promo codes (admin only)
router.get('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const promoCodes = await PromoCode.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(promoCodes);
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single promo code (admin only)
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('applicableCategories', 'name')
            .populate('applicableProducts', 'name');

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        res.json(promoCode);
    } catch (error) {
        console.error('Error fetching promo code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create promo code (admin only)
router.post('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const promoCodeData = {
            ...req.body,
            code: req.body.code.toUpperCase(),
            createdBy: req.user!._id
        };

        const promoCode = new PromoCode(promoCodeData);
        await promoCode.save();

        res.status(201).json(promoCode);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Promo code already exists' });
        }
        console.error('Error creating promo code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update promo code (admin only)
router.put('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const updateData = { ...req.body };
        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase();
        }

        const promoCode = await PromoCode.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        res.json(promoCode);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Promo code already exists' });
        }
        console.error('Error updating promo code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete promo code (admin only)
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const promoCode = await PromoCode.findByIdAndDelete(req.params.id);

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        res.json({ message: 'Promo code deleted successfully' });
    } catch (error) {
        console.error('Error deleting promo code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Increment usage count (used when order is placed)
router.post('/:id/use', async (req: Request, res: Response) => {
    try {
        const promoCode = await PromoCode.findByIdAndUpdate(
            req.params.id,
            { $inc: { usedCount: 1 } },
            { new: true }
        );

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        res.json(promoCode);
    } catch (error) {
        console.error('Error updating promo code usage:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
