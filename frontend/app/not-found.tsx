'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Typography, Button, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

/**
 * Not Found page for 404 errors
 */
export default function NotFound(): ReactNode {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                px: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    textAlign: 'center',
                    maxWidth: 520,
                    width: '100%',
                    p: 5,
                    bgcolor: 'transparent',
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '6rem', sm: '8rem' },
                        fontWeight: 800,
                        color: 'grey.200',
                        lineHeight: 1,
                        mb: 2,
                    }}
                >
                    404
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                    <SentimentDissatisfiedIcon sx={{ fontSize: 32, color: 'text.primary' }} />
                    <Typography variant="h4" fontWeight={700}>
                        Page Not Found
                    </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                    Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        justifyContent: 'center',
                    }}
                >
                    <Button
                        component={Link}
                        href="/"
                        variant="contained"
                        size="large"
                        startIcon={<HomeIcon />}
                        sx={{
                            borderRadius: 3,
                            py: 1.5,
                            px: 4,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        Go Home
                    </Button>
                    <Button
                        component={Link}
                        href="/products"
                        variant="outlined"
                        size="large"
                        startIcon={<ShoppingBagIcon />}
                        sx={{
                            borderRadius: 3,
                            py: 1.5,
                            px: 4,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        Browse Products
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
