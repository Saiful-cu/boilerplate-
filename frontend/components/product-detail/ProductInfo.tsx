'use client';

import { Box, Typography, Chip } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import IconButton from '@mui/material/IconButton';

interface Product {
    name: string;
    brand?: string;
    price?: number;
    originalPrice?: number;
    stock: number;
    rating?: number;
    numReviews?: number;
}

interface ProductInfoProps {
    product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const hasDiscount = product.originalPrice && product.originalPrice > (product.price || 0);
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice! - (product.price || 0)) / product.originalPrice!) * 100)
        : 0;

    return (
        <Box display="flex" flexDirection="column" gap={1.5}>
            {/* 1. Price row — Daraz: price + original + discount + wishlist/share */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
                    <Typography
                        component="span"
                        fontWeight={800}
                        sx={{ color: 'var(--color-primary)', fontSize: { xs: '1.5rem', sm: '1.75rem', lg: '2rem' }, lineHeight: 1 }}
                    >
                        ৳ {product.price?.toFixed(0)}
                    </Typography>
                    {hasDiscount && (
                        <>
                            <Typography
                                component="span"
                                sx={{ textDecoration: 'line-through', color: 'text.disabled', fontSize: { xs: '0.875rem', sm: '1rem' } }}
                            >
                                ৳ {product.originalPrice!.toFixed(0)}
                            </Typography>
                            <Chip
                                label={`-${discountPercent}%`}
                                size="small"
                                sx={{
                                    bgcolor: 'var(--color-accent)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    height: 22,
                                    borderRadius: 1,
                                }}
                            />
                        </>
                    )}
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <IconButton size="small" aria-label="Add to wishlist">
                        <FavoriteBorderIcon sx={{ fontSize: 22, color: 'text.secondary' }} />
                    </IconButton>
                    <IconButton size="small" aria-label="Share">
                        <ShareIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </IconButton>
                </Box>
            </Box>

            {/* 2. Product Name */}
            <Typography
                sx={{
                    fontSize: { xs: '0.95rem', sm: '1.1rem', lg: '1.25rem' },
                    fontWeight: 500,
                    color: 'text.primary',
                    lineHeight: 1.4,
                }}
            >
                {product.name}
            </Typography>

            {/* 3. Rating row — Daraz style: stars + number + (count) */}
            <Box display="flex" alignItems="center" gap={0.5}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        sx={{
                            fontSize: 16,
                            color: star <= Math.round(product.rating ?? 0) ? '#f5a623' : '#e0e0e0',
                        }}
                    />
                ))}
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                    {(product.rating ?? 0).toFixed(1)} ({product.numReviews ?? 0})
                </Typography>
            </Box>

            {/* 4. Stock */}
            <Box display="flex" alignItems="center" gap={0.75}>
                <FiberManualRecordIcon
                    sx={{
                        fontSize: 8,
                        color: product.stock > 0 ? '#22c55e' : '#ef4444',
                    }}
                />
                <Typography
                    sx={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: product.stock > 0 ? '#22c55e' : '#ef4444',
                    }}
                >
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </Typography>
            </Box>
        </Box>
    );
}
