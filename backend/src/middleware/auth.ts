import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUserDoc } from '@/modules/users/model';
import { config } from '@/config';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUserDoc;
        }
    }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ message: 'No authentication token, access denied' });
            return;
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
        const user = await UserModel.findById(decoded.userId).select('-password');

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        if (user.isActive === false) {
            res.status(403).json({ message: 'Account is deactivated' });
            return;
        }

        req.user = user;
        next();
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Auth middleware error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Invalid token format' });
            return;
        }
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export const adminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ message: 'No authentication token, access denied' });
            return;
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
        const user = await UserModel.findById(decoded.userId).select('-password');

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        if (user.isActive === false) {
            res.status(403).json({ message: 'Account is deactivated' });
            return;
        }

        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Access denied. Admin only.' });
            return;
        }

        req.user = user;
        next();
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Admin auth middleware error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Invalid token format' });
            return;
        }
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        res.status(401).json({ message: 'Authentication failed' });
    }
};
