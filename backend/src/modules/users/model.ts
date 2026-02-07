import mongoose, { Schema, Document } from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    password: string; // NOTE: In production, hash passwords before saving
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDoc extends IUser, Document { }

const UserSchema = new Schema<IUserDoc>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// Avoid model recompilation in watch mode
export const UserModel = (mongoose.models.User as mongoose.Model<IUserDoc>) || mongoose.model<IUserDoc>('User', UserSchema);
