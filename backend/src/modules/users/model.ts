import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
    label: string;
    firstName?: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    zipCode?: string;
    country: string;
    isDefault: boolean;
    type: 'shipping' | 'billing' | 'both';
}

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'admin' | 'user';
    phone: string;
    isVerified: boolean;
    isActive: boolean;
    verificationToken: string | null;
    verificationTokenExpires: Date | null;
    address: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    savedAddresses: IAddress[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDoc extends IUser, Document { }

const addressSchema = new Schema<IAddress>(
    {
        label: { type: String, required: true, trim: true },
        firstName: { type: String, trim: true },
        lastName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, default: 'Bangladesh', trim: true },
        isDefault: { type: Boolean, default: false },
        type: { type: String, enum: ['shipping', 'billing', 'both'], default: 'both' },
    },
    { timestamps: true }
);

const UserSchema = new Schema<IUserDoc>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['customer', 'admin', 'user'], default: 'customer' },
        phone: { type: String, default: '', trim: true },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        verificationToken: { type: String, default: null },
        verificationTokenExpires: { type: Date, default: null },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            zipCode: { type: String, trim: true },
            country: { type: String, default: 'Bangladesh', trim: true },
        },
        savedAddresses: [addressSchema],
    },
    { timestamps: true }
);

export const UserModel =
    (mongoose.models.User as mongoose.Model<IUserDoc>) ||
    mongoose.model<IUserDoc>('User', UserSchema);

export default UserModel;
