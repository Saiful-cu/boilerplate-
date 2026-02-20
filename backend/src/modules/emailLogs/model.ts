import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog {
    to: string;
    from: string;
    subject: string;
    type: 'verification' | 'welcome' | 'password_reset' | 'order_confirmation' | 'order_status' | 'promotional' | 'other';
    status: 'sent' | 'failed' | 'pending' | 'bounced' | 'opened' | 'clicked';
    userId?: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    verificationToken?: string;
    statusCode?: number;
    messageId?: string;
    errorMessage?: string;
    provider: string;
    resendCount: number;
    lastResendAt?: Date;
    metadata?: unknown;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IEmailLogDoc extends IEmailLog, Document { }

const EmailLogSchema = new Schema<IEmailLogDoc>(
    {
        to: { type: String, required: true, trim: true },
        from: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ['verification', 'welcome', 'password_reset', 'order_confirmation', 'order_status', 'promotional', 'other'],
            required: true,
        },
        status: {
            type: String,
            enum: ['sent', 'failed', 'pending', 'bounced', 'opened', 'clicked'],
            default: 'pending',
        },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        verificationToken: { type: String },
        statusCode: { type: Number },
        messageId: { type: String },
        errorMessage: { type: String },
        provider: { type: String, default: 'sendgrid' },
        resendCount: { type: Number, default: 0 },
        lastResendAt: { type: Date },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

EmailLogSchema.index({ to: 1, createdAt: -1 });
EmailLogSchema.index({ type: 1, status: 1 });
EmailLogSchema.index({ userId: 1 });
EmailLogSchema.index({ status: 1 });

export const EmailLogModel =
    (mongoose.models.EmailLog as mongoose.Model<IEmailLogDoc>) ||
    mongoose.model<IEmailLogDoc>('EmailLog', EmailLogSchema);

export default EmailLogModel;
