'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import api from '@/lib/api';
import { useSettings } from '@/lib/context/SettingsContext';

interface Category {
    _id: string;
    name: string;
    description?: string;
    image?: string;
}

interface CategoryGridConfig {
    limit?: number;
}

interface CategoryGridProps {
    title?: string;
    config?: CategoryGridConfig;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ title, config = {} }) => {
    const { settings } = useSettings();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            const limit = config.limit || 8;
            const payload = response.data.data || response.data;
            if (Array.isArray(payload)) {
                setCategories(payload.slice(0, limit));
            } else {
                console.warn('Unexpected /categories response shape:', response.data);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="section" className="py-16">
            <Box className="container mx-auto px-4">
                <Box className="text-center mb-12">
                    <Typography variant="h4" component="h2" className="!font-bold text-gray-900 !mb-3 !text-2xl md:!text-4xl">
                        {title || 'Browse by Category'}
                    </Typography>
                    <Typography variant="body1" className="text-gray-600 !text-lg">
                        Explore our curated collections and find exactly what you need
                    </Typography>
                </Box>

                {loading ? (
                    <Grid container spacing={3}>
                        {[...Array(8)].map((_, i) => (
                            <Grid size={{ xs: 6, md: 4, lg: 3 }} key={i}>
                                <Skeleton variant="rounded" height={192} className="!rounded-2xl" />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <>
                        <Grid container spacing={3}>
                            {categories.map((category, index) => (
                                <Grid size={{ xs: 6, md: 4, lg: 3 }} key={category._id}>
                                    <Card
                                        component={Link}
                                        href={`/products?category=${category._id}`}
                                        className="group !rounded-2xl !overflow-hidden hover:!shadow-2xl transition-all duration-300 block !no-underline"
                                        sx={{
                                            background: 'linear-gradient(to bottom right, #fff, #f9fafb)',
                                            border: '2px solid #e5e7eb',
                                            textDecoration: 'none',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Featured Badge for first category */}
                                        {index === 0 && (
                                            <Chip
                                                label="Popular"
                                                size="small"
                                                className="!absolute !top-3 !right-3 !z-10 animate-pulse"
                                                sx={{
                                                    bgcolor: settings?.buttonColor || 'var(--color-button)',
                                                    color: '#fff',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        )}

                                        {category.image ? (
                                            <Box className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                                <CardMedia
                                                    component="img"
                                                    image={category.image}
                                                    alt={category.name}
                                                    className="!w-full !h-full !object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </Box>
                                        ) : (
                                            <Box className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                                <ShoppingCartOutlinedIcon
                                                    sx={{
                                                        fontSize: 80,
                                                        opacity: 0.5,
                                                        color: settings?.primaryColor || 'var(--color-primary)',
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        <CardContent className="!p-5">
                                            <Box className="flex items-center justify-between">
                                                <Typography variant="subtitle1" className="!font-bold text-gray-900">
                                                    {category.name}
                                                </Typography>
                                                <ChevronRightIcon className="text-gray-400 group-hover:translate-x-1 transition-all" />
                                            </Box>
                                            {category.description && (
                                                <Typography variant="body2" className="text-gray-500 !mt-1 line-clamp-2">
                                                    {category.description}
                                                </Typography>
                                            )}
                                        </CardContent>

                                        {/* Hover overlay */}
                                        <Box className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* View All Button */}
                        {categories.length >= (config.limit || 8) && (
                            <Box className="text-center mt-10">
                                <Button
                                    component={Link}
                                    href="/products"
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon />}
                                    className="!rounded-lg !shadow-lg hover:!shadow-xl !border-2"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        backgroundColor: settings?.buttonColor || 'var(--color-button)',
                                        borderColor: 'transparent',
                                        '&:hover': {
                                            backgroundColor: '#FFFFFF',
                                            color: '#000000',
                                            borderColor: settings?.buttonColor || 'var(--color-button)',
                                        },
                                    }}
                                >
                                    View All Categories
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default CategoryGrid;
