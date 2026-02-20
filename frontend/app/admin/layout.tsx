'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { AdminThemeProvider, useTheme } from '@/lib/context/AdminThemeContext';
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Button,
    Divider,
    Avatar,
    CircularProgress,
    Paper,
    alpha,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BlockIcon from '@mui/icons-material/Block';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const DRAWER_WIDTH = 260;

const sidebarItems = [
    { href: '/admin', label: 'Dashboard', icon: <DashboardIcon />, exact: true },
    { href: '/admin/products', label: 'Products', icon: <InventoryIcon /> },
    { href: '/admin/categories', label: 'Categories', icon: <CategoryIcon /> },
    { href: '/admin/orders', label: 'Orders', icon: <ShoppingCartIcon /> },
    { href: '/admin/users', label: 'Users', icon: <PeopleIcon /> },
    { href: '/admin/promo-codes', label: 'Promo Codes', icon: <LocalOfferIcon /> },
    { href: '/admin/reviews', label: 'Reviews', icon: <StarIcon /> },
    { href: '/admin/homepage-builder', label: 'Homepage Builder', icon: <HomeIcon /> },
    { href: '/admin/email-logs', label: 'Email Logs', icon: <EmailIcon /> },
    { href: '/admin/settings', label: 'Settings', icon: <SettingsIcon /> },
];

function AdminLayoutContent({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, loading } = useAuth();
    const { theme, mode, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={48} />
                        <Typography color="text.secondary" fontWeight={500}>Loading admin panel...</Typography>
                    </Box>
                </Box>
            </ThemeProvider>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2 }}>
                <Paper sx={{ p: 5, borderRadius: 1, maxWidth: 400, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <BlockIcon sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight={700} gutterBottom>Access Denied</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        You need to be logged in as an admin to access this area.
                    </Typography>
                    <Button component={Link} href="/login" variant="contained" size="large" fullWidth>
                        Go to Login
                    </Button>
                </Paper>
            </Box>
        );
    }

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname?.startsWith(href + '/');
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List sx={{ px: 1.5, py: 1, flex: 1 }}>
                {sidebarItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                        <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                sx={{
                                    borderRadius: 0.5,
                                    py: 1.2,
                                    px: 2,
                                    ...(active && {
                                        bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
                                        color: 'primary.main',
                                        borderLeft: '3px solid',
                                        borderColor: 'primary.main',
                                        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.2) },
                                    }),
                                    ...(!active && {
                                        color: 'text.secondary',
                                        '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                                    }),
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Divider sx={{ borderColor: 'divider' }} />
            <List sx={{ px: 1.5, py: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        href="/"
                        sx={{ borderRadius: 2, py: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                            <ArrowBackIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Back to Store" primaryTypographyProps={{ fontSize: '0.8125rem' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
                {/* AppBar */}
                <AppBar
                    position="fixed"
                    sx={{
                        zIndex: (t) => t.zIndex.drawer + 1,
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Toolbar sx={{ gap: 1 }}>
                        <IconButton
                            color="inherit"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            sx={{ display: { lg: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            component={Link}
                            href="/admin"
                            sx={{ fontWeight: 700, textDecoration: 'none', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>👑</span>
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Admin Panel</Box>
                        </Typography>

                        <Box sx={{ flex: 1 }} />

                        <Button
                            component={Link}
                            href="/"
                            size="small"
                            startIcon={<OpenInNewIcon />}
                            sx={{ display: { xs: 'none', sm: 'flex' }, color: 'text.secondary', textTransform: 'none' }}
                        >
                            View Store
                        </Button>

                        <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', sm: 'block' } }} />

                        {/* Theme Toggle Button */}
                        <IconButton
                            onClick={toggleTheme}
                            color="inherit"
                            sx={{
                                mr: 1,
                                bgcolor: 'action.hover',
                                '&:hover': {
                                    bgcolor: 'action.selected'
                                }
                            }}
                            title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                        </IconButton>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                {user?.name}
                            </Typography>
                        </Box>

                        <Button
                            onClick={() => { logout(); router.push('/'); }}
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<LogoutIcon />}
                            sx={{ ml: 1 }}
                        >
                            Logout
                        </Button>
                    </Toolbar>
                </AppBar>

                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            bgcolor: 'background.paper',
                            mt: '64px',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: 'block' },
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            bgcolor: 'background.paper',
                            mt: '64px',
                            height: 'calc(100vh - 64px)',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3, lg: 4 },
                        mt: '64px',
                        minHeight: 'calc(100vh - 64px)',
                        width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
                    }}
                >
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminThemeProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminThemeProvider>
    );
}
