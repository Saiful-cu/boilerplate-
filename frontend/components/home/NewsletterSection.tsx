'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSettings } from '@/lib/context/SettingsContext';

interface NewsletterConfig {
    title?: string;
    subtitle?: string;
}

interface NewsletterSectionProps {
    config?: NewsletterConfig;
}

const NewsletterSection: React.FC<NewsletterSectionProps> = ({ config = {} }) => {
    const { settings } = useSettings();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus(''), 3000);
        }, 1000);
    };

    const benefits = [
        { icon: '🎁', text: 'Exclusive deals & early access' },
        { icon: '✨', text: 'Expert tips & style guides' },
        { icon: '📦', text: 'New product launches' },
        { icon: '💰', text: 'Members-only discounts' },
    ];

    return (
        <Box
            component="section"
            className="relative text-white py-20 overflow-hidden"
            sx={{
                background: `linear-gradient(to bottom right, ${settings?.buttonColor || 'var(--color-button)'}, ${settings?.primaryColor || 'var(--color-primary)'}, ${settings?.secondaryColor || 'var(--color-secondary)'})`,
            }}
        >
            {/* Background Patterns */}
            <Box className="absolute inset-0 opacity-10">
                <Box className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <Box className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </Box>

            <Box className="container mx-auto px-4 relative z-10">
                <Box className="max-w-4xl mx-auto">
                    <Box className="text-center mb-10">
                        <Box
                            component="span"
                            className="inline-block backdrop-blur-sm px-4 py-2 rounded-full !text-sm !font-semibold mb-4"
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                        >
                            ✉️ JOIN OUR COMMUNITY
                        </Box>
                        <Typography variant="h3" component="h2" className="!font-bold !mb-4 !text-4xl md:!text-5xl" sx={{ color: '#fff' }}>
                            {config.title || 'Stay Updated with the Latest Offers'}
                        </Typography>
                        <Typography variant="h6" className="!mb-8 !text-xl" sx={{ color: 'rgba(219,234,254,1)' }}>
                            {config.subtitle ||
                                'Subscribe to get exclusive deals, new arrivals, and special offers delivered to your inbox!'}
                        </Typography>

                        {/* Benefits Grid */}
                        <Grid container spacing={2} className="!mb-10">
                            {benefits.map((benefit, index) => (
                                <Grid size={{ xs: 6, md: 3 }} key={index}>
                                    <Paper
                                        elevation={0}
                                        className="backdrop-blur-sm !rounded-xl !p-4 hover:!bg-white/20 transition"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    >
                                        <Typography variant="h4" className="!mb-2">
                                            {benefit.icon}
                                        </Typography>
                                        <Typography variant="body2" className="!font-medium">
                                            {benefit.text}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                        <Paper
                            elevation={6}
                            className="flex flex-col sm:flex-row gap-3 !rounded-2xl !p-2"
                            sx={{ bgcolor: '#fff' }}
                        >
                            <TextField
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                fullWidth
                                variant="standard"
                                InputProps={{
                                    disableUnderline: true,
                                    sx: { px: 2, py: 1, fontSize: '1.125rem' },
                                }}
                                sx={{ flex: 1 }}
                            />
                            <Button
                                type="submit"
                                disabled={status === 'loading'}
                                variant="contained"
                                size="large"
                                endIcon={status === 'loading' ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                                className="!rounded-xl !whitespace-nowrap !shadow-lg hover:!shadow-xl !border-2"
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    backgroundColor: settings?.buttonColor || 'var(--color-button)',
                                    borderColor: 'transparent',
                                    '&:hover': {
                                        backgroundColor: '#FFFFFF',
                                        color: '#000000',
                                        borderColor: settings?.buttonColor || 'var(--color-button)',
                                    },
                                    '&:disabled': { opacity: 0.5 },
                                }}
                            >
                                {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
                            </Button>
                        </Paper>

                        {status === 'success' && (
                            <Alert
                                icon={<CheckCircleIcon sx={{ color: 'rgba(134,239,172,1)' }} />}
                                className="!mt-5 !rounded-xl"
                                sx={{
                                    bgcolor: 'rgba(34,197,94,0.2)',
                                    border: '1px solid rgba(134,239,172,1)',
                                    color: 'rgba(220,252,231,1)',
                                }}
                            >
                                <Typography variant="body2" className="!font-semibold">
                                    Thanks for subscribing! Check your email for exclusive offers.
                                </Typography>
                            </Alert>
                        )}

                        <Typography variant="caption" className="!block text-center !mt-4" sx={{ color: 'rgba(191,219,254,1)' }}>
                            🔒 We respect your privacy. Unsubscribe at any time.
                        </Typography>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default NewsletterSection;
