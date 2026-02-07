import { UserModel, IUser } from './model';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';

export class UserService {
    async list(): Promise<IUser[]> {
        const users = await UserModel.find().lean();
        return users;
    }

    async getById(id: string): Promise<IUser> {
        const user = await UserModel.findById(id).lean();
        if (!user) throw new NotFoundError('User', { userId: id });
        return user as IUser;
    }

    async create(payload: Pick<IUser, 'name' | 'email' | 'password'>): Promise<IUser> {
        if (!payload.email || !payload.name || !payload.password) {
            throw new ValidationError('Missing required user fields');
        }

        // Check uniqueness
        const existing = await UserModel.findOne({ email: payload.email });
        if (existing) throw new ConflictError('Email already in use', { email: payload.email });

        const created = await UserModel.create(payload as any);
        return created.toObject();
    }

    async update(id: string, payload: Partial<IUser>): Promise<IUser> {
        const updated = await UserModel.findByIdAndUpdate(id, payload as any, { new: true }).lean();
        if (!updated) throw new NotFoundError('User', { userId: id });
        return updated as IUser;
    }

    async remove(id: string): Promise<void> {
        const res = await UserModel.findByIdAndDelete(id);
        if (!res) throw new NotFoundError('User', { userId: id });
        return;
    }
}

export const userService = new UserService();
