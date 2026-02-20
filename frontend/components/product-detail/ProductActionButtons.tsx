'use client';

import { Button, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface ProductActionButtonsProps {
    onAddToCart: () => void;
    onBuyNow: () => void;
    isOutOfStock: boolean;
    isMobile?: boolean;
}

export default function ProductActionButtons({
    onAddToCart,
    onBuyNow,
    isOutOfStock,
    isMobile = false,
}: ProductActionButtonsProps) {
    /* Daraz bottom bar style: Buy Now (teal outline) | Add to Cart (orange filled) */
    return (
        <Box display="flex" width="100%" alignItems="stretch" gap={0}>
            {/* Buy Now — left half */}
            <Button
                aria-label="Buy now"
                variant="text"
                onClick={onBuyNow}
                disabled={isOutOfStock}
                fullWidth
                sx={{
                    flex: 1,
                    py: isMobile ? 1.25 : 1.5,
                    borderRadius: 0,
                    fontWeight: 700,
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    textTransform: 'none',
                    color: 'var(--color-primary)',
                    bgcolor: isMobile ? 'rgba(var(--color-primary-rgb), 0.08)' : 'transparent',
                    borderRight: '1px solid',
                    borderColor: 'grey.200',
                    minHeight: isMobile ? 48 : 52,
                    '&:hover': { bgcolor: 'rgba(var(--color-primary-rgb), 0.12)' },
                    '&:active': { transform: 'scale(0.98)' },
                    '&.Mui-disabled': { color: 'grey.400' },
                    transition: 'all 0.15s',
                }}
            >
                Buy Now
            </Button>

            {/* Add to Cart — right half */}
            <Button
                aria-label="Add to cart"
                variant="contained"
                onClick={onAddToCart}
                disabled={isOutOfStock}
                startIcon={isMobile ? undefined : <ShoppingCartIcon sx={{ fontSize: 20 }} />}
                fullWidth
                sx={{
                    flex: 1,
                    py: isMobile ? 1.25 : 1.5,
                    borderRadius: 0,
                    fontWeight: 700,
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    textTransform: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    boxShadow: 'none',
                    minHeight: isMobile ? 48 : 52,
                    '&:hover': {
                        backgroundColor: 'var(--color-primary)',
                        filter: 'brightness(0.92)',
                    },
                    '&:active': { transform: 'scale(0.98)' },
                    '&.Mui-disabled': { bgcolor: 'grey.300', color: '#fff' },
                    transition: 'all 0.15s',
                }}
            >
                Add to Cart
            </Button>
        </Box>
    );
}
