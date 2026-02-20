import { Router, Request, Response } from 'express';
import Settings from '@/modules/settings/model';
import { adminAuth } from '@/middleware/auth';

const router = Router();

// Get settings (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        let settings = await Settings.findById('site-settings');

        if (!settings) {
            settings = new Settings({ _id: 'site-settings' });
            await settings.save();
        }

        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update settings (Admin only)
router.put('/', adminAuth, async (req: Request, res: Response) => {
    try {
        let settings = await Settings.findById('site-settings');

        if (!settings) {
            settings = new Settings({ _id: 'site-settings', ...req.body });
        } else {
            Object.assign(settings, req.body);
        }

        await settings.save();
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
