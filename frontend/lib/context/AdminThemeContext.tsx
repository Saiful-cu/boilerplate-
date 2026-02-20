'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '@mui/material/styles';
import { adminLightTheme, adminDarkTheme } from '@/lib/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const AdminThemeProvider = ({ children }: ThemeProviderProps) => {
    const [mode, setMode] = useState<ThemeMode>('dark');
    const [mounted, setMounted] = useState(false);

    // Load theme preference from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedMode = localStorage.getItem('admin-theme-mode') as ThemeMode;
        if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
            setMode(savedMode);
        }
    }, []);

    // Save theme preference to localStorage when it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('admin-theme-mode', mode);
        }
    }, [mode, mounted]);

    const toggleTheme = () => {
        setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
    };

    const theme = mode === 'light' ? adminLightTheme : adminDarkTheme;

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ theme: adminDarkTheme, mode: 'dark', toggleTheme }}>
                {children}
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};