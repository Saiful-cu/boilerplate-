import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppLog {
    customerName: string;
    customerPhone: string;
    customerId?: mongoose.Types.ObjectId;
    message: string;
    templateId?: string;
    adminId: mongoose.Types.ObjectId;
    adminName: string;
    status: 'logged' | 'sent' | 'failed';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IWhatsAppLogDoc extends IWhatsAppLog, Document { }

const WhatsAppLogSchema = new Schema<IWhatsAppLogDoc>(
    {
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        message: { type: String, required: true },
        templateId: { type: String, required: false },
        adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        adminName: { type: String, required: true },
        status: { type: String, enum: ['logged', 'sent', 'failed'], default: 'logged' },
    },
    { timestamps: true }
);

WhatsAppLogSchema.index({ customerPhone: 1, createdAt: -1 });
WhatsAppLogSchema.index({ adminId: 1, createdAt: -1 });

export const WhatsAppLogModel =
    (mongoose.models.WhatsAppLog as mongoose.Model<IWhatsAppLogDoc>) ||
    mongoose.model<IWhatsAppLogDoc>('WhatsAppLog', WhatsAppLogSchema);

export default WhatsAppLogModel;
