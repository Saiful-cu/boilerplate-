import { Router, Request, Response } from 'express';
import express from 'express';
import Order from '@/modules/orders/model';
import Product from '@/modules/products/model';
import { bkashService } from '@/modules/bkash/service';
import logger from '@/utils/logger';
import {
    verifyStripeWebhook,
    verifyHmacSignature,
    verifyBkashWebhook,
    isWebhookProcessed,
    markWebhookProcessed
} from '@/utils/webhookVerification';

const router = Router();

// Stripe webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        logger.error('STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const event = verifyStripeWebhook(req.body.toString(), signature, webhookSecret);

    if (!event) {
        logger.warn('Stripe webhook signature verification failed');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    if (isWebhookProcessed(event.id)) {
        logger.info(`Stripe webhook already processed: ${event.id}`);
        return res.status(200).json({ received: true, duplicate: true });
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            case 'charge.refunded':
                await handleRefund(event.data.object);
                break;

            case 'charge.dispute.created':
                await handleDispute(event.data.object);
                break;

            default:
                logger.info(`Unhandled Stripe event type: ${event.type}`);
        }

        markWebhookProcessed(event.id);

        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Stripe webhook processing error:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
});

// Generic payment webhook (for other providers like bKash, SSL Commerz, etc.)
router.post('/payment-callback', express.json(), async (req: Request, res: Response) => {
    const signature = (req.headers['x-webhook-signature'] || req.headers['x-signature']) as string;
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
        const isValid = verifyHmacSignature(
            JSON.stringify(req.body),
            signature,
            webhookSecret
        );

        if (!isValid) {
            logger.warn('Payment webhook signature verification failed');
            return res.status(401).json({ error: 'Invalid signature' });
        }
    }

    const { transactionId, orderId, status, amount } = req.body;

    if (transactionId && isWebhookProcessed(transactionId)) {
        logger.info(`Payment webhook already processed: ${transactionId}`);
        return res.status(200).json({ received: true, duplicate: true });
    }

    try {
        if (status === 'completed' || status === 'success') {
            await handlePaymentSuccess({
                metadata: { orderId },
                id: transactionId,
                amount_received: amount
            });
        } else if (status === 'failed') {
            await handlePaymentFailed({
                metadata: { orderId },
                id: transactionId,
                last_payment_error: { message: req.body.errorMessage }
            });
        }

        if (transactionId) {
            markWebhookProcessed(transactionId);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Payment webhook processing error:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
});

/**
 * POST /webhooks/bkash
 * Dedicated bKash IPN (Instant Payment Notification) webhook.
 * bKash may send server-to-server notifications for payment status changes.
 * This provides additional verification beyond the redirect callback.
 */
router.post('/bkash', express.json(), async (req: Request, res: Response) => {
    const signature = req.headers['x-bkash-signature'] as string;
    const webhookSecret = process.env.BKASH_WEBHOOK_SECRET;

    logger.info('[bKash Webhook] Received', {
        hasSignature: !!signature,
        body: req.body,
    });

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
        const isValid = verifyBkashWebhook(req.body, signature, webhookSecret);
        if (!isValid) {
            logger.warn('[bKash Webhook] Signature verification failed');
            return res.status(401).json({ error: 'Invalid signature' });
        }
    }

    const { paymentID, trxID, transactionStatus, amount } = req.body;

    if (!paymentID) {
        logger.warn('[bKash Webhook] Missing paymentID');
        return res.status(400).json({ error: 'Missing paymentID' });
    }

    // Idempotency check
    const eventKey = `bkash_${paymentID}_${transactionStatus}`;
    if (isWebhookProcessed(eventKey)) {
        logger.info('[bKash Webhook] Already processed', { eventKey });
        return res.status(200).json({ received: true, duplicate: true });
    }

    try {
        const order = await Order.findOne({ bkashPaymentID: paymentID });

        if (!order) {
            logger.error('[bKash Webhook] Order not found', { paymentID });
            return res.status(404).json({ error: 'Order not found' });
        }

        logger.info('[bKash Webhook] Processing', {
            orderId: order._id,
            paymentID,
            transactionStatus,
            currentPaymentStatus: order.paymentStatus,
        });

        if (transactionStatus === 'Completed') {
            // Double-check via query API for extra security
            let verifiedStatus = transactionStatus;
            try {
                const queryResult = await bkashService.queryPayment(paymentID);
                verifiedStatus = queryResult.transactionStatus;

                // Store query result
                if (order.paymentDetails) {
                    order.paymentDetails.queryResponse = queryResult;
                    order.markModified('paymentDetails');
                }

                // Amount validation
                const paidAmount = parseFloat(queryResult.amount || amount);
                if (Math.abs(paidAmount - order.totalAmount) > 0.01) {
                    logger.error('[bKash Webhook] AMOUNT MISMATCH', {
                        orderId: order._id,
                        paidAmount,
                        expectedAmount: order.totalAmount,
                    });
                    order.statusHistory.push({
                        status: order.orderStatus,
                        timestamp: new Date(),
                        note: `WEBHOOK WARNING: Amount mismatch! Paid ৳${paidAmount}, Expected ৳${order.totalAmount}`,
                    });
                }
            } catch (queryErr: any) {
                logger.warn('[bKash Webhook] Query verification failed, using webhook data', {
                    error: queryErr.message,
                });
            }

            if (verifiedStatus === 'Completed' && order.paymentStatus !== 'completed') {
                order.paymentStatus = 'completed';
                order.orderStatus = 'processing';
                order.bkashExecuted = true;
                if (order.paymentDetails) {
                    order.paymentDetails.trxID = trxID || order.paymentDetails.trxID;
                    order.paymentDetails.amount = parseFloat(amount) || order.paymentDetails.amount;
                    order.paymentDetails.transactionStatus = 'Completed';
                    order.paymentDetails.paidAt = order.paymentDetails.paidAt || new Date();
                    order.markModified('paymentDetails');
                }
                order.statusHistory.push({
                    status: 'processing',
                    timestamp: new Date(),
                    note: `Payment confirmed via bKash webhook. TrxID: ${trxID || 'N/A'}`,
                });
                await order.save();

                logger.info('[bKash Webhook] Payment confirmed', {
                    orderId: order._id,
                    trxID,
                });
            } else {
                logger.info('[bKash Webhook] Order already in correct state', {
                    orderId: order._id,
                    paymentStatus: order.paymentStatus,
                });
            }
        } else if (transactionStatus === 'Cancelled' || transactionStatus === 'Failed') {
            if (['pending', 'failed'].includes(order.paymentStatus)) {
                order.paymentStatus = transactionStatus === 'Cancelled' ? 'cancelled' : 'failed';
                if (order.paymentDetails) {
                    order.paymentDetails.failureReason = `${transactionStatus} via webhook`;
                    order.paymentDetails.failedAt = new Date();
                    order.paymentDetails.transactionStatus = transactionStatus;
                    order.markModified('paymentDetails');
                }
                order.statusHistory.push({
                    status: order.orderStatus,
                    timestamp: new Date(),
                    note: `bKash webhook: payment ${transactionStatus.toLowerCase()}`,
                });
                await order.save();

                // Restore stock
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity },
                    });
                }

                logger.info('[bKash Webhook] Payment failed/cancelled, stock restored', {
                    orderId: order._id,
                    transactionStatus,
                });
            }
        }

        markWebhookProcessed(eventKey);
        res.status(200).json({ received: true });
    } catch (error: any) {
        logger.error('[bKash Webhook] Processing error', {
            error: error.message,
            paymentID,
        });
        res.status(500).json({ error: 'Processing failed' });
    }
});

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: any): Promise<void> {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
        logger.warn('Payment success webhook missing orderId');
        return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
        logger.error(`Order not found for payment: ${orderId}`);
        return;
    }

    if (order.paymentStatus === 'pending') {
        order.paymentStatus = 'completed';
        order.orderStatus = 'processing';
        (order as any).paymentDetails = {
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount_received / 100,
            paidAt: new Date()
        };
        order.statusHistory.push({
            status: 'processing',
            timestamp: new Date(),
            note: 'Payment confirmed via webhook'
        });

        await order.save();
        logger.info(`Order ${orderId} payment confirmed`);
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: any): Promise<void> {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
        logger.warn('Payment failed webhook missing orderId');
        return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
        logger.error(`Order not found for failed payment: ${orderId}`);
        return;
    }

    if (order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed';
        (order as any).paymentDetails = {
            transactionId: paymentIntent.id,
            failureReason: paymentIntent.last_payment_error?.message,
            failedAt: new Date()
        };
        order.statusHistory.push({
            status: order.orderStatus,
            timestamp: new Date(),
            note: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`
        });

        await order.save();
        logger.info(`Order ${orderId} payment failed`);
    }
}

/**
 * Handle refund
 */
async function handleRefund(charge: any): Promise<void> {
    const orderId = charge.metadata?.orderId;

    if (!orderId) {
        logger.warn('Refund webhook missing orderId');
        return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
        logger.error(`Order not found for refund: ${orderId}`);
        return;
    }

    order.paymentStatus = 'refunded';
    order.statusHistory.push({
        status: order.orderStatus,
        timestamp: new Date(),
        note: `Refund processed: ${charge.amount_refunded / 100}`
    });

    await order.save();
    logger.info(`Order ${orderId} refunded`);
}

/**
 * Handle dispute/chargeback
 */
async function handleDispute(dispute: any): Promise<void> {
    const orderId = dispute.metadata?.orderId;
    logger.warn(`Payment dispute created for order: ${orderId || 'unknown'}`);
}

export default router;
