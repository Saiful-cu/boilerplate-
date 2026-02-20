import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoCode {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    usedCount: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    applicableCategories: mongoose.Types.ObjectId[];
    applicableProducts: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPromoCodeDoc extends IPromoCode, Document { }

const PromoCodeSchema = new Schema<IPromoCodeDoc>(
    {
        code: { type: String, required: true, uppercase: true, trim: true },
        description: { type: String, required: true },
        discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        minOrderAmount: { type: Number, default: 0 },
        maxDiscountAmount: { type: Number, default: null },
        usageLimit: { type: Number, default: null },
        usedCount: { type: Number, default: 0 },
        validFrom: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
        applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

PromoCodeSchema.index({ code: 1 });
PromoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export const PromoCodeModel =
    (mongoose.models.PromoCode as mongoose.Model<IPromoCodeDoc>) ||
    mongoose.model<IPromoCodeDoc>('PromoCode', PromoCodeSchema);

export default PromoCodeModel;
