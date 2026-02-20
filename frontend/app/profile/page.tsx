'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import AddressManager from '@/components/profile/AddressManager';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

export default function Profile() {
    const { user } = useAuth();

    const quickActions = [
        {
            href: '/orders',
            icon: '📦',
            label: 'My Orders',
            desc: 'View order history',
            gradient: 'linear-gradient(to bottom right, rgba(var(--color-primary-rgb), 0.1), rgba(var(--color-accent-rgb), 0.1))',
        },
        {
            href: '/products',
            icon: '🛍️',
            label: 'Shop Now',
            desc: 'Browse products',
            gradient: 'linear-gradient(to bottom right, rgba(var(--color-accent-rgb), 0.08), rgba(var(--color-primary-rgb), 0.08))',
        },
        {
            href: '/cart',
            icon: '🛒',
            label: 'My Cart',
            desc: 'View shopping cart',
            gradient: 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.08), rgba(20, 184, 166, 0.08))',
        },
    ];

    const infoFields = [
        { icon: '👤', label: 'Full Name', value: user?.name },
        { icon: '📧', label: 'Email Address', value: user?.email },
        {
            icon: '🎭',
            label: 'Role',
            value: user?.role === 'admin' ? '👑 Admin' : '🛍️ Customer',
        },
        {
            icon: '📅',
            label: 'Member Since',
            value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                })
                : 'Recently',
        },
    ];

    return (
        <Box className="bg-gray-50" minHeight="100vh" py={6}>
            <Box className="container mx-auto" px={2}>
                <Box maxWidth={900} mx="auto">
                    {/* Profile Header */}
                    <Paper
                        elevation={0}
                        sx={{
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            p: 4,
                            color: 'white',
                            background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={{ xs: 2, sm: 3 }}>
                            <Avatar
                                sx={{
                                    width: { xs: 64, sm: 96 },
                                    height: { xs: 64, sm: 96 },
                                    bgcolor: 'white',
                                    fontSize: { xs: '2rem', sm: '3rem' },
                                }}
                            >
                                👤
                            </Avatar>
                            <Box minWidth={0}>
                                <Typography variant="h4" fontWeight="bold" mb={1} fontSize={{ xs: '1.25rem', sm: '1.5rem', md: '2.125rem' }} noWrap>{user?.name}</Typography>
                                <Typography sx={{ opacity: 0.9, fontSize: { xs: '0.85rem', sm: '1rem' } }} noWrap>{user?.email}</Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Account Information */}
                    <Paper
                        elevation={3}
                        sx={{
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            borderBottomLeftRadius: 16,
                            borderBottomRightRadius: 16,
                            p: 4,
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold" mb={3}>Account Information</Typography>

                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {infoFields.map((field, idx) => (
                                <Grid size={{ xs: 12, md: 6 }} key={idx}>
                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="body2" color="text.secondary" mb={1}>
                                            {field.icon} {field.label}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ textTransform: field.label === 'Role' ? 'capitalize' : 'none' }}>
                                            {field.value}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="h6" fontWeight="bold" mb={2}>Quick Actions</Typography>
                        <Grid container spacing={2}>
                            {quickActions.map((action, idx) => (
                                <Grid size={{ xs: 12, md: 4 }} key={idx}>
                                    <Paper
                                        component={Link}
                                        href={action.href}
                                        elevation={0}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 2,
                                            borderRadius: 2,
                                            background: action.gradient,
                                            textDecoration: 'none',
                                            transition: 'box-shadow 0.3s',
                                            '&:hover': { boxShadow: 3 },
                                        }}
                                    >
                                        <Typography fontSize="2rem">{action.icon}</Typography>
                                        <Box>
                                            <Typography fontWeight={600} color="text.primary">{action.label}</Typography>
                                            <Typography variant="body2" color="text.secondary">{action.desc}</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    {/* Address Management Section */}
                    <Paper elevation={3} sx={{ borderRadius: 4, p: 4, mt: 3 }}>
                        <AddressManager />
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
