import crypto from 'crypto';
import { Request, Response } from 'express';
import { logger } from '@/lib/logger';

/**
 * Payment webhook verification and idempotency utilities
 */

const processedWebhooks = new Map<string, number>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

// Clean up old idempotency records
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of processedWebhooks.entries()) {
        if (now - timestamp > IDEMPOTENCY_TTL) {
            processedWebhooks.delete(key);
        }
    }
}, 60 * 60 * 1000);

export const isWebhookProcessed = (eventId: string): boolean => {
    return processedWebhooks.has(eventId);
};

export const markWebhookProcessed = (eventId: string): void => {
    processedWebhooks.set(eventId, Date.now());
};

export const verifyStripeWebhook = (payload: string, signature: string, secret: string): any | null => {
    try {
        const elements = signature.split(',');
        const signatureElements: Record<string, string> = {};
        elements.forEach((element) => {
            const [key, value] = element.split('=');
            if (key && value) {
                signatureElements[key] = value;
            }
        });

        const timestamp = signatureElements.t;
        const expectedSignature = signatureElements.v1;

        if (!timestamp || !expectedSignature) {
            logger.warn('Invalid Stripe webhook signature format');
            return null;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
            logger.warn('Stripe webhook timestamp too old');
            return null;
        }

        const signedPayload = `${timestamp}.${payload}`;
        const computedSignature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(expectedSignature))) {
            logger.warn('Stripe webhook signature mismatch');
            return null;
        }

        return JSON.parse(payload);
    } catch (error) {
        logger.error('Stripe webhook verification error:', error as Error);
        return null;
    }
};

export const verifyPayPalWebhook = async (headers: Record<string, string>, _body: string, _webhookId: string): Promise<boolean> => {
    try {
        const transmissionId = headers['paypal-transmission-id'];
        const transmissionTime = headers['paypal-transmission-time'];
        const certUrl = headers['paypal-cert-url'];
        const authAlgo = headers['paypal-auth-algo'];
        const transmissionSig = headers['paypal-transmission-sig'];

        if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
            logger.warn('Missing PayPal webhook headers');
            return false;
        }

        if (!certUrl.startsWith('https://api.paypal.com/') && !certUrl.startsWith('https://api.sandbox.paypal.com/')) {
            logger.warn('Invalid PayPal certificate URL');
            return false;
        }

        return true;
    } catch (error) {
        logger.error('PayPal webhook verification error:', error as Error);
        return false;
    }
};

export const verifyHmacSignature = (payload: string, signature: string, secret: string, algorithm = 'sha256'): boolean => {
    try {
        const computedSignature = crypto.createHmac(algorithm, secret).update(payload).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(signature));
    } catch (error) {
        logger.error('HMAC signature verification error:', error as Error);
        return false;
    }
};

export const verifyBkashWebhook = (payload: any, signature: string, secret: string): boolean => {
    try {
        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
        return verifyHmacSignature(payloadString, signature, secret, 'sha256');
    } catch (error) {
        logger.error('bKash webhook verification error:', error as Error);
        return false;
    }
};

export const createWebhookHandler = (
    provider: string,
    verifyFn: (req: Request) => Promise<boolean>,
    handler: (event: any, req: Request, res: Response) => Promise<void>
) => {
    return async (req: Request, res: Response): Promise<void> => {
        try {
            const isValid = await verifyFn(req);
            if (!isValid) {
                logger.warn(`${provider} webhook signature verification failed`);
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }

            const event = req.body;
            const eventId = event.id || event.event_id || event.transactionId;

            if (eventId && isWebhookProcessed(eventId)) {
                logger.info(`${provider} webhook already processed: ${eventId}`);
                res.status(200).json({ received: true, duplicate: true });
                return;
            }

            await handler(event, req, res);

            if (eventId) {
                markWebhookProcessed(eventId);
            }
        } catch (error) {
            logger.error(`${provider} webhook error:`, error as Error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    };
};
