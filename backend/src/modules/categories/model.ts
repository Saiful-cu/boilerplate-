import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    icon?: string;
    parentCategory: mongoose.Types.ObjectId | null;
    isActive: boolean;
    displayOrder: number;
    productCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICategoryDoc extends ICategory, Document { }

const CategorySchema = new Schema<ICategoryDoc>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, unique: true, lowercase: true, trim: true },
        description: { type: String, trim: true },
        image: { type: String, trim: true },
        icon: { type: String, trim: true },
        parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        isActive: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 },
        productCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Create slug from name before saving
CategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

export const CategoryModel =
    (mongoose.models.Category as mongoose.Model<ICategoryDoc>) ||
    mongoose.model<ICategoryDoc>('Category', CategorySchema);

export default CategoryModel;
