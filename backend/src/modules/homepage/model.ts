import mongoose, { Schema, Document } from 'mongoose';

export interface ISection {
    type:
    | 'hero'
    | 'product_grid'
    | 'collection_banners'
    | 'category_grid'
    | 'promotional_cards'
    | 'features'
    | 'newsletter'
    | 'custom_html';
    title: string;
    config: Record<string, unknown>;
    isActive: boolean;
    order: number;
}

export interface IHomePage {
    sections: ISection[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IHomePageDoc extends IHomePage, Document { }

const sectionSchema = new Schema<ISection>(
    {
        type: {
            type: String,
            required: true,
            enum: [
                'hero',
                'product_grid',
                'collection_banners',
                'category_grid',
                'promotional_cards',
                'features',
                'newsletter',
                'custom_html',
            ],
        },
        title: { type: String, default: '' },
        config: { type: Schema.Types.Mixed, default: {} },
        isActive: { type: Boolean, default: true },
        order: { type: Number, required: true },
    },
    { timestamps: true }
);

const HomePageSchema = new Schema<IHomePageDoc>(
    {
        sections: [sectionSchema],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const HomePageModel =
    (mongoose.models.HomePage as mongoose.Model<IHomePageDoc>) ||
    mongoose.model<IHomePageDoc>('HomePage', HomePageSchema);

export default HomePageModel;
