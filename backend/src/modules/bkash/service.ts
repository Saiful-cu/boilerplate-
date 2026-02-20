import axios, { AxiosInstance } from 'axios';
import { config } from '@/config';
import logger from '@/utils/logger';

/**
 * bKash Payment Gateway (Tokenized Checkout) Service
 *
 * Production-ready implementation following bKash official API standards.
 *
 * Flow:
 * 1. Grant Token → get id_token (cached with auto-refresh)
 * 2. Create Payment → get bkashURL (redirect user)
 * 3. User completes payment on bKash
 * 4. bKash redirects to callbackURL with paymentID & status
 * 5. Execute Payment → confirm and capture (idempotent)
 * 6. Query Payment → verify status (server-side amount validation)
 * 7. (Optional) Refund Payment
 *
 * Security:
 * - All credentials via env vars
 * - Amount validated server-side after execution
 * - Full API response stored for audit
 * - Every request/response logged
 */

interface BkashTokenResponse {
    statusCode: string;
    statusMessage: string;
    id_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}

interface BkashCreatePaymentResponse {
    statusCode: string;
    statusMessage: string;
    paymentID: string;
    bkashURL: string;
    callbackURL: string;
    successCallbackURL: string;
    failureCallbackURL: string;
    cancelledCallbackURL: string;
    amount: string;
    intent: string;
    currency: string;
    paymentCreateTime: string;
    transactionStatus: string;
    merchantInvoiceNumber: string;
}

interface BkashExecutePaymentResponse {
    statusCode: string;
    statusMessage: string;
    paymentID: string;
    trxID: string;
    transactionStatus: string;
    amount: string;
    currency: string;
    intent: string;
    paymentExecuteTime: string;
    merchantInvoiceNumber: string;
    customerMsisdn: string;
    payerReference: string;
}

interface BkashQueryPaymentResponse {
    statusCode: string;
    statusMessage: string;
    paymentID: string;
    trxID: string;
    transactionStatus: string;
    amount: string;
    currency: string;
    completedTime: string;
    customerMsisdn: string;
    merchantInvoiceNumber: string;
}

interface BkashRefundResponse {
    statusCode: string;
    statusMessage: string;
    originalTrxID: string;
    refundTrxID: string;
    transactionStatus: string;
    amount: string;
    currency: string;
    completedTime: string;
}

class BkashService {
    private client: AxiosInstance;
    private idToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenExpiresAt: number = 0;
    private tokenLock: Promise<string> | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: config.bkash.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
    }

    /**
     * Check if bKash payment is properly configured
     */
    isConfigured(): boolean {
        // Treat mock mode as "configured" for local testing
        if (config.bkash.mock) return true;

        return !!(
            config.bkash.enabled &&
            config.bkash.appKey &&
            config.bkash.appSecret &&
            config.bkash.username &&
            config.bkash.password
        );
    }

    /**
     * Step 1: Grant Token (thread-safe with lock)
     * Authenticate with bKash and get id_token
     */
    async grantToken(): Promise<string> {
        // Mock token for local development/testing
        if (config.bkash.mock) {
            this.idToken = 'mock-id-token';
            this.tokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
            return this.idToken;
        }

        // Return cached token if still valid (with 60s buffer)
        if (this.idToken && Date.now() < this.tokenExpiresAt - 60000) {
            return this.idToken;
        }

        // Prevent concurrent token requests
        if (this.tokenLock) {
            return this.tokenLock;
        }

        this.tokenLock = this._doGrantToken();
        try {
            return await this.tokenLock;
        } finally {
            this.tokenLock = null;
        }
    }

    private async _doGrantToken(): Promise<string> {
        const requestBody = {
            app_key: config.bkash.appKey,
            app_secret: config.bkash.appSecret,
        };

        logger.info('[bKash] Grant token request', {
            endpoint: '/tokenized/checkout/token/grant',
            username: config.bkash.username,
        });

        try {
            const response = await this.client.post<BkashTokenResponse>(
                '/tokenized/checkout/token/grant',
                requestBody,
                {
                    headers: {
                        username: config.bkash.username,
                        password: config.bkash.password,
                    },
                }
            );

            logger.info('[bKash] Grant token response', {
                statusCode: response.data.statusCode,
                statusMessage: response.data.statusMessage,
                expiresIn: response.data.expires_in,
            });

            if (response.data.statusCode !== '0000') {
                throw new Error(
                    `bKash token grant failed: ${response.data.statusMessage} (code: ${response.data.statusCode})`
                );
            }

            this.idToken = response.data.id_token;
            this.refreshToken = response.data.refresh_token;
            this.tokenExpiresAt =
                Date.now() + (response.data.expires_in || 3600) * 1000;

            return this.idToken;
        } catch (error: any) {
            logger.error('[bKash] Grant token FAILED', {
                message: error.message,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
            });
            throw new Error(
                `Failed to authenticate with bKash: ${error.response?.data?.statusMessage || error.message}`
            );
        }
    }

    /**
     * Step 1b: Refresh Token (if grant token expires)
     */
    async refreshGrantToken(): Promise<string> {
        if (!this.refreshToken) {
            return this.grantToken();
        }

        logger.info('[bKash] Refresh token request');

        try {
            const response = await this.client.post<BkashTokenResponse>(
                '/tokenized/checkout/token/refresh',
                {
                    app_key: config.bkash.appKey,
                    app_secret: config.bkash.appSecret,
                    refresh_token: this.refreshToken,
                },
                {
                    headers: {
                        username: config.bkash.username,
                        password: config.bkash.password,
                    },
                }
            );

            logger.info('[bKash] Refresh token response', {
                statusCode: response.data.statusCode,
            });

            if (response.data.statusCode !== '0000') {
                logger.warn('[bKash] Token refresh failed, falling back to fresh grant');
                return this._doGrantToken();
            }

            this.idToken = response.data.id_token;
            this.refreshToken = response.data.refresh_token;
            this.tokenExpiresAt =
                Date.now() + (response.data.expires_in || 3600) * 1000;

            return this.idToken;
        } catch (error: any) {
            logger.warn('[bKash] Token refresh error, falling back to fresh grant', {
                message: error.message,
            });
            return this._doGrantToken();
        }
    }

    /**
     * Get a valid token (grant or refresh as needed)
     */
    private async getToken(): Promise<string> {
        if (this.idToken && Date.now() < this.tokenExpiresAt - 60000) {
            return this.idToken;
        }

        if (this.refreshToken) {
            return this.refreshGrantToken();
        }

        return this.grantToken();
    }

    /**
     * Get authorization headers for API calls
     */
    private async getAuthHeaders(): Promise<Record<string, string>> {
        const token = await this.getToken();
        return {
            Authorization: token,
            'X-APP-Key': config.bkash.appKey,
        };
    }

    /**
     * Step 2: Create Payment
     * Creates a payment request and returns the bKash URL for user redirect.
     * Returns the FULL raw response for storage.
     */
    async createPayment(
        amount: number,
        orderId: string,
        payerReference?: string
    ): Promise<BkashCreatePaymentResponse> {
        // Mock path for local testing
        if (config.bkash.mock) {
            const paymentID = `MOCK-PAY-${Date.now()}`;
            const now = new Date().toISOString();
            const bkashURL = `${config.frontendUrl || 'http://localhost:3000'}/_mock/bkash?paymentID=${encodeURIComponent(paymentID)}&amount=${encodeURIComponent(amount.toFixed(2))}`;
            logger.info('[bKash][mock] createPayment', { orderId, amount, paymentID, bkashURL });
            return Promise.resolve({
                statusCode: '0000',
                statusMessage: 'OK (mock)',
                paymentID,
                bkashURL,
                callbackURL: config.bkash.callbackUrl,
                successCallbackURL: `${config.frontendUrl}/checkout/bkash-result`,
                failureCallbackURL: `${config.frontendUrl}/checkout/bkash-result`,
                cancelledCallbackURL: `${config.frontendUrl}/checkout/bkash-result`,
                amount: amount.toFixed(2),
                intent: 'sale',
                currency: 'BDT',
                paymentCreateTime: now,
                transactionStatus: 'Initiated',
                merchantInvoiceNumber: orderId,
            });
        }

        const requestBody = {
            mode: '0011',
            payerReference: payerReference || orderId,
            callbackURL: config.bkash.callbackUrl,
            amount: amount.toFixed(2),
            currency: 'BDT',
            intent: 'sale',
            merchantInvoiceNumber: orderId,
        };

        logger.info('[bKash] Create payment request', {
            orderId,
            amount: requestBody.amount,
            callbackURL: requestBody.callbackURL,
        });

        try {
            const headers = await this.getAuthHeaders();

            const response = await this.client.post<BkashCreatePaymentResponse>(
                '/tokenized/checkout/create',
                requestBody,
                { headers }
            );

            logger.info('[bKash] Create payment response', {
                statusCode: response.data.statusCode,
                statusMessage: response.data.statusMessage,
                paymentID: response.data.paymentID,
                bkashURL: response.data.bkashURL ? '(present)' : '(missing)',
                orderId,
                amount: response.data.amount,
                transactionStatus: response.data.transactionStatus,
            });

            if (response.data.statusCode !== '0000') {
                throw new Error(
                    `bKash create payment failed: ${response.data.statusMessage} (code: ${response.data.statusCode})`
                );
            }

            if (!response.data.bkashURL || !response.data.paymentID) {
                throw new Error(
                    'bKash create payment returned incomplete response (missing bkashURL or paymentID)'
                );
            }

            return response.data;
        } catch (error: any) {
            logger.error('[bKash] Create payment FAILED', {
                message: error.message,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                orderId,
                amount,
            });
            throw new Error(
                `Failed to create bKash payment: ${error.response?.data?.statusMessage || error.message}`
            );
        }
    }

    /**
     * Step 3: Execute Payment
     * Called after user completes payment on bKash and is redirected back.
     * Returns full raw response for storage.
     */
    async executePayment(paymentID: string): Promise<BkashExecutePaymentResponse> {
        logger.info('[bKash] Execute payment request', { paymentID });

        // Mock execute for local testing
        if (config.bkash.mock) {
            const trxID = `MOCK-TRX-${Date.now()}`;
            logger.info('[bKash][mock] executePayment', { paymentID, trxID });
            return Promise.resolve({
                statusCode: '0000',
                statusMessage: 'OK (mock execute)',
                paymentID,
                trxID,
                transactionStatus: 'Completed',
                amount: '0.00',
                currency: 'BDT',
                intent: 'sale',
                paymentExecuteTime: new Date().toISOString(),
                merchantInvoiceNumber: '',
                customerMsisdn: '',
                payerReference: '',
            });
        }

        try {
            const headers = await this.getAuthHeaders();

            const response = await this.client.post<BkashExecutePaymentResponse>(
                '/tokenized/checkout/execute',
                { paymentID },
                { headers }
            );

            logger.info('[bKash] Execute payment response', {
                statusCode: response.data.statusCode,
                statusMessage: response.data.statusMessage,
                paymentID: response.data.paymentID,
                trxID: response.data.trxID,
                transactionStatus: response.data.transactionStatus,
                amount: response.data.amount,
                customerMsisdn: response.data.customerMsisdn,
                merchantInvoiceNumber: response.data.merchantInvoiceNumber,
            });

            // Note: We do NOT throw on non-0000 here — let the caller handle it
            // because a non-success status is valid information (e.g., "already executed")
            return response.data;
        } catch (error: any) {
            logger.error('[bKash] Execute payment FAILED', {
                message: error.message,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                paymentID,
            });
            throw new Error(
                `Failed to execute bKash payment: ${error.response?.data?.statusMessage || error.message}`
            );
        }
    }

    /**
     * Step 4: Query Payment
     * Check the status of a payment. Used for verification and webhook reconciliation.
     */
    async queryPayment(paymentID: string): Promise<BkashQueryPaymentResponse> {
        logger.info('[bKash] Query payment request', { paymentID });

        // Mock query for local testing
        if (config.bkash.mock) {
            logger.info('[bKash][mock] queryPayment', { paymentID });
            return Promise.resolve({
                statusCode: '0000',
                statusMessage: 'OK (mock query)',
                paymentID,
                trxID: `MOCK-TRX-${Date.now()}`,
                transactionStatus: 'Completed',
                amount: '0.00',
                currency: 'BDT',
                completedTime: new Date().toISOString(),
                customerMsisdn: '',
                merchantInvoiceNumber: '',
            });
        }

        try {
            const headers = await this.getAuthHeaders();

            const response = await this.client.post<BkashQueryPaymentResponse>(
                '/tokenized/checkout/payment/status',
                { paymentID },
                { headers }
            );

            logger.info('[bKash] Query payment response', {
                statusCode: response.data.statusCode,
                paymentID: response.data.paymentID,
                trxID: response.data.trxID,
                transactionStatus: response.data.transactionStatus,
                amount: response.data.amount,
            });

            return response.data;
        } catch (error: any) {
            logger.error('[bKash] Query payment FAILED', {
                message: error.message,
                responseData: error.response?.data,
                paymentID,
            });
            throw new Error(
                `Failed to query bKash payment: ${error.response?.data?.statusMessage || error.message}`
            );
        }
    }

    /**
     * Refund a payment (partial or full)
     */
    async refundPayment(
        paymentID: string,
        trxID: string,
        amount: number,
        reason: string = 'Customer refund'
    ): Promise<BkashRefundResponse> {
        logger.info('[bKash] Refund payment request', {
            paymentID,
            trxID,
            amount,
            reason,
        });

        // Mock refund behavior for dev
        if (config.bkash.mock) {
            logger.info('[bKash][mock] refundPayment', { paymentID, trxID, amount });
            return Promise.resolve({
                statusCode: '0000',
                statusMessage: 'OK (mock refund)',
                originalTrxID: trxID,
                refundTrxID: `MOCK-REFUND-${Date.now()}`,
                transactionStatus: 'Refunded',
                amount: amount.toFixed(2),
                currency: 'BDT',
                completedTime: new Date().toISOString(),
            });
        }

        try {
            const headers = await this.getAuthHeaders();

            const response = await this.client.post<BkashRefundResponse>(
                '/tokenized/checkout/payment/refund',
                {
                    paymentID,
                    trxID,
                    amount: amount.toFixed(2),
                    reason,
                    sku: 'refund',
                },
                { headers }
            );

            logger.info('[bKash] Refund payment response', {
                statusCode: response.data.statusCode,
                statusMessage: response.data.statusMessage,
                refundTrxID: response.data.refundTrxID,
                transactionStatus: response.data.transactionStatus,
                amount: response.data.amount,
            });

            if (response.data.statusCode !== '0000') {
                throw new Error(
                    `bKash refund failed: ${response.data.statusMessage} (code: ${response.data.statusCode})`
                );
            }

            return response.data;
        } catch (error: any) {
            logger.error('[bKash] Refund payment FAILED', {
                message: error.message,
                responseData: error.response?.data,
                paymentID,
                trxID,
            });
            throw new Error(
                `Failed to refund bKash payment: ${error.response?.data?.statusMessage || error.message}`
            );
        }
    }
}

// Singleton instance
export const bkashService = new BkashService();
export default bkashService;
