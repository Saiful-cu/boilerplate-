import { Router, Request, Response } from 'express';
import EmailTemplate from '@/modules/emailTemplates/model';
import { adminAuth } from '@/middleware/auth';

const router = Router();

// Get all email templates
router.get('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const { type, category, isActive } = req.query;
        const query: any = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const templates = await EmailTemplate.find(query).sort({ createdAt: -1 });
        res.json(templates);
    } catch (error: any) {
        console.error('Error fetching email templates:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get default template by type
router.get('/default/:type', async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.findOne({
            type: req.params.type,
            isDefault: true,
            isActive: true
        });

        if (!template) {
            return res.status(404).json({ message: 'No default template found for this type' });
        }

        res.json(template);
    } catch (error: any) {
        console.error('Error fetching default template:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single email template
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error: any) {
        console.error('Error fetching template:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create email template
router.post('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = new EmailTemplate({
            ...req.body,
            createdBy: req.user!._id
        });
        await template.save();
        res.status(201).json(template);
    } catch (error: any) {
        console.error('Error creating template:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update email template
router.put('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error: any) {
        console.error('Error updating template:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete email template
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        if (template.isDefault) {
            return res.status(400).json({ message: 'Cannot delete default template. Set another template as default first.' });
        }

        await EmailTemplate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting template:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Set template as default
router.post('/:id/set-default', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        await EmailTemplate.updateMany(
            { type: template.type, _id: { $ne: template._id } },
            { isDefault: false }
        );

        template.isDefault = true;
        await template.save();

        res.json({ message: 'Template set as default successfully', template });
    } catch (error: any) {
        console.error('Error setting default template:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Toggle template active status
router.post('/:id/toggle-active', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        template.isActive = !template.isActive;
        await template.save();

        res.json({ message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`, template });
    } catch (error: any) {
        console.error('Error toggling template status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Duplicate template
router.post('/:id/duplicate', adminAuth, async (req: Request, res: Response) => {
    try {
        const originalTemplate = await EmailTemplate.findById(req.params.id);
        if (!originalTemplate) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const duplicatedTemplate = new EmailTemplate({
            name: `${originalTemplate.name} (Copy)`,
            subject: originalTemplate.subject,
            htmlContent: originalTemplate.htmlContent,
            textContent: originalTemplate.textContent,
            type: originalTemplate.type,
            category: originalTemplate.category,
            variables: originalTemplate.variables,
            headerColor: originalTemplate.headerColor,
            buttonColor: originalTemplate.buttonColor,
            footerText: originalTemplate.footerText,
            isActive: false,
            isDefault: false,
            createdBy: req.user!._id
        });

        await duplicatedTemplate.save();
        res.status(201).json(duplicatedTemplate);
    } catch (error: any) {
        console.error('Error duplicating template:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update usage stats
router.post('/:id/use', async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { usageCount: 1 },
                lastUsed: new Date()
            },
            { new: true }
        );
        res.json(template);
    } catch (error: any) {
        console.error('Error updating usage:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Preview template with sample data
router.post('/:id/preview', adminAuth, async (req: Request, res: Response) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const sampleData = req.body.sampleData || {};
        let previewHtml = template.htmlContent;
        let previewSubject = template.subject;

        template.variables.forEach((variable: any) => {
            const value = sampleData[variable.name] || variable.defaultValue || `{{${variable.name}}}`;
            const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
            previewHtml = previewHtml.replace(regex, value);
            previewSubject = previewSubject.replace(regex, value);
        });

        res.json({
            subject: previewSubject,
            htmlContent: previewHtml,
            template
        });
    } catch (error: any) {
        console.error('Error previewing template:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
