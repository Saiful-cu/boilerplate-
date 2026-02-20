import { Router, Request, Response } from 'express';
import HomePage from '@/modules/homepage/model';
import { adminAuth } from '@/middleware/auth';

const router = Router();

// Get active homepage layout
router.get('/', async (req: Request, res: Response) => {
    try {
        let homePage = await HomePage.findOne({ isActive: true });

        if (!homePage) {
            homePage = new HomePage({
                isActive: true,
                sections: [
                    { type: 'hero', order: 1, config: {} },
                    { type: 'product_grid', title: 'Best Seller', order: 2, config: { productType: 'best_sellers', limit: 4 } },
                    { type: 'collection_banners', order: 3, config: {} },
                    { type: 'product_grid', title: 'Just Landed', order: 4, config: { productType: 'new_arrivals', limit: 8, showTabs: true } },
                    { type: 'category_grid', title: 'Shop by Category', order: 5, config: { limit: 6 } },
                    { type: 'product_grid', title: 'Featured Products', order: 6, config: { productType: 'featured', limit: 4 } },
                    { type: 'promotional_cards', title: 'Pick Your Favourites', order: 7, config: {} },
                    { type: 'features', title: 'Why Shop With Us?', order: 8, config: {} },
                    { type: 'newsletter', order: 9, config: {} }
                ]
            });
            await homePage.save();
        }

        res.json(homePage);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update homepage layout (Admin only)
router.put('/', adminAuth, async (req: Request, res: Response) => {
    try {
        const { sections } = req.body;

        let homePage = await HomePage.findOne({ isActive: true });

        if (!homePage) {
            homePage = new HomePage({ isActive: true, sections });
        } else {
            homePage.sections = sections;
        }

        await homePage.save();
        res.json(homePage);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add new section (Admin only)
router.post('/sections', adminAuth, async (req: Request, res: Response) => {
    try {
        const { type, title, config, order } = req.body;

        let homePage = await HomePage.findOne({ isActive: true });

        if (!homePage) {
            homePage = new HomePage({ isActive: true, sections: [] });
        }

        homePage.sections.push({ type, title, config, order, isActive: true } as any);
        homePage.sections.sort((a: any, b: any) => a.order - b.order);

        await homePage.save();
        res.json(homePage);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update section (Admin only)
router.put('/sections/:sectionId', adminAuth, async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;
        const updates = req.body;

        const homePage = await HomePage.findOne({ isActive: true });

        if (!homePage) {
            return res.status(404).json({ message: 'Homepage not found' });
        }

        const section = (homePage.sections as any).id(sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        Object.assign(section, updates);
        await homePage.save();

        res.json(homePage);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete section (Admin only)
router.delete('/sections/:sectionId', adminAuth, async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;

        const homePage = await HomePage.findOne({ isActive: true });

        if (!homePage) {
            return res.status(404).json({ message: 'Homepage not found' });
        }

        (homePage.sections as any).id(sectionId).deleteOne();
        await homePage.save();

        res.json(homePage);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Reorder sections (Admin only)
router.post('/sections/reorder', adminAuth, async (req: Request, res: Response) => {
    try {
        const { sectionIds } = req.body;

        const homePage = await HomePage.findOne({ isActive: true });

        if (!homePage) {
            return res.status(404).json({ message: 'Homepage not found' });
        }

        sectionIds.forEach((id: string, index: number) => {
            const section = (homePage.sections as any).id(id);
            if (section) {
                section.order = index + 1;
            }
        });

        homePage.sections.sort((a: any, b: any) => a.order - b.order);
        await homePage.save();

        res.json(homePage);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
