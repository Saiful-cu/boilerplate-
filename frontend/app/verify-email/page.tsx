'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Alert,
    CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HomeIcon from '@mui/icons-material/Home';

export default function VerifyEmail() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [resending, setResending] = useState(false);

    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            verifyEmail();
        } else {
            setStatus('error');
            setMessage('No verification token provided.');
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await api.get(`/auth/verify-email/${token}`);

            setStatus('success');
            setMessage(response.data.message);

            if (response.data.token && response.data.user) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                toast.success('🎉 Email verified! Welcome to Noboraz!');

                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMessage = err.response?.data?.message || 'Verification failed';
            setStatus('error');
            setMessage(errorMessage);

            if (errorMessage.includes('expired')) {
                setStatus('expired');
            }
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setResending(true);
        try {
            await api.post('/auth/resend-verification', { email });
            toast.success('Verification email sent! Please check your inbox.');
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
            <Box sx={{ maxWidth: 450, width: '100%' }}>
                {/* Verifying State */}
                {status === 'verifying' && (
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 5, textAlign: 'center' }}>
                        <CircularProgress size={64} sx={{ mb: 3 }} />
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Verifying Your Email
                        </Typography>
                        <Typography color="text.secondary">
                            Please wait while we verify your email address...
                        </Typography>
                    </Paper>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 5, textAlign: 'center' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'success.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Email Verified!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            {message}
                        </Typography>
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            🎉 Redirecting you to the homepage...
                        </Alert>
                        <Button
                            component={Link}
                            href="/"
                            variant="contained"
                            color="success"
                            fullWidth
                            size="large"
                            startIcon={<HomeIcon />}
                            sx={{ borderRadius: 3, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                        >
                            Go to Homepage
                        </Button>
                    </Paper>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 5, textAlign: 'center' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'error.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Verification Failed
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            {message}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                component={Link}
                                href="/login"
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<LoginIcon />}
                                sx={{ borderRadius: 3, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                            >
                                Go to Login
                            </Button>
                            <Button
                                component={Link}
                                href="/register"
                                variant="outlined"
                                fullWidth
                                size="large"
                                startIcon={<PersonAddIcon />}
                                sx={{ borderRadius: 3, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                            >
                                Create New Account
                            </Button>
                        </Box>
                    </Paper>
                )}

                {/* Expired State */}
                {status === 'expired' && (
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 5 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    bgcolor: 'warning.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}
                            >
                                <AccessTimeIcon sx={{ fontSize: 48, color: 'warning.main' }} />
                            </Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                Link Expired
                            </Typography>
                            <Typography color="text.secondary">
                                Your verification link has expired. Please request a new one.
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                type="email"
                                label="Enter your email to resend verification"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 },
                                }}
                            />
                            <Button
                                onClick={handleResendVerification}
                                disabled={resending}
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={resending ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                                sx={{ borderRadius: 3, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                            >
                                {resending ? 'Sending...' : 'Resend Verification Email'}
                            </Button>
                            <Typography
                                component={Link}
                                href="/login"
                                color="primary"
                                sx={{
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Back to Login
                            </Typography>
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}
