'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';
import ThemeRegistry from '@/lib/ThemeRegistry';
import { AuthProvider } from '@/lib/context/AuthContext';
import { CartProvider } from '@/lib/context/CartContext';
import { SettingsProvider } from '@/lib/context/SettingsContext';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeRegistry>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <SettingsProvider>
                        <CartProvider>
                            <Toaster
                                position="bottom-right"
                                toastOptions={{
                                    duration: 3500,
                                    style: {
                                        background: '#fff',
                                        color: '#333',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                    },
                                    success: {
                                        iconTheme: {
                                            primary: 'var(--color-primary)',
                                            secondary: '#fff',
                                        },
                                        style: {
                                            border: '2px solid var(--color-primary)',
                                            background: 'linear-gradient(to right, rgba(var(--color-primary-rgb), 0.05), rgba(255, 255, 255, 1))',
                                        },
                                    },
                                    error: {
                                        style: {
                                            border: '2px solid #EF4444',
                                            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), rgba(255, 255, 255, 1))',
                                        },
                                        iconTheme: {
                                            primary: '#EF4444',
                                            secondary: '#fff',
                                        },
                                    },
                                    loading: {
                                        style: {
                                            border: '2px solid var(--color-primary)',
                                            background: 'linear-gradient(to right, rgba(var(--color-primary-rgb), 0.05), rgba(255, 255, 255, 1))',
                                        },
                                        iconTheme: {
                                            primary: 'var(--color-primary)',
                                            secondary: '#fff',
                                        },
                                    },
                                }}
                            />
                            {children}
                        </CartProvider>
                    </SettingsProvider>
                </AuthProvider>
            </ThemeProvider>
        </ThemeRegistry>
    );
}
