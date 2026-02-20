'use client';

import Link from 'next/link';
import { useSettings } from '@/lib/context/SettingsContext';
import { getAssetUrl } from '@/lib/api';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Footer() {
    const { settings } = useSettings();

    const quickLinks = [
        { name: 'All Products', href: '/products' },
        { name: 'New Arrivals', href: '/products?sort=newest' },
        { name: 'Best Sellers', href: '/products?sort=popular' },
        { name: 'Special Offers', href: '/products?sort=price_asc' },
    ];

    const customerService = [
        { name: 'My Account', href: '/profile' },
        { name: 'Order Tracking', href: '/track-order' },
        { name: 'Help Center', href: '/help' },
        { name: 'My Orders', href: '/orders' },
    ];

    return (
        <Box
            component="footer"
            sx={{
                color: 'white',
                mt: 8,
                pb: { xs: 10, md: 0 },
                backgroundColor: settings?.footerBackgroundColor || '#1a202c',
            }}
        >
            {/* Newsletter Strip */}
            <Box
                sx={{
                    py: 2.5,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: `linear-gradient(135deg, ${settings?.buttonColor || 'var(--color-button)'}, ${settings?.primaryColor || 'var(--color-primary)'})`,
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', md: 'row' }}
                        alignItems="center"
                        justifyContent="space-between"
                        gap={2}
                    >
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography fontSize={24}>📧</Typography>
                            <Box>
                                <Typography fontWeight="bold" fontSize={18}>
                                    Subscribe to our Newsletter
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(191,219,254,1)' }}>
                                    Get special offers and updates delivered to your inbox
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" gap={1} width={{ xs: '100%', md: 'auto' }}>
                            <TextField
                                type="email"
                                placeholder="Enter your email"
                                size="small"
                                sx={{
                                    flex: 1,
                                    minWidth: { md: 288 },
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        '& fieldset': { border: 'none' },
                                    },
                                    '& .MuiInputBase-input': { color: 'grey.900' },
                                }}
                            />
                            <Button
                                variant="contained"
                                disableElevation
                                sx={{
                                    bgcolor: 'white',
                                    color: settings?.buttonColor || 'var(--color-button)',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 3,
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'grey.100' },
                                }}
                            >
                                Subscribe
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Main Footer Content */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Grid container spacing={{ xs: 4, lg: 6 }}>
                    {/* Brand Column */}
                    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                            {settings?.logo ? (
                                <img
                                    src={getAssetUrl(settings.logo)}
                                    alt={settings?.siteName || 'Logo'}
                                    className="h-12 w-auto brightness-0 invert"
                                />
                            ) : (
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">
                                        {settings?.siteName || 'Noboraz'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'cyan' }}>
                                        {settings?.siteTagline || 'Your Trusted Store'}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'grey.500', lineHeight: 1.7, mb: 3 }}>
                            Your trusted online shopping destination. We provide high-quality products at great prices with fast delivery across Bangladesh.
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1.5} mb={3}>
                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1.5, py: 0.75, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <VerifiedIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" fontWeight={500}>Authentic Products</Typography>
                            </Box>
                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1.5, py: 0.75, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <LocalShippingIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" fontWeight={500}>Fast Delivery</Typography>
                            </Box>
                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1.5, py: 0.75, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <LockIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" fontWeight={500}>Secure Payment</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                            <Box sx={{ width: 32, height: 2, borderRadius: 1, bgcolor: settings?.primaryColor || 'var(--color-primary)' }} />
                            <Typography variant="subtitle1" fontWeight="bold">Quick Links</Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="no-underline group flex items-center gap-1"
                                    style={{ color: '#9ca3af' }}
                                >
                                    <ArrowForwardIcon
                                        sx={{
                                            fontSize: 14,
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            color: settings?.primaryColor || 'var(--color-primary)',
                                            '.group:hover &': { opacity: 1 },
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{ transition: 'color 0.2s', '&:hover': { color: 'white' } }}
                                    >
                                        {link.name}
                                    </Typography>
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Customer Service */}
                    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                            <Box sx={{ width: 32, height: 2, borderRadius: 1, bgcolor: settings?.primaryColor || 'var(--color-primary)' }} />
                            <Typography variant="subtitle1" fontWeight="bold">Customer Service</Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            {customerService.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="no-underline group flex items-center gap-1"
                                    style={{ color: '#9ca3af' }}
                                >
                                    <ArrowForwardIcon
                                        sx={{
                                            fontSize: 14,
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            color: settings?.primaryColor || 'var(--color-primary)',
                                            '.group:hover &': { opacity: 1 },
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{ transition: 'color 0.2s', '&:hover': { color: 'white' } }}
                                    >
                                        {link.name}
                                    </Typography>
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Contact Info */}
                    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                            <Box sx={{ width: 32, height: 2, borderRadius: 1, bgcolor: settings?.primaryColor || 'var(--color-primary)' }} />
                            <Typography variant="subtitle1" fontWeight="bold">Contact Us</Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <EmailIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Email Us</Typography>
                                    <Typography
                                        component="a"
                                        href={`mailto:${settings?.email || 'support@noboraz.com'}`}
                                        variant="body2"
                                        sx={{ display: 'block', color: 'white', textDecoration: 'none', '&:hover': { color: 'grey.300' } }}
                                    >
                                        {settings?.email || 'support@noboraz.com'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <PhoneIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Call Us</Typography>
                                    <Typography
                                        component="a"
                                        href={`tel:${settings?.phone || '+8801234567890'}`}
                                        variant="body2"
                                        sx={{ display: 'block', color: 'white', textDecoration: 'none', '&:hover': { color: 'grey.300' } }}
                                    >
                                        {settings?.phone || '+8801234567890'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <LocationOnIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Visit Us</Typography>
                                    <Typography variant="body2">
                                        {settings?.address || 'Dhaka, Bangladesh'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Social Media */}
                        <Box display="flex" gap={1.5} mt={3}>
                            {settings?.facebook && (
                                <IconButton
                                    component="a"
                                    href={settings.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: '#1877f2', transform: 'scale(1.1)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <FacebookIcon fontSize="small" />
                                </IconButton>
                            )}
                            {settings?.instagram && (
                                <IconButton
                                    component="a"
                                    href={settings.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: '#e4405f', transform: 'scale(1.1)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <InstagramIcon fontSize="small" />
                                </IconButton>
                            )}
                            {settings?.twitter && (
                                <IconButton
                                    component="a"
                                    href={settings.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: '#1da1f2', transform: 'scale(1.1)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <TwitterIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Bottom Bar */}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ py: 3 }}>
                <Container maxWidth="lg">
                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems="center"
                        gap={2}
                    >
                        <Typography variant="body2" sx={{ color: 'grey.500' }}>
                            © {new Date().getFullYear()} {settings?.siteName || 'Noboraz'}. All rights reserved.
                        </Typography>
                        <Box display="flex" alignItems="center" gap={{ xs: 1.5, md: 3 }} flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                            <Link href="#" className="no-underline" style={{ color: '#9ca3af' }}>
                                <Typography variant="body2" sx={{ '&:hover': { color: 'white' }, transition: 'color 0.2s' }}>
                                    Privacy Policy
                                </Typography>
                            </Link>
                            <Link href="#" className="no-underline" style={{ color: '#9ca3af' }}>
                                <Typography variant="body2" sx={{ '&:hover': { color: 'white' }, transition: 'color 0.2s' }}>
                                    Terms of Service
                                </Typography>
                            </Link>
                            <Link href="#" className="no-underline" style={{ color: '#9ca3af' }}>
                                <Typography variant="body2" sx={{ '&:hover': { color: 'white' }, transition: 'color 0.2s' }}>
                                    Refund Policy
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
