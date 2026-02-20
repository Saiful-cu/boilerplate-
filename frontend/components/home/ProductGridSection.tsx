'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StarIcon from '@mui/icons-material/Star';
import api from '@/lib/api';
import { useSettings } from '@/lib/context/SettingsContext';

interface Product {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    images?: string[];
    onSale?: boolean;
    featured?: boolean;
    rating?: number;
    reviews?: unknown[];
    stock?: number;
}

interface ProductGridConfig {
    productType?: string;
    showTabs?: boolean;
    showViewAll?: boolean;
    limit?: number;
}

interface ProductGridSectionProps {
    title?: string;
    config?: ProductGridConfig;
}

const ProductGridSection: React.FC<ProductGridSectionProps> = ({ title = 'Products', config = {} }) => {
    const { settings } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const tabs = config.showTabs
        ? [
            { id: 'all', label: 'All' },
            { id: 'new_arrivals', label: 'New Arrivals' },
            { id: 'featured', label: 'Featured' },
            { id: 'on_sale', label: 'On Sale' },
        ]
        : [];

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (config.productType) {
                if (config.productType === 'best_sellers') params.append('sort', 'sales');
                if (config.productType === 'new_arrivals') params.append('sort', '-createdAt');
                if (config.productType === 'featured') params.append('featured', 'true');
            }

            if (config.showTabs && activeTab !== 'all') {
                if (activeTab === 'new_arrivals') params.append('sort', '-createdAt');
                if (activeTab === 'featured') params.append('featured', 'true');
                if (activeTab === 'on_sale') params.append('onSale', 'true');
            }

            params.append('limit', String(config.limit || 4));

            const response = await api.get(`/products?${params.toString()}`);
            setProducts(response.data.products || response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="section" className="py-16 md:py-24 bg-gray-50">
            <Box className="container mx-auto px-4">
                {/* Section Header */}
                <Box className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
                    <Box>
                        <Typography variant="h4" component="h2" className="!font-bold text-gray-900 !mb-2 !text-3xl md:!text-4xl">
                            {title}
                        </Typography>
                        <Typography variant="body1" className="text-gray-600">
                            Handpicked products just for you
                        </Typography>
                    </Box>
                    {config.showViewAll !== false && (
                        <Button
                            component={Link}
                            href="/products"
                            endIcon={<ArrowForwardIcon />}
                            className="!mt-4 md:!mt-0 !transition-all"
                            sx={{
                                color: settings?.primaryColor || 'var(--color-primary)',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': { opacity: 0.8 },
                            }}
                        >
                            View All
                        </Button>
                    )}
                </Box>

                {/* Tabs */}
                {config.showTabs && (
                    <Box className="flex flex-wrap gap-3 mb-10">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                variant={activeTab === tab.id ? 'contained' : 'outlined'}
                                className="!rounded-full !transition-all"
                                sx={{
                                    px: 3,
                                    py: 1,
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    ...(activeTab === tab.id
                                        ? {
                                            backgroundColor: settings?.primaryColor || 'var(--color-primary)',
                                            color: '#fff',
                                            boxShadow: 2,
                                            '&:hover': {
                                                backgroundColor: settings?.primaryColor || 'var(--color-primary)',
                                                opacity: 0.9,
                                            },
                                        }
                                        : {
                                            backgroundColor: '#fff',
                                            color: '#374151',
                                            borderColor: '#e5e7eb',
                                            '&:hover': { backgroundColor: '#f3f4f6' },
                                        }),
                                }}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </Box>
                )}

                {loading ? (
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {[...Array(config.limit || 4)].map((_, i) => (
                            <Grid size={{ xs: 6, md: 4, lg: 3 }} key={i}>
                                <Card className="!rounded-xl !overflow-hidden">
                                    <Skeleton variant="rectangular" sx={{ paddingTop: '100%' }} />
                                    <CardContent className="!space-y-3">
                                        <Skeleton variant="text" height={20} />
                                        <Skeleton variant="text" height={20} width="66%" />
                                        <Skeleton variant="rectangular" height={32} className="!rounded" />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : products.length === 0 ? (
                    <Box className="text-center py-12">
                        <ShoppingBagOutlinedIcon sx={{ fontSize: 96, color: '#d1d5db', mb: 2 }} />
                        <Typography variant="h5" className="!font-semibold text-gray-700 !mb-2">
                            No Products Available
                        </Typography>
                        <Typography variant="body1" className="text-gray-500">
                            Check back soon for new products!
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {products.map((product) => (
                            <Grid size={{ xs: 6, md: 4, lg: 3 }} key={product._id}>
                                <Card
                                    className="group !rounded-xl !overflow-hidden hover:!shadow-xl transition-shadow duration-300"
                                    sx={{ bgcolor: '#fff' }}
                                >
                                    <Link href={`/products/${product._id}`}>
                                        {/* Image */}
                                        <Box className="relative aspect-square overflow-hidden bg-gray-100">
                                            <CardMedia
                                                component="img"
                                                image={product.images?.[0] || '/placeholder.jpg'}
                                                alt={product.name}
                                                className="!w-full !h-full !object-cover group-hover:scale-110 transition-transform duration-500"
                                            />

                                            {/* Badges */}
                                            {product.onSale && (
                                                <Chip
                                                    label="SALE"
                                                    size="small"
                                                    className="!absolute !top-3 !left-3"
                                                    sx={{
                                                        bgcolor: '#ef4444',
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            )}
                                            {!product.onSale && product.featured && (
                                                <Chip
                                                    label="BESTSELLER"
                                                    size="small"
                                                    className="!absolute !top-3 !left-3"
                                                    sx={{
                                                        bgcolor: settings?.buttonColor || 'var(--color-button)',
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            )}

                                            {/* Quick Add */}
                                            <Box className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4">
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    size="small"
                                                    className="!rounded-lg !transition-colors"
                                                    sx={{
                                                        bgcolor: '#fff',
                                                        color: '#111827',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem',
                                                        textTransform: 'none',
                                                        '&:hover': { bgcolor: '#f3f4f6' },
                                                    }}
                                                >
                                                    Quick View
                                                </Button>
                                            </Box>
                                        </Box>

                                        {/* Product Info */}
                                        <CardContent>
                                            <Typography
                                                variant="body2"
                                                className="!font-medium text-gray-900 !mb-2 line-clamp-2 !min-h-[2.5rem]"
                                            >
                                                {product.name}
                                            </Typography>

                                            {/* Price */}
                                            <Box className="flex items-center gap-2 mb-3">
                                                {product.salePrice ? (
                                                    <>
                                                        <Typography variant="body1" className="!text-lg !font-bold text-gray-900">
                                                            ৳{product.salePrice}
                                                        </Typography>
                                                        <Typography variant="body2" className="!text-sm text-gray-400 !line-through">
                                                            ৳{product.price}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Typography variant="body1" className="!text-lg !font-bold text-gray-900">
                                                        ৳{product.price}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Rating */}
                                            <Box className="flex items-center gap-1">
                                                <Box className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon key={i} sx={{ fontSize: 16, color: '#facc15' }} />
                                                    ))}
                                                </Box>
                                                <Typography variant="caption" className="text-gray-500">
                                                    (4.5)
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Link>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default ProductGridSection;
