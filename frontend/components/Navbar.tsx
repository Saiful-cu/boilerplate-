'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { useAuth } from '@/lib/context/AuthContext';

// Render-dependent UI (cart count) must avoid SSR/CSR mismatch — use mounted guard below

import { useCart } from '@/lib/context/CartContext';
import { useSettings } from '@/lib/context/SettingsContext';
import api, { getAssetUrl } from '@/lib/api';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const { settings } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [_showCategories, _setShowCategories] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();

    // Prevent hydration mismatch for cart count (server may render empty while client has items)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const userMenuOpen = Boolean(anchorEl);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const handleUserMenuOpen = (e: MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <header className="sticky-modern" data-testid="main-header">
            {/* Top Bar */}
            <Box
                sx={{
                    color: 'white',
                    py: 1,
                    background: `linear-gradient(135deg, ${settings?.buttonColor || 'var(--color-button)'}, ${settings?.primaryColor || 'var(--color-primary)'})`,
                }}
                className="shadow-modern-sm"
            >
                <Box className="container mx-auto px-4">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <EmailIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                                {settings?.siteTagline || 'Your Trusted Ecommerce Store'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems="center" gap={3}>
                            <Link href="/track-order" className="flex items-center gap-1 hover:opacity-80 transition-all text-sm text-white no-underline">
                                <LocalShippingIcon sx={{ fontSize: 16 }} />
                                Track Order
                            </Link>
                            <Link href="/help" className="flex items-center gap-1 hover:opacity-80 transition-all text-sm text-white no-underline">
                                <HelpOutlineIcon sx={{ fontSize: 16 }} />
                                Help
                            </Link>
                            <Typography variant="body2" sx={{ color: 'rgba(191,219,254,1)' }}>|</Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOnIcon sx={{ fontSize: 16 }} />
                                <Typography variant="body2">
                                    Free Shipping Over ৳{settings?.freeShippingThreshold || '5,000'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Main Navigation */}
            <AppBar
                position="static"
                elevation={0}
                sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'grey.100' }}
            >
                <Toolbar className="container mx-auto px-4" sx={{ height: { xs: 56, md: 80 }, justifyContent: 'space-between' }} disableGutters>
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 no-underline">
                        {settings?.logo ? (
                            <img src={getAssetUrl(settings.logo)} alt={settings?.siteName || 'Logo'} className="h-12 w-auto object-contain" />
                        ) : (
                            <Box display="flex" alignItems="center" gap={1}>
                                <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" lineHeight={1.2}>
                                        {settings?.siteName || 'Noboraz'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {settings?.siteTagline || 'Your Trusted Store'}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Link>

                    {/* Search Bar */}
                    <Box
                        component="form"
                        onSubmit={handleSearch}
                        sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, maxWidth: 560, mx: 4 }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton type="submit" edge="end" size="small">
                                                <SearchIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 },
                                },
                            }}
                        />
                    </Box>

                    {/* Right Side */}
                    <Box display="flex" alignItems="center" gap={2}>
                        {user ? (
                            <>
                                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${settings?.primaryColor || 'var(--color-primary)'}20`,
                                            width: 40,
                                            height: 40,
                                        }}
                                    >
                                        <PersonIcon sx={{ color: settings?.primaryColor || 'var(--color-primary)' }} />
                                    </Avatar>
                                    <Box sx={{ display: { xs: 'none', lg: 'block' }, ml: 1, textAlign: 'left' }}>
                                        <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
                                            Hello,
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold" color="text.primary" lineHeight={1.2}>
                                            {user.name}
                                        </Typography>
                                    </Box>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={userMenuOpen}
                                    onClose={handleUserMenuClose}
                                    onClick={handleUserMenuClose}
                                    slotProps={{
                                        paper: {
                                            sx: { width: 224, mt: 1, borderRadius: 2, boxShadow: 3 },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography fontWeight={600} color="text.primary">{user.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                    </Box>
                                    <Divider />
                                    <MenuItem component={Link} href="/profile">
                                        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>My Profile</ListItemText>
                                    </MenuItem>
                                    <MenuItem component={Link} href="/orders">
                                        <ListItemIcon><ShoppingBagIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>My Orders</ListItemText>
                                    </MenuItem>
                                    {user.role === 'admin' && (
                                        <MenuItem component={Link} href="/admin" sx={{ color: 'primary.main' }}>
                                            <ListItemIcon><SettingsIcon fontSize="small" color="primary" /></ListItemIcon>
                                            <ListItemText>Admin Panel</ListItemText>
                                        </MenuItem>
                                    )}
                                    <Divider />
                                    <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
                                        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                                        <ListItemText>Logout</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Button component={Link} href="/login" variant="text" sx={{ textTransform: 'none', fontWeight: 500 }}>
                                    Login
                                </Button>
                                <Button
                                    component={Link}
                                    href="/register"
                                    variant="contained"
                                    disableElevation
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        borderRadius: 2,
                                        bgcolor: settings?.buttonColor || 'primary.main',
                                        '&:hover': { bgcolor: settings?.primaryColor || 'primary.dark' },
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}

                        <IconButton component={Link} href="/cart" sx={{ position: 'relative' }}>
                            <Badge
                                /* only show the dynamic cart count after client mount to avoid hydration errors */
                                badgeContent={isMounted ? getCartCount() : undefined}
                                color="error"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        fontSize: 11,
                                        minWidth: 20,
                                        height: 20,
                                    },
                                }}
                            >
                                <ShoppingCartIcon sx={{ color: 'text.primary' }} />
                            </Badge>
                        </IconButton>

                        <IconButton
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                        >
                            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Categories Bar */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                }}
            >
                <Box className="container mx-auto px-4">
                    <Box display="flex" alignItems="center" gap={3} sx={{ height: 48, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                        <Link href="/products" className="whitespace-nowrap link-modern font-semibold no-underline flex items-center gap-1">
                            <StorefrontIcon sx={{ fontSize: 18 }} /> All Products
                        </Link>
                        {categories.map((category: any) => (
                            <Link
                                key={category._id}
                                href={`/products?category=${category.name}`}
                                className="whitespace-nowrap link-modern hover:font-semibold transition-all no-underline"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Mobile Drawer */}
            <Drawer
                anchor="top"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                sx={{
                    display: { md: 'none' },
                    '& .MuiDrawer-paper': {
                        mt: '92px',
                        maxHeight: 'calc(100vh - 92px)',
                        boxShadow: 6,
                    },
                }}
                slotProps={{ backdrop: { sx: { mt: '92px' } } }}
            >
                <Box sx={{ p: 2 }}>
                    <Box component="form" onSubmit={handleSearch} display="flex" gap={1} mb={2}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" variant="contained" disableElevation sx={{
                            minWidth: 48,
                            bgcolor: settings?.buttonColor || 'primary.main',
                            '&:hover': { bgcolor: settings?.primaryColor || 'primary.dark' },
                        }}>
                            <SearchIcon />
                        </Button>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                        {categories.map((category: any) => (
                            <MenuItem
                                key={category._id}
                                component={Link}
                                href={`/products?category=${category.name}`}
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{ borderRadius: 1 }}
                            >
                                {category.name}
                            </MenuItem>
                        ))}
                    </Box>
                </Box>
            </Drawer>
        </header>
    );
}
