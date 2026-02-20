'use client';

import { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SettingsProvider } from '@/lib/context/SettingsContext';

// Clean theme for preview (not admin theme)
const previewTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
    },
});

/**
 * Preview layout - minimal wrapper for homepage preview
 */
export default function PreviewLayout({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={previewTheme}>
            <CssBaseline />
            <SettingsProvider>
                {children}
            </SettingsProvider>
        </ThemeProvider>
    );
}
