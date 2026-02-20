'use client';

import React from 'react';

import {
    Box,
    Typography,
    TextField,
    IconButton,
    Divider,
    Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import { useBuilderStore, useSelectedSection } from '@/lib/stores/builderStore';
import { getSectionMeta, SectionType, SectionConfigMap } from '@/lib/types/pageBuilder';
import {
    HeroEditor,
    ProductGridEditor,
    CategoryGridEditor,
    CollectionBannersEditor,
    FeaturesEditor,
    NewsletterEditor,
    TestimonialsEditor,
    PromotionalCardsEditor,
    CustomHtmlEditor,
} from './editors/index';

class EditorErrorBoundary extends React.Component<{
    children: React.ReactNode;
    onReset?: () => void;
}, { hasError: boolean; error?: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: unknown) {
        // keep a console trace for debugging
        // (could be wired to a reporting service)
        // eslint-disable-next-line no-console
        console.error('Editor render error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" color="error" fontWeight={700} sx={{ mb: 1 }}>
                        Editor failed to render
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        An unexpected error occurred while rendering the section editor.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
                        {this.state.error?.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => this.setState({ hasError: false, error: null })}
                        >
                            Retry
                        </Button>
                        {this.props.onReset && (
                            <Button size="small" variant="contained" onClick={this.props.onReset}>
                                Deselect
                            </Button>
                        )}
                    </Box>
                </Box>
            );
        }

        return this.props.children as any;
    }
}

export function PropertiesPanel() {
    const selectedSection = useSelectedSection();
    const selectSection = useBuilderStore((state) => state.selectSection);
    const updateSectionTitle = useBuilderStore((state) => state.updateSectionTitle);
    const updateSectionConfig = useBuilderStore((state) => state.updateSectionConfig);

    if (!selectedSection) {
        return (
            <Box
                sx={{
                    width: 340,
                    bgcolor: 'background.paper',
                    borderLeft: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                <Box
                    sx={{
                        p: 2.5,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        Properties
                    </Typography>
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <TouchAppOutlinedIcon
                            sx={{
                                fontSize: 56,
                                color: 'text.disabled',
                                mb: 2,
                            }}
                        />
                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                            Select a section
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                            Click on a section in the canvas to edit its properties
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    const meta = getSectionMeta(selectedSection.type);

    const handleConfigChange = <T extends SectionType>(
        config: Partial<SectionConfigMap[T]>
    ) => {
        updateSectionConfig(selectedSection.id, config);
    };

    const renderEditor = () => {
        const config = selectedSection.config;

        switch (selectedSection.type) {
            case 'hero':
                return (
                    <HeroEditor
                        config={config as SectionConfigMap['hero']}
                        onChange={handleConfigChange}
                    />
                );
            case 'product_grid':
                return (
                    <ProductGridEditor
                        config={config as SectionConfigMap['product_grid']}
                        onChange={handleConfigChange}
                    />
                );
            case 'category_grid':
                return (
                    <CategoryGridEditor
                        config={config as SectionConfigMap['category_grid']}
                        onChange={handleConfigChange}
                    />
                );
            case 'collection_banners':
                return (
                    <CollectionBannersEditor
                        config={config as SectionConfigMap['collection_banners']}
                        onChange={handleConfigChange}
                    />
                );
            case 'features':
                return (
                    <FeaturesEditor
                        config={config as SectionConfigMap['features']}
                        onChange={handleConfigChange}
                    />
                );
            case 'newsletter':
                return (
                    <NewsletterEditor
                        config={config as SectionConfigMap['newsletter']}
                        onChange={handleConfigChange}
                    />
                );
            case 'testimonials':
                return (
                    <TestimonialsEditor
                        config={config as SectionConfigMap['testimonials']}
                        onChange={handleConfigChange}
                    />
                );
            case 'promotional_cards':
                return (
                    <PromotionalCardsEditor
                        config={config as SectionConfigMap['promotional_cards']}
                        onChange={handleConfigChange}
                    />
                );
            case 'custom_html':
                return (
                    <CustomHtmlEditor
                        config={config as SectionConfigMap['custom_html']}
                        onChange={handleConfigChange}
                    />
                );
            default:
                return (
                    <Typography variant="body2" color="text.secondary">
                        No editor available for this section type.
                    </Typography>
                );
        }
    };

    return (
        <Box
            sx={{
                width: 340,
                bgcolor: 'background.paper',
                borderLeft: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
                            {meta?.icon ?? '📄'}
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                                {meta?.label ?? selectedSection.type}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {meta?.description}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => selectSection(null)}
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* Content */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2.5,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Section Title */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Section Title
                        </Typography>
                        <TextField
                            fullWidth
                            value={selectedSection.title ?? ''}
                            onChange={(e) => updateSectionTitle(selectedSection.id, e.target.value)}
                            placeholder={meta?.label ?? 'Enter title'}
                            size="small"
                            helperText="Optional title displayed above the section"
                        />
                    </Box>

                    <Divider />

                    {/* Section-specific Editor */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            Configuration
                        </Typography>
                        <EditorErrorBoundary onReset={() => selectSection(null)}>
                            {renderEditor()}
                        </EditorErrorBoundary>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
