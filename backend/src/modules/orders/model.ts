import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IShippingAddress {
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
}

export interface IStatusHistory {
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    timestamp: Date;
    note?: string;
}

export interface IBkashPaymentDetails {
    paymentID?: string;
    trxID?: string;
    amount?: number;
    currency?: string;
    customerMsisdn?: string;
    payerReference?: string;
    merchantInvoiceNumber?: string;
    paymentExecuteTime?: string;
    paymentCreateTime?: string;
    transactionStatus?: string;
    paidAt?: Date;
    failureReason?: string;
    failedAt?: Date;
    createResponse?: Record<string, any>;
    executeResponse?: Record<string, any>;
    queryResponse?: Record<string, any>;
    refundResponse?: Record<string, any>;
}

export interface IOrder {
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    shippingAddress: IShippingAddress;
    shippingMethod: 'inside_dhaka' | 'outside_dhaka';
    shippingCost: number;
    paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery' | 'bkash';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    trackingNumber?: string;
    bkashPaymentID?: string;
    bkashExecuted?: boolean;
    paymentDetails?: IBkashPaymentDetails;
    paymentAttempts?: number;
    statusHistory: IStatusHistory[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IOrderDoc extends IOrder, Document { }

const OrderSchema = new Schema<IOrderDoc>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        shippingAddress: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String },
            zipCode: { type: String },
            country: { type: String, required: true, default: 'Bangladesh' },
        },
        shippingMethod: {
            type: String,
            enum: ['inside_dhaka', 'outside_dhaka'],
            default: 'inside_dhaka',
        },
        shippingCost: { type: Number, default: 70 },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bkash'],
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
            default: 'pending',
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        trackingNumber: { type: String, trim: true },
        bkashPaymentID: { type: String, trim: true, index: true },
        bkashExecuted: { type: Boolean, default: false },
        paymentDetails: {
            paymentID: { type: String },
            trxID: { type: String, index: true },
            amount: { type: Number },
            currency: { type: String },
            customerMsisdn: { type: String },
            payerReference: { type: String },
            merchantInvoiceNumber: { type: String },
            paymentExecuteTime: { type: String },
            paymentCreateTime: { type: String },
            transactionStatus: { type: String },
            paidAt: { type: Date },
            failureReason: { type: String },
            failedAt: { type: Date },
            createResponse: { type: Schema.Types.Mixed },
            executeResponse: { type: Schema.Types.Mixed },
            queryResponse: { type: Schema.Types.Mixed },
            refundResponse: { type: Schema.Types.Mixed },
        },
        paymentAttempts: { type: Number, default: 0 },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                },
                timestamp: { type: Date, default: Date.now },
                note: String,
            },
        ],
    },
    { timestamps: true }
);

// Compound index for user orders lookup
OrderSchema.index({ user: 1, createdAt: -1 });

export const OrderModel =
    (mongoose.models.Order as mongoose.Model<IOrderDoc>) ||
    mongoose.model<IOrderDoc>('Order', OrderSchema);

export default OrderModel;
