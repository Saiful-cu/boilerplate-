'use client';

import Link from 'next/link';
import {
    Box,
    Typography,
    Button,
} from '@mui/material';
import {
    ShoppingBag as ShoppingBagIcon,
    Home as HomeIcon,
} from '@mui/icons-material';

export default function EmptyCart() {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
            {/* Brand stripe */}
            <Box sx={{ height: 3, bgcolor: 'var(--color-primary)' }} />

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    py: { xs: 8, sm: 12 },
                }}
            >
                <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
                    {/* Cart Icon */}
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: 'rgba(var(--color-primary-rgb), 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                        }}
                    >
                        <Typography sx={{ fontSize: '2.5rem', lineHeight: 1 }}>🛒</Typography>
                    </Box>

                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: '#212121',
                            fontFamily: 'var(--font-heading)',
                            mb: 1,
                        }}
                    >
                        Your Cart is Empty
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#9E9E9E', mb: 3, lineHeight: 1.6, fontSize: '0.82rem' }}>
                        Looks like you haven&apos;t added anything yet.
                        Start shopping and discover amazing products!
                    </Typography>

                    {/* Benefits */}
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            { icon: '🚚', label: 'Free Shipping' },
                            { icon: '💰', label: 'Best Prices' },
                            { icon: '↩️', label: 'Easy Returns' },
                        ].map((benefit) => (
                            <Box
                                key={benefit.label}
                                sx={{
                                    bgcolor: '#fff',
                                    border: '1px solid #E8E8E8',
                                    borderRadius: '8px',
                                    px: 2,
                                    py: 1.5,
                                    textAlign: 'center',
                                    minWidth: 100,
                                }}
                            >
                                <Typography sx={{ fontSize: '1.25rem', mb: 0.5 }}>
                                    {benefit.icon}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#757575', fontWeight: 500, fontSize: '0.72rem' }}>
                                    {benefit.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, justifyContent: 'center' }}>
                        <Button
                            component={Link}
                            href="/products"
                            variant="contained"
                            startIcon={<ShoppingBagIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                px: 3,
                                py: 1.25,
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                textTransform: 'none',
                                boxShadow: 'none',
                                bgcolor: 'var(--color-primary)',
                                '&:hover': { boxShadow: 'none', bgcolor: 'var(--color-button-hover)' },
                            }}
                        >
                            Start Shopping
                        </Button>

                        <Button
                            component={Link}
                            href="/"
                            variant="outlined"
                            startIcon={<HomeIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                px: 3,
                                py: 1.25,
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                textTransform: 'none',
                                borderColor: '#E8E8E8',
                                color: '#757575',
                                '&:hover': {
                                    borderColor: 'var(--color-primary)',
                                    color: 'var(--color-primary)',
                                    bgcolor: 'rgba(var(--color-primary-rgb), 0.04)',
                                },
                            }}
                        >
                            Go Home
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
