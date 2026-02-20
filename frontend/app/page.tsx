'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import api from '@/lib/api';
import {
    HeroSection,
    ProductGridSection,
    CollectionBanners,
    CategoryGrid,
    PromotionalCards,
    FeaturesSection,
    NewsletterSection,
} from '@/components/home';

interface HomepageSection {
    _id: string;
    type: string;
    title?: string;
    order: number;
    isActive: boolean;
    config: Record<string, unknown>;
}

/**
 * Home page component - Dynamic sections managed by admin
 */
export default function Home() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeLayout();
    }, []);

    const fetchHomeLayout = async () => {
        try {
            const response = await api.get('/homepage');
            const activeSections = (response.data.sections as HomepageSection[])
                .filter((section) => section.isActive)
                .sort((a, b) => a.order - b.order);
            setSections(activeSections);
        } catch (error) {
            console.error('Error fetching home layout:', error);
            setSections([
                { _id: 'default-hero', type: 'hero', order: 1, isActive: true, config: {} },
                { _id: 'default-products', type: 'product_grid', title: 'Featured Products', order: 2, isActive: true, config: { productType: 'featured', limit: 4 } },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderSection = (section: HomepageSection) => {
        const { type, title, config, _id } = section;

        switch (type) {
            case 'hero':
                return <HeroSection key={_id} config={config} />;
            case 'product_grid':
                return <ProductGridSection key={_id} title={title} config={config} />;
            case 'collection_banners':
                return <CollectionBanners key={_id} config={config} />;
            case 'category_grid':
                return <CategoryGrid key={_id} title={title} config={config} />;
            case 'promotional_cards':
                return <PromotionalCards key={_id} title={title} config={config} />;
            case 'features':
                return <FeaturesSection key={_id} title={title} config={config} />;
            case 'newsletter':
                return <NewsletterSection key={_id} config={config} />;
            case 'custom_html':
                return (
                    <Box component="section" key={_id} py={6}>
                        <Box className="container mx-auto px-4">
                            <div dangerouslySetInnerHTML={{ __html: (config.html as string) || '' }} />
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                <Box textAlign="center">
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography color="text.secondary">Loading...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box minHeight="100vh" data-testid="home-page">
            {sections.map((section) => renderSection(section))}
        </Box>
    );
}
