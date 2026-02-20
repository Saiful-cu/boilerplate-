'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { FaShippingFast, FaLock, FaUndo, FaHeadset } from 'react-icons/fa';
import { useSettings } from '@/lib/context/SettingsContext';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

interface FeaturesSectionConfig {
    features?: Feature[];
}

interface FeaturesSectionProps {
    title?: string;
    config?: FeaturesSectionConfig;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ config = {} }) => {
    const { settings } = useSettings();

    const features: Feature[] = config.features || [
        {
            icon: 'shipping',
            title: 'Free Shipping',
            description: `On orders over ৳${settings?.freeShippingThreshold || '5,000'}`,
        },
        {
            icon: 'secure',
            title: 'Secure Payment',
            description: '100% secure checkout',
        },
        {
            icon: 'return',
            title: 'Easy Returns',
            description: '7 days return policy',
        },
        {
            icon: 'support',
            title: '24/7 Support',
            description: 'Dedicated customer care',
        },
    ];

    const getIcon = (iconName: string) => {
        const icons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
            shipping: FaShippingFast,
            secure: FaLock,
            return: FaUndo,
            support: FaHeadset,
        };
        const IconComponent = icons[iconName] || FaShippingFast;
        return (
            <IconComponent
                className="text-2xl"
                style={{ color: settings?.primaryColor || 'var(--color-primary)' }}
            />
        );
    };

    return (
        <Box component="section" className="py-12 md:py-16 bg-white border-t border-b border-gray-200">
            <Box className="container mx-auto px-4">
                <Grid container spacing={{ xs: 3, md: 4 }}>
                    {features.map((feature, index) => (
                        <Grid size={{ xs: 6, md: 3 }} key={index}>
                            <Paper elevation={0} className="text-center !bg-transparent">
                                <Box
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                                    sx={{
                                        backgroundColor: `${settings?.primaryColor || 'var(--color-primary)'}20`,
                                    }}
                                >
                                    {getIcon(feature.icon)}
                                </Box>
                                <Typography variant="subtitle2" className="!font-bold text-gray-900 !mb-1 !text-sm md:!text-base">
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 !text-xs md:!text-sm">
                                    {feature.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default FeaturesSection;
