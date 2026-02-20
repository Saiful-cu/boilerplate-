import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplateVariable {
    name: string;
    placeholder: string;
    defaultValue: string;
    description: string;
}

export interface IEmailTemplateBlock {
    id: string;
    type: 'header' | 'heading' | 'paragraph' | 'image' | 'button' | 'divider' | 'spacer' | 'list' | 'columns' | 'footer';
    content: unknown;
}

export interface IDesignSettings {
    backgroundColor: string;
    contentWidth: number;
    contentBackground: string;
    fontFamily: string;
    primaryColor: string;
    secondaryColor: string;
    headerColor: string;
    headerGradient: boolean;
    headerGradientEnd: string;
    footerBackground: string;
    borderRadius: number;
}

export interface IEmailTemplate {
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    type: 'verification' | 'welcome' | 'password_reset' | 'order_confirmation' | 'order_status' | 'shipping' | 'promotional' | 'newsletter' | 'custom';
    category: 'transactional' | 'marketing' | 'notification' | 'custom';
    variables: IEmailTemplateVariable[];
    isActive: boolean;
    isDefault: boolean;
    usageCount: number;
    lastUsed?: Date;
    createdBy?: mongoose.Types.ObjectId;
    designSettings: IDesignSettings;
    blocks: IEmailTemplateBlock[];
    headerColor: string;
    buttonColor: string;
    footerText: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IEmailTemplateDoc extends IEmailTemplate, Document { }

const EmailTemplateSchema = new Schema<IEmailTemplateDoc>(
    {
        name: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        htmlContent: { type: String, required: true },
        textContent: { type: String },
        type: {
            type: String,
            enum: ['verification', 'welcome', 'password_reset', 'order_confirmation', 'order_status', 'shipping', 'promotional', 'newsletter', 'custom'],
            default: 'custom',
        },
        category: {
            type: String,
            enum: ['transactional', 'marketing', 'notification', 'custom'],
            default: 'custom',
        },
        variables: [
            {
                name: String,
                placeholder: String,
                defaultValue: String,
                description: String,
            },
        ],
        isActive: { type: Boolean, default: true },
        isDefault: { type: Boolean, default: false },
        usageCount: { type: Number, default: 0 },
        lastUsed: { type: Date },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        designSettings: {
            backgroundColor: { type: String, default: '#f8fafc' },
            contentWidth: { type: Number, default: 600 },
            contentBackground: { type: String, default: '#ffffff' },
            fontFamily: { type: String, default: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
            primaryColor: { type: String, default: '#6366f1' },
            secondaryColor: { type: String, default: '#8b5cf6' },
            headerColor: { type: String, default: '#6366f1' },
            headerGradient: { type: Boolean, default: true },
            headerGradientEnd: { type: String, default: '#8b5cf6' },
            footerBackground: { type: String, default: '#f1f5f9' },
            borderRadius: { type: Number, default: 16 },
        },
        blocks: [
            {
                id: String,
                type: {
                    type: String,
                    enum: ['header', 'heading', 'paragraph', 'image', 'button', 'divider', 'spacer', 'list', 'columns', 'footer'],
                },
                content: Schema.Types.Mixed,
            },
        ],
        headerColor: { type: String, default: '#6366f1' },
        buttonColor: { type: String, default: '#6366f1' },
        footerText: { type: String, default: '' },
    },
    { timestamps: true }
);

// Ensure only one default template per type
EmailTemplateSchema.pre('save', async function (next) {
    if (this.isDefault && this.isModified('isDefault')) {
        await (this.constructor as mongoose.Model<IEmailTemplateDoc>).updateMany(
            { type: this.type, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

export const EmailTemplateModel =
    (mongoose.models.EmailTemplate as mongoose.Model<IEmailTemplateDoc>) ||
    mongoose.model<IEmailTemplateDoc>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplateModel;
