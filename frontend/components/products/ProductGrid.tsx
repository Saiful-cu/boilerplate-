'use client';

import Link from 'next/link';
import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Grid,
    Rating,
    Chip,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface Product {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    rating?: number;
    reviews?: unknown[];
    stock?: number;
    featured?: boolean;
}

interface ProductGridProps {
    products: Product[];
    handleQuickAdd: (e: React.MouseEvent, product: Product) => void;
    viewMode?: 'grid' | 'list';
}

export default function ProductGrid({ products, handleQuickAdd, viewMode: _viewMode = 'grid' }: ProductGridProps) {
    return (
        <Grid container spacing={2}>
            {products.map((product) => (
                <Grid size={{ xs: 6, md: 4, lg: 3 }} key={product._id}>
                    <Link href={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: '8px',
                                border: '1px solid #E8E8E8',
                                boxShadow: 'none',
                                transition: 'border-color 0.2s',
                                '&:hover': {
                                    borderColor: '#D0D0D0',
                                },
                                '&:hover .product-image': {
                                    transform: 'scale(1.03)',
                                },
                            }}
                        >
                            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                <CardMedia
                                    component="img"
                                    image={product.images[0] || 'https://via.placeholder.com/300'}
                                    alt={product.name}
                                    className="product-image"
                                    sx={{
                                        aspectRatio: '1',
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s',
                                    }}
                                />
                                {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
                                    <Chip
                                        label={`Only ${product.stock} left!`}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            backgroundColor: 'var(--color-primary)',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                )}
                                {product.featured && (
                                    <Chip
                                        icon={<span>⭐</span>}
                                        label="Featured"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'var(--color-accent)',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                )}
                            </Box>
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    mb={1}
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {product.name}
                                </Typography>

                                <Box display="flex" alignItems="center" mb={1}>
                                    <Rating
                                        value={product.rating || 0}
                                        precision={0.5}
                                        size="small"
                                        readOnly
                                        sx={{ color: '#faaf00' }}
                                    />
                                    <Typography variant="caption" color="text.secondary" ml={0.5}>
                                        ({product.reviews?.length || 0})
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={700}
                                        mb={1.5}
                                        sx={{ color: 'var(--color-primary)' }}
                                    >
                                        ৳{product.price}
                                    </Typography>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: '0.875rem' }}>
                                            ৳{product.originalPrice}
                                        </Typography>
                                    )}
                                </Box>

                                <Button
                                    variant="contained"
                                    size="small"
                                    fullWidth
                                    startIcon={
                                        product.stock && product.stock > 0 ? (
                                            <ShoppingCartIcon sx={{ fontSize: 16 }} />
                                        ) : undefined
                                    }
                                    disabled={!product.stock || product.stock === 0}
                                    onClick={(e) => handleQuickAdd(e, product)}
                                    sx={{
                                        mt: 'auto',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        borderRadius: '6px',
                                        py: 1,
                                        minHeight: 40,
                                        boxShadow: 'none',
                                        backgroundColor: 'var(--color-primary)',
                                        '&:hover': {
                                            backgroundColor: 'var(--color-button-hover)',
                                            boxShadow: 'none',
                                        },
                                        '&.Mui-disabled': { bgcolor: '#E8E8E8', color: '#9E9E9E' },
                                    }}
                                >
                                    {!product.stock || product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                </Grid>
            ))}
        </Grid>
    );
}
