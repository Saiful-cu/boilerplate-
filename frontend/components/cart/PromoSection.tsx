'use client';

import {
    Paper,
    Box,
    Typography,
} from '@mui/material';
import {
    AutoAwesome as SparkleIcon,
    Inventory2 as PackageIcon,
    AccountBalanceWallet as WalletIcon,
    Replay as ReturnIcon,
    Lock as SecureIcon,
} from '@mui/icons-material';

const benefits = [
    {
        icon: <PackageIcon sx={{ color: 'white', fontSize: 24 }} />,
        title: 'Free Shipping',
        description: 'On all orders with no minimum purchase',
    },
    {
        icon: <WalletIcon sx={{ color: 'white', fontSize: 24 }} />,
        title: 'Cash on Delivery',
        description: 'Pay when you receive your order',
    },
    {
        icon: <ReturnIcon sx={{ color: 'white', fontSize: 24 }} />,
        title: 'Easy Returns',
        description: '7-day hassle-free return policy',
    },
    {
        icon: <SecureIcon sx={{ color: 'white', fontSize: 24 }} />,
        title: 'Secure Payment',
        description: 'Your data is safe with us',
    },
];

export default function PromoSection() {
    return (
        <Paper
            elevation={4}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-button-hover), var(--color-accent))',
                border: '1px solid',
                borderColor: 'primary.400',
            }}
        >
            <Box sx={{ p: 3, color: 'white' }}>
                <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <SparkleIcon />
                    Shopping Benefits
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {benefits.map((benefit) => (
                        <Paper
                            key={benefit.title}
                            elevation={0}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                borderRadius: 2,
                                p: 1.5,
                                backdropFilter: 'blur(8px)',
                                transition: 'background-color 0.2s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            }}
                        >
                            <Box
                                sx={{
                                    flexShrink: 0,
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {benefit.icon}
                            </Box>
                            <Box>
                                <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25, color: 'white' }}>
                                    {benefit.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(219,234,254,0.9)' }}>
                                    {benefit.description}
                                </Typography>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}
