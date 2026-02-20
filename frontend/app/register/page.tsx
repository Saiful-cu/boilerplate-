'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
    LinearProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 20, label: 'Weak', color: '#EF4444' };
    if (score <= 2) return { score: 40, label: 'Fair', color: '#F59E0B' };
    if (score <= 3) return { score: 60, label: 'Good', color: '#F97316' };
    if (score <= 4) return { score: 80, label: 'Strong', color: '#22C55E' };
    return { score: 100, label: 'Very Strong', color: '#16A34A' };
}

export default function Register() {
    const router = useRouter();
    const { settings } = useSettings();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const primaryColor = settings?.primaryColor || '#3B82F6';
    const strength = formData.password ? getPasswordStrength(formData.password) : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/register', formData);

            if (response.data.requiresVerification) {
                toast.success('Account created! Please check your email to verify.');
                sessionStorage.setItem('registrationEmail', formData.email);
                router.push('/registration-success');
            } else {
                toast.success('Account created successfully! Welcome aboard!');
                router.push('/login');
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const perks = [
        { icon: <CardGiftcardOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Exclusive Deals', desc: 'Members-only discounts & offers' },
        { icon: <StarOutlineIcon sx={{ fontSize: 28 }} />, title: 'Order Tracking', desc: 'Real-time updates on every order' },
        { icon: <SupportAgentOutlinedIcon sx={{ fontSize: 28 }} />, title: 'Priority Support', desc: 'Dedicated help when you need it' },
    ];

    const inputSx = {
        mb: 2.5,
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            bgcolor: '#F9FAFB',
            '&:hover fieldset': { borderColor: primaryColor },
            '&.Mui-focused fieldset': { borderColor: primaryColor },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: primaryColor },
    };

    return (
        <Box data-testid="register-page" sx={{ minHeight: '100vh', display: 'flex' }}>
            {/* ─── Left Panel: Form ─── */}
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
                <Box sx={{ width: '100%', maxWidth: 420 }} data-testid="register-form-container">
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
                        Create account
                    </Typography>
                    <Typography sx={{ color: '#6B7280', mb: 4, fontSize: '0.95rem' }}>
                        Join us and start discovering amazing products
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }} data-testid="register-error-message">
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} data-testid="register-form">
                        <TextField
                            fullWidth
                            label="Full Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            autoComplete="name"
                            inputProps={{ 'data-testid': 'name-input' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputSx}
                        />

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
                            sx={inputSx}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            required
                            autoComplete="new-password"
                            inputProps={{ 'data-testid': 'password-input', minLength: 6 }}
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
                                mb: strength ? 1 : 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2.5,
                                    bgcolor: '#F9FAFB',
                                    '&:hover fieldset': { borderColor: primaryColor },
                                    '&.Mui-focused fieldset': { borderColor: primaryColor },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: primaryColor },
                            }}
                        />

                        {/* Password Strength Indicator */}
                        {strength && (
                            <Box sx={{ mb: 3 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={strength.score}
                                    sx={{
                                        height: 4,
                                        borderRadius: 2,
                                        bgcolor: '#E5E7EB',
                                        mb: 0.5,
                                        '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 2 },
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Min. 6 characters</Typography>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: strength.color }}>{strength.label}</Typography>
                                </Box>
                            </Box>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            data-testid="register-submit-btn"
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
                                    Creating Account...
                                </Box>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </Box>

                    {/* Terms notice */}
                    <Typography sx={{ mt: 2.5, textAlign: 'center', color: '#9CA3AF', fontSize: '0.75rem', lineHeight: 1.5 }}>
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                    </Typography>

                    {/* Login Link */}
                    <Typography sx={{ mt: 3, textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>
                        Already have an account?{' '}
                        <Typography
                            component={Link}
                            href="/login"
                            sx={{ fontWeight: 700, color: primaryColor, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            data-testid="login-link"
                        >
                            Sign in
                        </Typography>
                    </Typography>
                </Box>
            </Box>

            {/* ─── Right Panel: Brand / Perks ─── */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    width: '48%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${primaryColor}aa 0%, ${primaryColor}dd 50%, ${primaryColor} 100%)`,
                    p: 6,
                }}
            >
                {/* Decorative shapes */}
                <Box sx={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
                <Box sx={{ position: 'absolute', bottom: -100, right: -40, width: 350, height: 350, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Box sx={{ position: 'absolute', top: '50%', left: '15%', width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 420, textAlign: 'center' }}>
                    {settings?.logo ? (
                        <img src={getAssetUrl(settings.logo)} alt="Logo" style={{ height: 56, margin: '0 auto 24px', filter: 'brightness(0) invert(1)' }} />
                    ) : (
                        <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 1, letterSpacing: '-0.02em' }}>
                            {settings?.siteName || 'Noboraz'}
                        </Typography>
                    )}

                    <Typography variant="h5" fontWeight={300} sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.4 }}>
                        Join thousands of happy shoppers
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 5, mt: 3 }}>
                        {[
                            { value: '10K+', label: 'Products' },
                            { value: '50K+', label: 'Customers' },
                            { value: '4.8', label: 'Rating' },
                        ].map((stat, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Typography fontWeight={800} sx={{ color: '#fff', fontSize: '1.5rem' }}>{stat.value}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{stat.label}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {perks.map((p, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, textAlign: 'left', bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 3, p: 2, backdropFilter: 'blur(10px)' }}>
                                <Box sx={{ color: '#fff', p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex' }}>{p.icon}</Box>
                                <Box>
                                    <Typography fontWeight={600} sx={{ color: '#fff', fontSize: '0.95rem' }}>{p.title}</Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>{p.desc}</Typography>
                                </Box>
                                <CheckCircleOutlineIcon sx={{ ml: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
