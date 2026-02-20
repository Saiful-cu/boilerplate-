import mongoose, { Schema, Document } from 'mongoose';

export interface IReview {
    product: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    order: mongoose.Types.ObjectId;
    rating: number;
    title?: string;
    comment: string;
    images: string[];
    videos: string[];
    helpful: mongoose.Types.ObjectId[];
    verified: boolean;
    status: 'pending' | 'approved' | 'rejected';
    adminResponse?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IReviewDoc extends IReview, Document { }

const ReviewSchema = new Schema<IReviewDoc>(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, trim: true, maxlength: 100 },
        comment: { type: String, required: true, trim: true, maxlength: 1000 },
        images: [{ type: String }],
        videos: [{ type: String }],
        helpful: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        verified: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminResponse: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Indexes for faster queries
ReviewSchema.index({ product: 1, status: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ rating: 1 });

// Update product rating when review is added/updated
ReviewSchema.post('save', async function () {
    const ReviewModel = this.constructor as mongoose.Model<IReviewDoc>;
    const ProductModel = mongoose.model('Product');

    if (this.status === 'approved') {
        const stats = await ReviewModel.aggregate([
            { $match: { product: this.product, status: 'approved' } },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    numReviews: { $sum: 1 },
                },
            },
        ]);

        if (stats.length > 0) {
            await ProductModel.findByIdAndUpdate(this.product, {
                rating: Math.round(stats[0].avgRating * 10) / 10,
                numReviews: stats[0].numReviews,
            });
        }
    }
});

export const ReviewModel =
    (mongoose.models.Review as mongoose.Model<IReviewDoc>) ||
    mongoose.model<IReviewDoc>('Review', ReviewSchema);

export default ReviewModel;
