import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
    | 'PRODUCT_CREATE' | 'PRODUCT_UPDATE' | 'PRODUCT_DELETE' | 'PRODUCT_BULK_UPDATE'
    | 'ORDER_STATUS_UPDATE' | 'ORDER_CANCEL' | 'ORDER_REFUND'
    | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'USER_ROLE_CHANGE' | 'USER_BAN' | 'USER_UNBAN'
    | 'CATEGORY_CREATE' | 'CATEGORY_UPDATE' | 'CATEGORY_DELETE'
    | 'SETTINGS_UPDATE' | 'HOMEPAGE_UPDATE'
    | 'PROMO_CREATE' | 'PROMO_UPDATE' | 'PROMO_DELETE'
    | 'ADMIN_LOGIN' | 'ADMIN_LOGOUT' | 'PASSWORD_RESET_REQUEST'
    | 'OTHER';

export type AuditResourceType =
    | 'Product' | 'Order' | 'User' | 'Category' | 'Settings' | 'PromoCode' | 'HomePage' | 'Auth' | 'Other';

export interface IAuditLog {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    userRole: string;
    action: AuditAction;
    resourceType: AuditResourceType;
    resourceId?: mongoose.Types.ObjectId;
    resourceName?: string;
    previousValue?: unknown;
    newValue?: unknown;
    ipAddress?: string;
    userAgent?: string;
    requestMethod?: string;
    requestPath?: string;
    description?: string;
    metadata?: unknown;
    status: 'success' | 'failure';
    errorMessage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAuditLogDoc extends IAuditLog, Document { }

const AuditLogSchema = new Schema<IAuditLogDoc>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        userEmail: { type: String, required: true },
        userRole: { type: String, required: true },
        action: {
            type: String,
            required: true,
            enum: [
                'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_BULK_UPDATE',
                'ORDER_STATUS_UPDATE', 'ORDER_CANCEL', 'ORDER_REFUND',
                'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_ROLE_CHANGE', 'USER_BAN', 'USER_UNBAN',
                'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DELETE',
                'SETTINGS_UPDATE', 'HOMEPAGE_UPDATE',
                'PROMO_CREATE', 'PROMO_UPDATE', 'PROMO_DELETE',
                'ADMIN_LOGIN', 'ADMIN_LOGOUT', 'PASSWORD_RESET_REQUEST',
                'OTHER',
            ],
            index: true,
        },
        resourceType: {
            type: String,
            required: true,
            enum: ['Product', 'Order', 'User', 'Category', 'Settings', 'PromoCode', 'HomePage', 'Auth', 'Other'],
            index: true,
        },
        resourceId: { type: Schema.Types.ObjectId, index: true },
        resourceName: { type: String },
        previousValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
        ipAddress: { type: String },
        userAgent: { type: String },
        requestMethod: { type: String },
        requestPath: { type: String },
        description: { type: String },
        metadata: { type: Schema.Types.Mixed },
        status: { type: String, enum: ['success', 'failure'], default: 'success' },
        errorMessage: { type: String },
    },
    { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLogModel =
    (mongoose.models.AuditLog as mongoose.Model<IAuditLogDoc>) ||
    mongoose.model<IAuditLogDoc>('AuditLog', AuditLogSchema);

export default AuditLogModel;
