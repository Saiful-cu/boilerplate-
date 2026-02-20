'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/context/AuthContext';
import { useSettings } from '@/lib/context/SettingsContext';
import { getAssetUrl } from '@/lib/api';
import api from '@/lib/api';
import {
    Alert,
    Button,
    Box,
    Typography,
    TextField,
    CircularProgress,
    IconButton,
    InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';
    const { login } = useAuth();
    const { settings } = useSettings();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [resending, setResending] = useState(false);

    const primaryColor = settings?.primaryColor || '#3B82F6';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setShowResendVerification(false);
        if (error) setError('');
    };

    const handleResendVerification = async () => {
        setResending(true);
        try {
            await api.post('/auth/resend-verification', { email: formData.email });
            toast.success('Verification email sent! Please check your inbox.');
        } catch {
            toast.error('Failed to send verification email. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowResendVerification(false);
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            if (user.role === 'admin') {
                toast.success('Welcome Admin! Redirecting to dashboard');
                router.push('/admin');
            } else {
                toast.success('Welcome back! Login successful.');
                router.push(redirectTo);
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; requiresVerification?: boolean } } };
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            if (err.response?.data?.requiresVerification) {
                setShowResendVerification(true);
                toast.error('Please verify your email first.');
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <ShoppingBagOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Curated Collections', desc: 'Hand-picked products just for you' },
        { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Fast Delivery', desc: 'Free shipping on orders over ৳1000' },
        { icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Secure Shopping', desc: '100% secure payment gateway' },
    ];

    return (
        <Box data-testid="login-page" sx={{ minHeight: '100vh', display: 'flex' }}>
            {/* ─── Left Panel: Brand / Illustration ─── */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    width: '48%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}aa 100%)`,
                    p: 6,
                }}
            >
                {/* Decorative circles */}
                <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
                <Box sx={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Box sx={{ position: 'absolute', top: '40%', right: '10%', width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 420, textAlign: 'center' }}>
                    {settings?.logo ? (
                        <img src={getAssetUrl(settings.logo)} alt="Logo" style={{ height: 56, margin: '0 auto 24px', filter: 'brightness(0) invert(1)' }} />
                    ) : (
                        <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 1, letterSpacing: '-0.02em' }}>
                            {settings?.siteName || 'Noboraz'}
                        </Typography>
                    )}

                    <Typography variant="h5" fontWeight={300} sx={{ color: 'rgba(255,255,255,0.9)', mb: 6, lineHeight: 1.4 }}>
                        Your one-stop shop for everything you love
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {features.map((f, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, textAlign: 'left', bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 3, p: 2, backdropFilter: 'blur(10px)' }}>
                                <Box sx={{ color: '#fff', p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex' }}>{f.icon}</Box>
                                <Box>
                                    <Typography fontWeight={600} sx={{ color: '#fff', fontSize: '0.95rem' }}>{f.title}</Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>{f.desc}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* ─── Right Panel: Login Form ─── */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: { xs: 3, sm: 6 },
                    py: 4,
                    bgcolor: '#fff',
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 420 }} data-testid="login-form-container">
                    {/* Mobile Logo */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
                        {settings?.logo ? (
                            <img src={getAssetUrl(settings.logo)} alt="Logo" style={{ height: 48, margin: '0 auto' }} />
                        ) : (
                            <Typography variant="h4" fontWeight={800} sx={{ color: primaryColor }}>
                                {settings?.siteName || 'Noboraz'}
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', mb: 0.5 }}>
                        Welcome back
                    </Typography>
                    <Typography sx={{ color: '#6B7280', mb: 4, fontSize: '0.95rem' }}>
                        Sign in to your account to continue shopping
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }} data-testid="login-error-message">
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} data-testid="login-form">
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            inputProps={{ 'data-testid': 'email-input' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2.5,
                                    bgcolor: '#F9FAFB',
                                    '&:hover fieldset': { borderColor: primaryColor },
                                    '&.Mui-focused fieldset': { borderColor: primaryColor },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: primaryColor },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            inputProps={{ 'data-testid': 'password-input' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                            {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2.5,
                                    bgcolor: '#F9FAFB',
                                    '&:hover fieldset': { borderColor: primaryColor },
                                    '&.Mui-focused fieldset': { borderColor: primaryColor },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: primaryColor },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            data-testid="login-submit-btn"
                            endIcon={!loading && <ArrowForwardIcon />}
                            sx={{
                                py: 1.6,
                                borderRadius: 2.5,
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                                bgcolor: primaryColor,
                                boxShadow: `0 4px 14px 0 ${primaryColor}44`,
                                '&:hover': { bgcolor: primaryColor, opacity: 0.9, boxShadow: `0 6px 20px 0 ${primaryColor}55` },
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CircularProgress size={20} color="inherit" />
                                    Signing in...
                                </Box>
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        {showResendVerification && (
                            <Alert severity="warning" sx={{ mt: 2.5, borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1.5 }}>
                                    Your email is not verified yet. Please check your inbox or request a new verification link.
                                </Typography>
                                <Button variant="contained" color="warning" fullWidth size="small" onClick={handleResendVerification} disabled={resending} sx={{ borderRadius: 2, textTransform: 'none' }}>
                                    {resending ? 'Sending...' : 'Resend Verification Email'}
                                </Button>
                            </Alert>
                        )}
                    </Box>

                    {/* Divider */}
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 3.5 }}>
                        <Box sx={{ flex: 1, height: '1px', bgcolor: '#E5E7EB' }} />
                        <Typography sx={{ px: 2, color: '#9CA3AF', fontSize: '0.8rem', fontWeight: 500 }}>OR</Typography>
                        <Box sx={{ flex: 1, height: '1px', bgcolor: '#E5E7EB' }} />
                    </Box>

                    {/* Demo Credentials */}
                    <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2.5, p: 2.5, border: '1px solid #F3F4F6' }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                            Demo Credentials
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                onClick={() => setFormData({ email: 'customer@example.com', password: 'customer123' })}
                                sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: primaryColor, color: primaryColor, bgcolor: `${primaryColor}08` } }}
                            >
                                Customer
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                onClick={() => setFormData({ email: 'admin@noboraz.com', password: 'admin123' })}
                                sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: primaryColor, color: primaryColor, bgcolor: `${primaryColor}08` } }}
                            >
                                Admin
                            </Button>
                        </Box>
                    </Box>

                    {/* Register Link */}
                    <Typography sx={{ mt: 4, textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>
                        Don&apos;t have an account?{' '}
                        <Typography
                            component={Link}
                            href="/register"
                            sx={{ fontWeight: 700, color: primaryColor, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            data-testid="register-link"
                        >
                            Create one
                        </Typography>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
