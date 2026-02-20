'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchIcon from '@mui/icons-material/Search';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function RegistrationSuccess() {
    const [email, setEmail] = useState('');
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('registrationEmail') || '';
        setEmail(storedEmail);
    }, []);

    const handleResendVerification = async () => {
        if (!email) {
            toast.error('Email address not found. Please register again.');
            return;
        }

        if (resendCooldown > 0) {
            toast.error(`Please wait ${resendCooldown} seconds before requesting again.`);
            return;
        }

        setResending(true);
        try {
            await api.post('/auth/resend-verification', { email });
            toast.success('Verification email sent! Please check your inbox.');

            setResendCooldown(60);
            const interval = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMessage = err.response?.data?.message || 'Failed to resend verification email';
            toast.error(errorMessage);
        } finally {
            setResending(false);
        }
    };

    return (
        <Box
            className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50"
            sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}
        >
            <Paper elevation={4} sx={{ maxWidth: 520, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                {/* Header */}
                <Box
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    sx={{ p: 5, textAlign: 'center' }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '10%',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <EmailIcon sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="white">
                        Check Your Email!
                    </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography color="text.secondary" sx={{ fontSize: '1.1rem', mb: 2 }}>
                            We&apos;ve sent a verification link to:
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                            {email || 'your email address'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click the link in the email to verify your account and start shopping!
                        </Typography>
                    </Box>

                    {/* Instructions */}
                    <Paper variant="outlined" sx={{ bgcolor: 'primary.50', borderColor: 'primary.200', borderRadius: 3, p: 3, mb: 3 }}>
                        <Typography fontWeight={600} color="primary.dark" sx={{ mb: 1 }}>
                            📝 Next Steps:
                        </Typography>
                        <List dense disablePadding>
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <InboxIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Open your email inbox"
                                    primaryTypographyProps={{ variant: 'body2', color: 'primary.dark' }}
                                />
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <SearchIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Look for an email from Noboraz"
                                    primaryTypographyProps={{ variant: 'body2', color: 'primary.dark' }}
                                />
                            </ListItem>
                            <ListItem disablePadding sx={{ mb: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <TouchAppIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary='Click the "Verify My Email" button'
                                    primaryTypographyProps={{ variant: 'body2', color: 'primary.dark' }}
                                />
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <ShoppingBagIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Start shopping! 🛍️"
                                    primaryTypographyProps={{ variant: 'body2', color: 'primary.dark' }}
                                />
                            </ListItem>
                        </List>
                    </Paper>

                    {/* Warning */}
                    <Alert
                        severity="warning"
                        icon={<WarningAmberIcon />}
                        sx={{ borderRadius: 3, mb: 3 }}
                    >
                        <Typography variant="body2">
                            <strong>Don&apos;t see the email?</strong> Check your spam/junk folder. The verification
                            link expires in 24 hours.
                        </Typography>
                    </Alert>

                    {/* Resend Button */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            onClick={handleResendVerification}
                            disabled={resending || resendCooldown > 0}
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={resending ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem',
                            }}
                        >
                            {resending
                                ? 'Sending...'
                                : resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : 'Resend Verification Email'}
                        </Button>

                        <Typography
                            component={Link}
                            href="/login"
                            variant="body2"
                            color="primary"
                            sx={{
                                textAlign: 'center',
                                fontWeight: 600,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                            }}
                        >
                            Already verified? Sign in here →
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
