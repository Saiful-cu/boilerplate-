import { Router, Request, Response } from 'express';
import AuditLog from '@/modules/auditLogs/model';
import { adminAuth } from '@/middleware/auth';

const router = Router();

// Get audit logs with filtering and pagination
router.get('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const {
            page = '1',
            limit = '50',
            action,
            resourceType,
            userId,
            startDate,
            endDate,
            status
        } = req.query;

        const query: any = {};

        if (action) query.action = action;
        if (resourceType) query.resourceType = resourceType;
        if (userId) query.userId = userId;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {} as any;
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('userId', 'name email'),
            AuditLog.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get audit log stats
router.get('/stats', adminAuth, async (req: Request, res: Response) => {
    try {
        const { days = '7' } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days as string));

        const [actionStats, dailyStats, topUsers] = await Promise.all([
            AuditLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            AuditLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            AuditLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: '$userEmail', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                actionStats,
                dailyStats,
                topUsers
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single audit log
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const log = await AuditLog.findById(req.params.id).populate('userId', 'name email');

        if (!log) {
            return res.status(404).json({ success: false, message: 'Audit log not found' });
        }

        res.json({ success: true, data: log });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
