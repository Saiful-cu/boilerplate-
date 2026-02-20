import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageTemplateVariable {
    name: string;
    placeholder: string;
    defaultValue: string;
}

export interface IMessageTemplate {
    name: string;
    content: string;
    category: 'promotional' | 'notification' | 'reminder' | 'announcement' | 'custom';
    variables: IMessageTemplateVariable[];
    isActive: boolean;
    usageCount: number;
    lastUsed?: Date;
    createdBy?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMessageTemplateDoc extends IMessageTemplate, Document { }

const MessageTemplateSchema = new Schema<IMessageTemplateDoc>(
    {
        name: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        category: {
            type: String,
            enum: ['promotional', 'notification', 'reminder', 'announcement', 'custom'],
            default: 'custom',
        },
        variables: [
            {
                name: String,
                placeholder: String,
                defaultValue: String,
            },
        ],
        isActive: { type: Boolean, default: true },
        usageCount: { type: Number, default: 0 },
        lastUsed: { type: Date },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export const MessageTemplateModel =
    (mongoose.models.MessageTemplate as mongoose.Model<IMessageTemplateDoc>) ||
    mongoose.model<IMessageTemplateDoc>('MessageTemplate', MessageTemplateSchema);

export default MessageTemplateModel;
