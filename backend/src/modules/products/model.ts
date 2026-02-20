import mongoose, { Schema, Document } from 'mongoose';

export interface IProductColor {
    name: string;
    image: string;
}

export interface IProductReview {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}

export interface IProduct {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    cost: number;
    externalCost: number;
    category: string;
    stock: number;
    images: string[];
    video?: string;
    featured: boolean;
    rating: number;
    numReviews: number;
    reviews: IProductReview[];
    brand?: string;
    modelNumber?: string;
    specifications: Map<string, string>;
    features: string[];
    moq?: number;
    unitsSold: number;
    reviewCount: number;
    placeOfOrigin?: string;
    packaging?: string;
    leadTime?: string;
    customization: boolean;
    colors: IProductColor[];
    weight?: string;
    volume?: string;
    certifications: string[];
    tags: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProductDoc extends IProduct, Document { }

const ProductSchema = new Schema<IProductDoc>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        originalPrice: { type: Number, min: 0 },
        cost: { type: Number, min: 0, default: 0 },
        externalCost: { type: Number, min: 0, default: 0 },
        category: { type: String, required: true, trim: true },
        stock: { type: Number, required: true, min: 0, default: 0 },
        images: [{ type: String }],
        video: { type: String, trim: true },
        featured: { type: Boolean, default: false },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        numReviews: { type: Number, default: 0, min: 0 },
        reviews: [
            {
                user: { type: Schema.Types.ObjectId, ref: 'User' },
                rating: Number,
                comment: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],
        brand: { type: String, trim: true },
        modelNumber: { type: String, trim: true },
        specifications: { type: Map, of: String },
        features: [{ type: String }],
        moq: { type: Number, min: 1 },
        unitsSold: { type: Number, default: 0, min: 0 },
        reviewCount: { type: Number, default: 0, min: 0 },
        placeOfOrigin: { type: String, trim: true },
        packaging: { type: String },
        leadTime: { type: String },
        customization: { type: Boolean, default: false },
        colors: [
            {
                name: { type: String, required: true },
                image: { type: String, default: '' },
            },
        ],
        weight: { type: String },
        volume: { type: String },
        certifications: [{ type: String }],
        tags: [{ type: String }],
    },
    { timestamps: true }
);

export const ProductModel =
    (mongoose.models.Product as mongoose.Model<IProductDoc>) ||
    mongoose.model<IProductDoc>('Product', ProductSchema);

export default ProductModel;
