import { Router, Request, Response } from 'express';
import MessageTemplate from '@/modules/messageTemplates/model';
import { adminAuth } from '@/middleware/auth';

const router = Router();

// Get all templates
router.get('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const templates = await MessageTemplate.find().sort({ createdAt: -1 });
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single template
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await MessageTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create template
router.post('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = new MessageTemplate({
            ...req.body,
            createdBy: req.user!._id
        });
        await template.save();
        res.status(201).json(template);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update template
router.put('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await MessageTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete template
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await MessageTemplate.findByIdAndDelete(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update usage stats
router.post('/:id/use', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await MessageTemplate.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { usageCount: 1 },
                lastUsed: new Date()
            },
            { new: true }
        );
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
