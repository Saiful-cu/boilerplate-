import { Router, Request, Response } from 'express';
import Order from '@/modules/orders/model';
import Product from '@/modules/products/model';
import { bkashService } from '@/modules/bkash/service';
import { config } from '@/config';
import { auth } from '@/middleware/auth';
import logger from '@/utils/logger';

const router = Router();

// ─── Helper: Restore stock for a failed/cancelled order ───
async function restoreStock(order: any): Promise<void> {
    try {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity },
            });
        }
        logger.info('[bKash] Stock restored for order', { orderId: order._id });
    } catch (err: any) {
        logger.error('[bKash] Stock restoration FAILED', {
            orderId: order._id,
            error: err.message,
        });
    }
}

/**
 * POST /api/bkash/create-payment
 * Create (or re-create) a bKash payment session for an existing order.
 * Supports retry — if the order already had a failed/cancelled payment,
 * allows creating a new bKash session.
 */
router.post('/create-payment', auth, async (req: Request, res: Response) => {
    try {
        if (!bkashService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'bKash payment is not configured. Please contact support.',
            });
        }

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required',
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Verify the order belongs to the user
        if (order.user.toString() !== req.user!._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        // Allow retry only for pending, failed, or cancelled payment statuses
        if (!['pending', 'failed', 'cancelled'].includes(order.paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: `Order payment is already ${order.paymentStatus}`,
            });
        }

        if (order.paymentMethod !== 'bkash') {
            return res.status(400).json({
                success: false,
                message: 'This order is not a bKash payment order',
            });
        }

        // Prevent already-executed orders from creating new sessions
        if (order.bkashExecuted) {
            return res.status(400).json({
                success: false,
                message: 'This order has already been paid via bKash',
            });
        }

        logger.info('[bKash] Creating payment session', {
            orderId: order._id,
            amount: order.totalAmount,
            attempt: (order.paymentAttempts || 0) + 1,
        });

        // Create bKash payment
        const bkashResponse = await bkashService.createPayment(
            order.totalAmount,
            order._id.toString(),
            req.user!._id.toString()
        );

        // Store bKash paymentID and full create response on the order
        order.bkashPaymentID = bkashResponse.paymentID;
        order.bkashExecuted = false;
        order.paymentStatus = 'pending';
        order.paymentAttempts = (order.paymentAttempts || 0) + 1;
        order.paymentDetails = {
            ...order.paymentDetails,
            paymentID: bkashResponse.paymentID,
            amount: parseFloat(bkashResponse.amount),
            paymentCreateTime: bkashResponse.paymentCreateTime,
            createResponse: bkashResponse,
        };
        await order.save();

        res.json({
            success: true,
            paymentID: bkashResponse.paymentID,
            bkashURL: bkashResponse.bkashURL,
            amount: bkashResponse.amount,
        });
    } catch (error: any) {
        logger.error('[bKash] create-payment route error', {
            error: error.message,
            orderId: req.body?.orderId,
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create bKash payment',
        });
    }
});

/**
 * GET /api/bkash/callback
 * bKash redirects the user here after payment completion/failure/cancellation.
 *
 * Security:
 * - Idempotency: checks bkashExecuted flag before executing
 * - Amount validation: verifies executed amount matches order total
 * - Stock restoration: restores stock on cancel/failure
 * - Full response storage: stores complete API responses
 */
router.get('/callback', async (req: Request, res: Response) => {
    const { paymentID, status } = req.query;
    const frontendUrl = config.frontendUrl;

    logger.info('[bKash] Callback received', { paymentID, status });

    if (!paymentID) {
        return res.redirect(
            `${frontendUrl}/checkout/bkash-result?status=error&message=Missing payment ID`
        );
    }

    try {
        // Find the order with this bKash paymentID
        const order = await Order.findOne({ bkashPaymentID: paymentID as string });

        if (!order) {
            logger.error('[bKash] Callback: order not found', { paymentID });
            return res.redirect(
                `${frontendUrl}/checkout/bkash-result?status=error&message=Order not found`
            );
        }

        // ── SUCCESS ──
        if (status === 'success') {
            // ── IDEMPOTENCY CHECK ──
            // If we already executed this payment, skip re-execution
            if (order.bkashExecuted && order.paymentStatus === 'completed') {
                logger.warn('[bKash] Duplicate callback — already executed', {
                    orderId: order._id,
                    paymentID,
                    trxID: order.paymentDetails?.trxID,
                });
                return res.redirect(
                    `${frontendUrl}/checkout/bkash-result?status=success&orderId=${order._id}&trxID=${order.paymentDetails?.trxID || ''}`
                );
            }

            try {
                const executeResult = await bkashService.executePayment(
                    paymentID as string
                );

                if (
                    executeResult.transactionStatus === 'Completed' &&
                    executeResult.statusCode === '0000'
                ) {
                    // ── AMOUNT VALIDATION ──
                    const paidAmount = parseFloat(executeResult.amount);
                    const expectedAmount = order.totalAmount;
                    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
                        logger.error('[bKash] AMOUNT MISMATCH', {
                            orderId: order._id,
                            paymentID,
                            trxID: executeResult.trxID,
                            paidAmount,
                            expectedAmount,
                        });
                        // Still mark as completed but flag for admin review
                        order.statusHistory.push({
                            status: order.orderStatus,
                            timestamp: new Date(),
                            note: `WARNING: Amount mismatch! Paid ৳${paidAmount}, Expected ৳${expectedAmount}`,
                        });
                    }

                    // ── Mark as completed ──
                    order.paymentStatus = 'completed';
                    order.orderStatus = 'processing';
                    order.bkashExecuted = true;
                    order.paymentDetails = {
                        ...order.paymentDetails,
                        paymentID: executeResult.paymentID,
                        trxID: executeResult.trxID,
                        amount: paidAmount,
                        currency: executeResult.currency,
                        customerMsisdn: executeResult.customerMsisdn,
                        payerReference: executeResult.payerReference,
                        merchantInvoiceNumber: executeResult.merchantInvoiceNumber,
                        paymentExecuteTime: executeResult.paymentExecuteTime,
                        transactionStatus: executeResult.transactionStatus,
                        paidAt: new Date(),
                        executeResponse: executeResult,
                    };
                    order.statusHistory.push({
                        status: 'processing',
                        timestamp: new Date(),
                        note: `bKash payment confirmed. TrxID: ${executeResult.trxID}, Amount: ৳${paidAmount}`,
                    });
                    await order.save();

                    logger.info('[bKash] Payment COMPLETED', {
                        orderId: order._id,
                        trxID: executeResult.trxID,
                        amount: paidAmount,
                    });

                    return res.redirect(
                        `${frontendUrl}/checkout/bkash-result?status=success&orderId=${order._id}&trxID=${executeResult.trxID}&amount=${paidAmount}`
                    );
                } else {
                    // Execution returned but not completed
                    order.paymentStatus = 'failed';
                    order.paymentDetails = {
                        ...order.paymentDetails,
                        failureReason:
                            executeResult.statusMessage || 'Payment execution failed',
                        failedAt: new Date(),
                        transactionStatus: executeResult.transactionStatus,
                        executeResponse: executeResult,
                    };
                    order.statusHistory.push({
                        status: order.orderStatus,
                        timestamp: new Date(),
                        note: `bKash payment failed: ${executeResult.statusMessage} (status: ${executeResult.transactionStatus})`,
                    });
                    await order.save();

                    // Restore stock on failure
                    await restoreStock(order);

                    logger.warn('[bKash] Payment execution NOT completed', {
                        orderId: order._id,
                        statusCode: executeResult.statusCode,
                        transactionStatus: executeResult.transactionStatus,
                    });

                    return res.redirect(
                        `${frontendUrl}/checkout/bkash-result?status=failed&orderId=${order._id}&message=${encodeURIComponent(executeResult.statusMessage || 'Payment not completed')}`
                    );
                }
            } catch (executeError: any) {
                logger.error('[bKash] Execute payment ERROR', {
                    error: executeError.message,
                    orderId: order._id,
                    paymentID,
                });

                // Before marking as failed, query bKash to check actual state
                // (the execute call may have succeeded but we lost the response)
                try {
                    const queryResult = await bkashService.queryPayment(
                        paymentID as string
                    );
                    if (queryResult.transactionStatus === 'Completed') {
                        logger.info(
                            '[bKash] Query reveals payment IS completed despite execute error',
                            {
                                orderId: order._id,
                                trxID: queryResult.trxID,
                            }
                        );
                        order.paymentStatus = 'completed';
                        order.orderStatus = 'processing';
                        order.bkashExecuted = true;
                        order.paymentDetails = {
                            ...order.paymentDetails,
                            paymentID: queryResult.paymentID,
                            trxID: queryResult.trxID,
                            amount: parseFloat(queryResult.amount),
                            transactionStatus: queryResult.transactionStatus,
                            paidAt: new Date(),
                            queryResponse: queryResult,
                        };
                        order.statusHistory.push({
                            status: 'processing',
                            timestamp: new Date(),
                            note: `bKash payment confirmed via query fallback. TrxID: ${queryResult.trxID}`,
                        });
                        await order.save();

                        return res.redirect(
                            `${frontendUrl}/checkout/bkash-result?status=success&orderId=${order._id}&trxID=${queryResult.trxID}&amount=${queryResult.amount}`
                        );
                    }
                } catch (queryError: any) {
                    logger.error('[bKash] Query fallback also failed', {
                        error: queryError.message,
                    });
                }

                order.paymentStatus = 'failed';
                order.paymentDetails = {
                    ...order.paymentDetails,
                    failureReason: executeError.message,
                    failedAt: new Date(),
                };
                order.statusHistory.push({
                    status: order.orderStatus,
                    timestamp: new Date(),
                    note: `bKash payment execution error: ${executeError.message}`,
                });
                await order.save();

                await restoreStock(order);

                return res.redirect(
                    `${frontendUrl}/checkout/bkash-result?status=failed&orderId=${order._id}&message=${encodeURIComponent('Payment execution failed')}`
                );
            }
        }

        // ── CANCEL ──
        if (status === 'cancel') {
            order.paymentStatus = 'cancelled';
            order.paymentDetails = {
                ...order.paymentDetails,
                failureReason: 'Payment cancelled by user',
                failedAt: new Date(),
                transactionStatus: 'Cancelled',
            };
            order.statusHistory.push({
                status: order.orderStatus,
                timestamp: new Date(),
                note: 'bKash payment cancelled by user',
            });
            await order.save();

            // Restore stock on cancel
            await restoreStock(order);

            logger.info('[bKash] Payment CANCELLED by user', { orderId: order._id });

            return res.redirect(
                `${frontendUrl}/checkout/bkash-result?status=cancelled&orderId=${order._id}`
            );
        }

        // ── FAILURE (any other status) ──
        order.paymentStatus = 'failed';
        order.paymentDetails = {
            ...order.paymentDetails,
            failureReason: `Payment ${status}`,
            failedAt: new Date(),
            transactionStatus: String(status),
        };
        order.statusHistory.push({
            status: order.orderStatus,
            timestamp: new Date(),
            note: `bKash payment failed with status: ${status}`,
        });
        await order.save();

        // Restore stock on failure
        await restoreStock(order);

        logger.info('[bKash] Payment FAILED', { orderId: order._id, status });

        return res.redirect(
            `${frontendUrl}/checkout/bkash-result?status=failed&orderId=${order._id}&message=${encodeURIComponent(`Payment ${status}`)}`
        );
    } catch (error: any) {
        logger.error('[bKash] Callback processing ERROR', {
            error: error.message,
            paymentID,
            status,
        });
        return res.redirect(
            `${frontendUrl}/checkout/bkash-result?status=error&message=${encodeURIComponent('An unexpected error occurred')}`
        );
    }
});

/**
 * GET /api/bkash/payment-status/:orderId
 * Query bKash payment status for an order.
 * Also verifies server-side payment state.
 */
router.get('/payment-status/:orderId', auth, async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Verify ownership or admin
        if (
            order.user.toString() !== req.user!._id.toString() &&
            req.user!.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        if (!order.bkashPaymentID) {
            return res.json({
                success: true,
                paymentStatus: order.paymentStatus,
                paymentDetails: order.paymentDetails,
            });
        }

        // Query bKash for latest status
        const bkashStatus = await bkashService.queryPayment(order.bkashPaymentID);

        // Store query response
        if (order.paymentDetails) {
            order.paymentDetails.queryResponse = bkashStatus;
            order.markModified('paymentDetails');
            await order.save();
        }

        res.json({
            success: true,
            paymentStatus: order.paymentStatus,
            bkashStatus: bkashStatus.transactionStatus,
            paymentDetails: order.paymentDetails,
            bkashDetails: {
                paymentID: bkashStatus.paymentID,
                trxID: bkashStatus.trxID,
                amount: bkashStatus.amount,
                completedTime: bkashStatus.completedTime,
            },
        });
    } catch (error: any) {
        logger.error('[bKash] payment-status route error', {
            error: error.message,
            orderId: req.params.orderId,
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to query payment status',
        });
    }
});

/**
 * POST /api/bkash/refund
 * Refund a bKash payment (admin only)
 */
router.post('/refund', auth, async (req: Request, res: Response) => {
    try {
        if (req.user!.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required',
            });
        }

        const { orderId, amount, reason } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (!order.bkashPaymentID || !order.paymentDetails?.trxID) {
            return res.status(400).json({
                success: false,
                message: 'No bKash payment found for this order',
            });
        }

        if (order.paymentStatus !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only refund completed payments',
            });
        }

        const refundAmount = amount || order.totalAmount;

        logger.info('[bKash] Refund initiated', {
            orderId: order._id,
            paymentID: order.bkashPaymentID,
            trxID: order.paymentDetails.trxID,
            refundAmount,
            reason,
            admin: req.user!._id,
        });

        const refundResult = await bkashService.refundPayment(
            order.bkashPaymentID,
            order.paymentDetails.trxID,
            refundAmount,
            reason || 'Admin initiated refund'
        );

        order.paymentStatus = 'refunded';
        order.paymentDetails.refundResponse = refundResult;
        order.markModified('paymentDetails');
        order.statusHistory.push({
            status: order.orderStatus,
            timestamp: new Date(),
            note: `bKash refund processed. RefundTrxID: ${refundResult.refundTrxID}, Amount: ৳${refundAmount}`,
        });
        await order.save();

        // Restore stock on refund
        await restoreStock(order);

        res.json({
            success: true,
            message: 'Refund processed successfully',
            refundTrxID: refundResult.refundTrxID,
            amount: refundAmount,
        });
    } catch (error: any) {
        logger.error('[bKash] refund route error', {
            error: error.message,
            orderId: req.body?.orderId,
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process refund',
        });
    }
});

export default router;
