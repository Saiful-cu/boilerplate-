'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
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
    id: string;
    _id?: string;
    type: string;
    title?: string;
    order: number;
    isActive: boolean;
    config: Record<string, unknown>;
}

/**
 * Preview page for the homepage builder
 * Receives sections via postMessage from the parent builder
 */
export default function HomepagePreviewPage() {
    const theme = useTheme();
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_UPDATE') {
                setSections(event.data.sections || []);
                setIsLoading(false);
            }
        };

        window.addEventListener('message', handleMessage);

        // If preview is embedded (iframe) notify parent we are ready
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
        } else {
            // When opened directly in a new tab, fetch the saved homepage so preview is useful standalone
            (async () => {
                try {
                    const res = await fetch('/api/homepage');
                    if (res.ok) {
                        const data = await res.json();
                        const fetched = Array.isArray(data.sections) ? data.sections : data.sections || [];
                        setSections(fetched as HomepageSection[]);
                    }
                } catch (err) {
                    // ignore — we'll show empty state
                    // console.error('Preview fetch failed', err);
                } finally {
                    setIsLoading(false);
                }
            })();
        }

        // Timeout for initial load (fallback)
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(timeout);
        };
    }, []);

    const renderSection = (section: HomepageSection) => {
        const { type, title, config, id, _id } = section;
        const key = id || _id;

        switch (type) {
            case 'hero':
                return <HeroSection key={key} config={config} />;
            case 'product_grid':
                return <ProductGridSection key={key} title={title} config={config} />;
            case 'collection_banners':
                return <CollectionBanners key={key} config={config} />;
            case 'category_grid':
                return <CategoryGrid key={key} title={title} config={config} />;
            case 'promotional_cards':
                return <PromotionalCards key={key} title={title} config={config} />;
            case 'features':
                return <FeaturesSection key={key} title={title} config={config} />;
            case 'newsletter':
                return <NewsletterSection key={key} config={config} />;
            case 'custom_html':
                return (
                    <Box
                        component="section"
                        key={key}
                        sx={{ py: 6 }}
                    >
                        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
                            {title && (
                                <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                                    {title}
                                </Typography>
                            )}
                            <div
                                dangerouslySetInnerHTML={{ __html: (config.html as string) || '' }}
                            />
                        </Box>
                    </Box>
                );
            case 'testimonials':
                return (
                    <Box
                        component="section"
                        key={key}
                        sx={{
                            py: 8,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                        }}
                    >
                        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2, textAlign: 'center' }}>
                            {title && (
                                <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                                    {title}
                                </Typography>
                            )}
                            <Typography variant="body1" color="text.secondary">
                                Testimonials section preview
                            </Typography>
                        </Box>
                    </Box>
                );
            default:
                return (
                    <Box
                        component="section"
                        key={key}
                        sx={{
                            py: 6,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                        }}
                    >
                        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                Unknown section type: {type}
                            </Typography>
                        </Box>
                    </Box>
                );
        }
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: theme.palette.background.default,
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography color="text.secondary">Loading preview...</Typography>
                </Box>
            </Box>
        );
    }

    if (sections.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: theme.palette.background.default,
                }}
            >
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography sx={{ fontSize: 60, mb: 2 }}>📄</Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No sections to preview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add sections in the builder to see them here
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
            {sections
                .filter((s) => s.isActive)
                .sort((a, b) => a.order - b.order)
                .map((section) => renderSection(section))}
        </Box>
    );
}
