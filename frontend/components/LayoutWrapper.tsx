'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

import Box from '@mui/material/Box';

/**
 * Conditionally renders store chrome (Navbar, Footer, BottomNav).
 * Admin routes and auth pages get a clean layout without store navigation.
 */
export default function LayoutWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/verify-email' || pathname === '/registration-success';

    if (isAdminRoute || isAuthRoute) {
        // Admin pages and auth pages render without store Navbar/Footer/BottomNav
        return <>{children}</>;
    }

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>{children}</Box>
            <Footer />
            <BottomNav />
        </Box>
    );
}
