import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import EmailLog from '@/modules/emailLogs/model';
import User from '@/modules/users/model';
import { adminAuth } from '@/middleware/auth';
import { sendVerificationEmail, sendWelcomeEmail } from '@/utils/email';

const router = Router();

// Get all email logs with pagination and filters
router.get('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const {
            page = '1',
            limit = '20',
            type,
            status,
            search,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query: any = {};

        if (type && type !== 'all') {
            query.type = type;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { to: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            query.createdAt = {} as any;
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;
        const sortOptions: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

        const [logs, total] = await Promise.all([
            EmailLog.find(query)
                .populate('userId', 'name email')
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            EmailLog.countDocuments(query)
        ]);

        res.json({
            data: logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        console.error('Error fetching email logs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get email log statistics
router.get('/stats', adminAuth, async (req: Request, res: Response) => {
    try {
        const { days = '30' } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days as string));

        const [
            totalEmails,
            sentEmails,
            failedEmails,
            byType,
            byStatus,
            recentActivity
        ] = await Promise.all([
            EmailLog.countDocuments({ createdAt: { $gte: startDate } }),
            EmailLog.countDocuments({ status: 'sent', createdAt: { $gte: startDate } }),
            EmailLog.countDocuments({ status: 'failed', createdAt: { $gte: startDate } }),
            EmailLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]),
            EmailLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            EmailLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
                        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                        total: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                { $limit: 30 }
            ])
        ]);

        res.json({
            totalEmails,
            sentEmails,
            failedEmails,
            successRate: totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(2) : 0,
            byType: byType.reduce((acc: Record<string, number>, item) => ({ ...acc, [item._id]: item.count }), {}),
            byStatus: byStatus.reduce((acc: Record<string, number>, item) => ({ ...acc, [item._id]: item.count }), {}),
            recentActivity
        });
    } catch (error: any) {
        console.error('Error fetching email stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Resend verification to a user directly (by email) - MUST be before /:id routes
router.post('/resend-verification', adminAuth, async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        await user.save();

        await sendVerificationEmail(user.email, user.name, verificationToken);

        res.json({ message: 'Verification email sent successfully' });
    } catch (error: any) {
        console.error('Error resending verification:', error);
        res.status(500).json({ message: 'Failed to send verification email', error: error.message });
    }
});

// Bulk delete email logs - MUST be before /:id routes
router.post('/bulk-delete', adminAuth, async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No email log IDs provided' });
        }

        const result = await EmailLog.deleteMany({ _id: { $in: ids } });
        res.json({
            message: `${result.deletedCount} email log(s) deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error: any) {
        console.error('Error bulk deleting email logs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single email log details
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const log = await EmailLog.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('orderId');

        if (!log) {
            return res.status(404).json({ message: 'Email log not found' });
        }

        res.json(log);
    } catch (error: any) {
        console.error('Error fetching email log:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Resend email by log ID
router.post('/:id/resend', adminAuth, async (req: Request, res: Response) => {
    try {
        const log = await EmailLog.findById(req.params.id);

        if (!log) {
            return res.status(404).json({ message: 'Email log not found' });
        }

        if (log.type !== 'verification' && log.type !== 'welcome') {
            return res.status(400).json({ message: 'Only verification and welcome emails can be resent' });
        }

        if (log.lastResendAt) {
            const cooldownTime = 5 * 60 * 1000;
            const timeSinceLastResend = Date.now() - log.lastResendAt.getTime();
            if (timeSinceLastResend < cooldownTime) {
                const remainingSeconds = Math.ceil((cooldownTime - timeSinceLastResend) / 1000);
                return res.status(429).json({
                    message: `Please wait ${remainingSeconds} seconds before resending`
                });
            }
        }

        const user = await User.findOne({ email: log.to });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (log.type === 'verification') {
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            user.verificationToken = verificationToken;
            user.verificationTokenExpires = verificationTokenExpires;
            await user.save();

            await sendVerificationEmail(user.email, user.name, verificationToken);
        } else if (log.type === 'welcome') {
            await sendWelcomeEmail(user.email, user.name);
        }

        log.resendCount = (log.resendCount || 0) + 1;
        log.lastResendAt = new Date();
        await log.save();

        res.json({
            message: 'Email resent successfully',
            resendCount: log.resendCount
        });
    } catch (error: any) {
        console.error('Error resending email:', error);
        res.status(500).json({ message: 'Failed to resend email', error: error.message });
    }
});

// Delete email log
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const log = await EmailLog.findByIdAndDelete(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Email log not found' });
        }
        res.json({ message: 'Email log deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting email log:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
