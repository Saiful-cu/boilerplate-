import { Router, Request, Response } from 'express';
import Order from '@/modules/orders/model';
import Product from '@/modules/products/model';
import { auth } from '@/middleware/auth';
import { bkashService } from '@/modules/bkash/service';
import logger from '@/utils/logger';

const router = Router();

// Get user orders
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.user!._id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json({ data: orders });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single order
router.get('/:id', auth, async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create order
router.post('/', auth, async (req: Request, res: Response) => {
    try {
        const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;

        // Server-side shipping zone detection from city
        const city = (shippingAddress?.city || '').trim().toLowerCase();
        const dhakaKeywords = ['dhaka', 'ঢাকা'];
        const isInsideDhaka = dhakaKeywords.some((kw) => city.includes(kw));
        const resolvedMethod = isInsideDhaka ? 'inside_dhaka' : 'outside_dhaka';
        const resolvedShippingCost = isInsideDhaka ? 70 : 130;

        let totalAmount = 0;
        const orderItems: any[] = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                });
            }

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            totalAmount += product.price * item.quantity;

            // Deduct stock immediately (will be restored on bKash cancel/failure)
            product.stock -= item.quantity;
            await product.save();
        }

        const finalTotal = totalAmount + resolvedShippingCost;

        const order = new Order({
            user: req.user!._id,
            items: orderItems,
            totalAmount: finalTotal,
            shippingAddress,
            shippingMethod: resolvedMethod,
            shippingCost: resolvedShippingCost,
            paymentMethod,
            paymentAttempts: 0,
        });

        await order.save();
        await order.populate('items.product');

        logger.info('[Order] Created', {
            orderId: order._id,
            userId: req.user!._id,
            paymentMethod,
            totalAmount: finalTotal,
        });

        // If bKash, automatically initiate bKash payment and return bKash URL
        if (paymentMethod === 'bkash') {
            if (!bkashService.isConfigured()) {
                return res.status(201).json({
                    ...order.toJSON(),
                    requiresBkashPayment: true,
                    bkashConfigured: false,
                    message: 'Order created. bKash gateway not configured — contact support.',
                });
            }

            try {
                const bkashResponse = await bkashService.createPayment(
                    order.totalAmount,
                    order._id.toString(),
                    req.user!._id.toString()
                );

                order.bkashPaymentID = bkashResponse.paymentID;
                order.paymentAttempts = 1;
                order.paymentDetails = {
                    paymentID: bkashResponse.paymentID,
                    amount: parseFloat(bkashResponse.amount),
                    paymentCreateTime: bkashResponse.paymentCreateTime,
                    createResponse: bkashResponse,
                };
                await order.save();

                logger.info('[Order] bKash payment initiated', {
                    orderId: order._id,
                    paymentID: bkashResponse.paymentID,
                });

                return res.status(201).json({
                    ...order.toJSON(),
                    requiresBkashPayment: true,
                    bkashConfigured: true,
                    bkashURL: bkashResponse.bkashURL,
                    bkashPaymentID: bkashResponse.paymentID,
                });
            } catch (bkashError: any) {
                logger.error('[Order] bKash payment initiation failed', {
                    orderId: order._id,
                    error: bkashError.message,
                });
                // Order is created but bKash failed — user can retry via /bkash/create-payment
                return res.status(201).json({
                    ...order.toJSON(),
                    requiresBkashPayment: true,
                    bkashConfigured: true,
                    bkashError: bkashError.message || 'Failed to initiate bKash payment',
                    message: 'Order created but bKash payment initiation failed. You can retry from your orders.',
                });
            }
        }

        res.status(201).json(order);
    } catch (error: any) {
        logger.error('[Order] Creation failed', { error: error.message });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
