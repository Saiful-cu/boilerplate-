'use client';

import React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';

interface Banner {
    title: string;
    subtitle: string;
    link: string;
    gradient: string;
    image?: string;
}

interface CollectionBannersConfig {
    banners?: Banner[];
}

interface CollectionBannersProps {
    config?: CollectionBannersConfig;
}

const CollectionBanners: React.FC<CollectionBannersProps> = ({ config = {} }) => {
    const banners: Banner[] = config.banners || [
        {
            title: 'Top Trending Products',
            subtitle: 'Discover the latest trends',
            link: '/products?featured=true',
            gradient: 'from-blue-500 to-purple-600',
        },
        {
            title: 'Premium Collection',
            subtitle: 'Quality you can trust',
            link: '/products?sort=-price',
            gradient: 'from-pink-500 to-red-600',
        },
    ];

    return (
        <Box component="section" className="py-12 bg-gray-50">
            <Box className="container mx-auto px-4">
                <Grid container spacing={3}>
                    {banners.map((banner, index) => (
                        <Grid size={{ xs: 12, md: 6 }} key={index}>
                            <Card
                                component={Link}
                                href={banner.link}
                                className="group relative !h-80 !rounded-lg !overflow-hidden block !no-underline"
                                sx={{ textDecoration: 'none' }}
                            >
                                <Box
                                    className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-90 group-hover:opacity-100 transition`}
                                />
                                {banner.image && (
                                    <CardMedia
                                        component="img"
                                        image={banner.image}
                                        alt={banner.title}
                                        className="absolute inset-0 !w-full !h-full !object-cover mix-blend-overlay"
                                    />
                                )}
                                <Box className="relative h-full flex flex-col items-center justify-center text-white p-8 text-center">
                                    <Typography variant="h4" component="h3" className="!font-bold !mb-2 !text-3xl">
                                        {banner.title}
                                    </Typography>
                                    <Typography variant="body1" className="!mb-4 !text-lg">
                                        {banner.subtitle}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        className="!rounded-lg transition"
                                        sx={{
                                            bgcolor: '#fff',
                                            color: '#111827',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#f3f4f6' },
                                        }}
                                    >
                                        Shop Now
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default CollectionBanners;
