'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { useSettings } from '@/lib/context/SettingsContext';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Badge from '@mui/material/Badge';

import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { getCartCount } = useCart();
    const { settings } = useSettings();

    // Avoid hydration mismatch for cart badge (cart is client-only data)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const navItems = [
        { name: 'Home', href: '/', icon: <HomeIcon /> },
        { name: 'Products', href: '/products', icon: <ShoppingBagIcon /> },
        {
            name: 'Cart',
            href: '/cart',
            icon: (
                <Badge
                    /* only render dynamic count after mount to prevent hydration mismatches */
                    badgeContent={isMounted ? getCartCount() : undefined}
                    sx={{
                        '& .MuiBadge-badge': {
                            bgcolor: settings?.buttonColor || 'var(--color-button)',
                            color: 'white',
                            fontSize: 10,
                            minWidth: 16,
                            height: 16,
                            fontWeight: 'bold',
                        },
                    }}
                >
                    <ShoppingCartIcon />
                </Badge>
            ),
        },
        {
            name: 'Orders',
            href: user ? '/orders' : '/login',
            icon: <ListAltIcon />,
        },
        {
            name: user ? 'Profile' : 'Login',
            href: user ? '/profile' : '/login',
            icon: <PersonIcon />,
        },
    ];

    // Determine the active index
    const activeIndex = navItems.findIndex(
        (item) => pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
    );

    return (
        <>
            {/* Spacer to prevent content from being hidden behind bottom nav */}
            <Box sx={{ height: 64, display: { xs: 'block', md: 'none' } }} />
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: { xs: 'block', md: 'none' },
                    zIndex: 1300,
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                }}
            >
                <BottomNavigation
                    value={activeIndex >= 0 ? activeIndex : false}
                    showLabels
                    sx={{
                        height: 64,
                        bgcolor: 'white',
                        borderTop: '1px solid',
                        borderColor: 'grey.200',
                        '& .MuiBottomNavigationAction-root': {
                            minWidth: 0,
                            px: 1,
                            color: 'grey.500',
                            '&.Mui-selected': {
                                color: settings?.primaryColor || 'var(--color-primary)',
                            },
                        },
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: '0.625rem',
                            mt: 0.25,
                            '&.Mui-selected': {
                                fontSize: '0.625rem',
                                fontWeight: 700,
                            },
                        },
                    }}
                >
                    {navItems.map((item) => (
                        <BottomNavigationAction
                            key={item.name}
                            label={item.name}
                            icon={item.icon}
                            component={Link}
                            href={item.href}
                        />
                    ))}
                </BottomNavigation>
            </Box>
        </>
    );
}
