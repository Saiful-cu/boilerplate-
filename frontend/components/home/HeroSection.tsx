'use client';

import React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import StarIcon from '@mui/icons-material/Star';
import { useSettings } from '@/lib/context/SettingsContext';

interface HeroSectionConfig {
    title?: string;
    subtitle?: string;
    showButton?: boolean;
    buttonLink?: string;
    buttonText?: string;
}

interface HeroSectionProps {
    config?: HeroSectionConfig;
}

const HeroSection: React.FC<HeroSectionProps> = ({ config = {} }) => {
    const { settings } = useSettings();
    const primaryColor = settings?.primaryColor || '#3B82F6';
    const buttonColor = settings?.buttonColor || '#3B82F6';

    return (
        <Box component="section" className="relative overflow-hidden">
            {/* Background Gradient */}
            <Box
                className="absolute inset-0 -z-10"
                sx={{
                    background: `linear-gradient(135deg, ${primaryColor}08 0%, ${primaryColor}15 50%, ${primaryColor}05 100%)`,
                }}
            />

            <Box className="container mx-auto px-4 py-16 md:py-24 lg:py-28">
                <Grid container spacing={{ md: 6, lg: 8 }} alignItems="center">
                    {/* Left Content */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box className="space-y-8 animate-fade-in">
                            <Box className="inline-block">
                                <Chip
                                    label="✨ Premium Quality Products"
                                    size="small"
                                    sx={{
                                        backgroundColor: `${primaryColor}15`,
                                        color: primaryColor,
                                        fontWeight: 600,
                                        letterSpacing: '0.025em',
                                        px: 1,
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="h2"
                                component="h1"
                                className="!font-bold text-gray-900 !leading-[1.1] font-heading !text-4xl md:!text-5xl lg:!text-6xl"
                            >
                                {config.title || (
                                    <>
                                        Discover Amazing
                                        <br />
                                        <Box component="span" sx={{ color: primaryColor }}>Products</Box> For You
                                    </>
                                )}
                            </Typography>

                            <Typography variant="body1" className="!text-lg text-gray-600 !leading-relaxed max-w-lg">
                                {config.subtitle ||
                                    'Explore our curated collection of premium products. Quality you can trust, prices you\'ll love, and service that goes the extra mile.'}
                            </Typography>

                            {config.showButton !== false && (
                                <Box className="flex flex-wrap gap-4 pt-2">
                                    <Button
                                        component={Link}
                                        href={config.buttonLink || '/products'}
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForwardIcon className="transition-transform group-hover:translate-x-1" />}
                                        className="group !rounded-xl hover:!-translate-y-0.5 transition-all duration-300"
                                        sx={{
                                            px: 4,
                                            py: 2,
                                            fontWeight: 600,
                                            fontSize: '1.125rem',
                                            textTransform: 'none',
                                            backgroundColor: buttonColor,
                                            boxShadow: `0 10px 30px ${buttonColor}40`,
                                            '&:hover': {
                                                backgroundColor: buttonColor,
                                                boxShadow: `0 15px 35px ${buttonColor}50`,
                                            },
                                        }}
                                    >
                                        {config.buttonText || 'Shop Now'}
                                    </Button>
                                    <Button
                                        component={Link}
                                        href="/products"
                                        variant="outlined"
                                        size="large"
                                        className="!rounded-xl transition-all duration-300"
                                        sx={{
                                            px: 4,
                                            py: 2,
                                            fontWeight: 600,
                                            fontSize: '1.125rem',
                                            textTransform: 'none',
                                            borderColor: '#e5e7eb',
                                            borderWidth: 2,
                                            color: '#374151',
                                            '&:hover': {
                                                borderColor: '#d1d5db',
                                                bgcolor: '#f9fafb',
                                                borderWidth: 2,
                                            },
                                        }}
                                    >
                                        Browse Categories
                                    </Button>
                                </Box>
                            )}

                            {/* Trust Indicators */}
                            <Box className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200">
                                <Box className="flex items-center gap-2">
                                    <Box className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircleIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                                    </Box>
                                    <Typography variant="body2" className="!font-medium text-gray-600">
                                        Free Shipping
                                    </Typography>
                                </Box>
                                <Box className="flex items-center gap-2">
                                    <Box className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <ShieldIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                                    </Box>
                                    <Typography variant="body2" className="!font-medium text-gray-600">
                                        Secure Payment
                                    </Typography>
                                </Box>
                                <Box className="flex items-center gap-2">
                                    <Box className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <StarIcon sx={{ fontSize: 20, color: '#eab308' }} />
                                    </Box>
                                    <Typography variant="body2" className="!font-medium text-gray-600">
                                        Top Rated
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Content - Modern Visual */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Box className="relative">
                            <Box className="relative z-10">
                                <Paper
                                    elevation={0}
                                    className="!rounded-3xl p-10 lg:p-14 backdrop-blur-sm"
                                    sx={{
                                        background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}20)`,
                                        border: `1px solid ${primaryColor}20`,
                                    }}
                                >
                                    <Grid container spacing={2.5}>
                                        {/* Stat Cards */}
                                        {[
                                            { emoji: '🛍️', value: '500K+', label: 'Products Sold' },
                                            { emoji: '⭐', value: '4.9/5', label: 'Customer Rating' },
                                            { emoji: '🚚', value: 'Free', label: 'Fast Delivery' },
                                            { emoji: '🔒', value: '100%', label: 'Secure Payment' },
                                        ].map((stat, i) => (
                                            <Grid size={6} key={i}>
                                                <Paper
                                                    elevation={2}
                                                    className="!rounded-2xl !p-6 hover:!shadow-xl transition-shadow"
                                                    sx={{ bgcolor: '#fff' }}
                                                >
                                                    <Typography variant="h4" className="!mb-2">
                                                        {stat.emoji}
                                                    </Typography>
                                                    <Typography variant="h5" className="!font-bold text-gray-900">
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography variant="body2" className="text-gray-500">
                                                        {stat.label}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            </Box>
                            {/* Decorative Blurred Circles */}
                            <Box
                                className="absolute -top-10 -right-10 w-60 h-60 rounded-full opacity-20 blur-3xl -z-0"
                                sx={{ backgroundColor: primaryColor }}
                            />
                            <Box
                                className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-15 blur-3xl -z-0"
                                sx={{ backgroundColor: primaryColor }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default HeroSection;
