'use client';

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Extend MUI theme types to include custom palette
declare module '@mui/material/styles' {
    interface Palette {
        custom: {
            accent: string;
            accentHover: string;
            warning: string;
            danger: string;
            success: string;
            neutral: string;
            chart: {
                grid: string;
                axis: string;
            };
            gradients: {
                users: string;
                orders: string;
                products: string;
                revenue: string;
                profit: string;
                totalOrders: string;
                catalog: string;
                margin: string;
                cta: string;
            };
        };
    }
    interface PaletteOptions {
        custom?: {
            accent?: string;
            accentHover?: string;
            warning?: string;
            danger?: string;
            success?: string;
            neutral?: string;
            chart?: {
                grid?: string;
                axis?: string;
            };
            gradients?: {
                users?: string;
                orders?: string;
                products?: string;
                revenue?: string;
                profit?: string;
                totalOrders?: string;
                catalog?: string;
                margin?: string;
                cta?: string;
            };
        };
    }
}

// Custom MUI theme that works alongside Tailwind
let theme = createTheme({
    palette: {
        primary: {
            main: '#F85606',
            light: '#FF8A50',
            dark: '#D94800',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#FF7E2B',
            light: '#FFA66B',
            dark: '#E06500',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
        },
        warning: {
            main: '#FFB800',
            light: '#FFCF33',
            dark: '#E5A600',
        },
        info: {
            main: '#2979FF',
            light: '#448AFF',
            dark: '#1565C0',
        },
        success: {
            main: '#00C853',
            light: '#69F0AE',
            dark: '#00A344',
        },
        grey: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
        },
        background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
        divider: '#E0E0E0',
    },
    typography: {
        fontFamily: 'var(--font-primary), "Inter", "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.025em' },
        h2: { fontWeight: 700, letterSpacing: '-0.025em' },
        h3: { fontWeight: 700, letterSpacing: '-0.02em' },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500, fontSize: '1rem' },
        subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
        body1: { fontSize: '1rem', lineHeight: 1.6 },
        body2: { fontSize: '0.875rem', lineHeight: 1.5 },
        button: { fontWeight: 600, textTransform: 'none' as const },
        caption: { fontSize: '0.75rem', color: '#6B7280' },
        overline: { fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em' },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0,0,0,0.05)',
        '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        '0 25px 50px -12px rgba(0,0,0,0.25)',
        '0 1px 2px rgba(0,0,0,0.07)',
        '0 2px 4px rgba(0,0,0,0.07)',
        '0 4px 8px rgba(0,0,0,0.07)',
        '0 8px 16px rgba(0,0,0,0.07)',
        '0 16px 32px rgba(0,0,0,0.07)',
        '0 32px 64px rgba(0,0,0,0.07)',
        '0 0 0 1px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.04)',
        '0 0 0 1px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.04)',
        '0 0 0 1px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04)',
        '0 0 0 1px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.04)',
        '0 0 0 1px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.04)',
        '0 0 0 1px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.04)',
        '0 0 0 1px rgba(0,0,0,0.04), 0 32px 64px rgba(0,0,0,0.04)',
        '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        '0 4px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        '0 8px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)',
        '0 16px 48px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.06)',
        '0 24px 64px rgba(0,0,0,0.18), 0 12px 24px rgba(0,0,0,0.06)',
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollBehavior: 'smooth',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '8px 20px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease-in-out',
                },
                sizeSmall: {
                    padding: '4px 12px',
                    fontSize: '0.8125rem',
                },
                sizeLarge: {
                    padding: '12px 28px',
                    fontSize: '1rem',
                },
                containedPrimary: {
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    },
                },
                outlined: {
                    borderWidth: 1.5,
                    '&:hover': {
                        borderWidth: 1.5,
                    },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    transition: 'all 0.2s ease-in-out',
                },
            },
        },
        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                rounded: {
                    borderRadius: 16,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        fontSize: '0.875rem',
                        '& fieldset': {
                            borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                            borderColor: '#3B82F6',
                        },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontSize: '0.875rem',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 20,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '6px 12px',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: '#F3F4F6',
                    fontSize: '0.875rem',
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: '#F9FAFB',
                    color: '#6B7280',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#F9FAFB',
                    },
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    minHeight: 44,
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    borderRadius: 4,
                    height: 3,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontSize: '0.875rem',
                },
            },
        },
        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    fontWeight: 600,
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    width: 44,
                    height: 24,
                    padding: 0,
                },
                switchBase: {
                    padding: 2,
                    '&.Mui-checked': {
                        transform: 'translateX(20px)',
                        '& + .MuiSwitch-track': {
                            opacity: 1,
                        },
                    },
                },
                thumb: {
                    width: 20,
                    height: 20,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                },
                track: {
                    borderRadius: 12,
                    opacity: 0.3,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 6,
                },
            },
        },
        MuiSkeleton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: 'none',
                },
            },
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #E5E7EB',
                },
            },
        },
        MuiPagination: {
            styleOverrides: {
                root: {
                    '& .MuiPaginationItem-root': {
                        borderRadius: 8,
                        fontWeight: 500,
                    },
                },
            },
        },
        MuiBreadcrumbs: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                },
            },
        },
    },
});

theme = responsiveFontSizes(theme);

// Admin Light Theme — Professional SaaS palette (Blue primary, Indigo secondary, Pink accent)
export const adminLightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#6366F1',
            light: '#818CF8',
            dark: '#4F46E5',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
        },
        warning: {
            main: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
        },
        success: {
            main: '#10B981',
            light: '#34D399',
            dark: '#059669',
        },
        info: {
            main: '#6366F1',
            light: '#818CF8',
            dark: '#4F46E5',
        },
        background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1E293B',
            secondary: '#64748B',
        },
        divider: '#E2E8F0',
        // Custom colors for admin panel consistency — light mode
        custom: {
            accent: '#EC4899',
            accentHover: '#DB2777',
            warning: '#F59E0B',
            danger: '#EF4444',
            success: '#10B981',
            neutral: '#94A3B8',
            chart: {
                grid: '#E2E8F0',
                axis: '#94A3B8',
            },
            gradients: {
                users: 'linear-gradient(135deg, #1E293B, #334155)',
                orders: 'linear-gradient(135deg, #6366F1, #818CF8)',
                products: 'linear-gradient(135deg, #059669, #10B981)',
                revenue: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                profit: 'linear-gradient(135deg, #059669, #10B981)',
                totalOrders: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
                catalog: 'linear-gradient(135deg, #EA580C, #F97316)',
                margin: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                cta: 'linear-gradient(to right, #EC4899, #F43F5E)',
            },
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: '#CBD5E1',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
        },
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#FFFFFF',
                },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined', size: 'small' },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        '& fieldset': {
                            borderColor: '#E2E8F0',
                        },
                        '&:hover fieldset': {
                            borderColor: '#3B82F6',
                        },
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: '#E2E8F0',
                    color: '#334155',
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: '#F8FAFC',
                    color: '#64748B',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#F1F5F9',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 6,
                },
            },
        },
    },
});

export const adminDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#6366F1',
            light: '#818CF8',
            dark: '#4F46E5',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
        },
        warning: {
            main: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
        },
        success: {
            main: '#10B981',
            light: '#34D399',
            dark: '#059669',
        },
        info: {
            main: '#6366F1',
            light: '#818CF8',
            dark: '#4F46E5',
        },
        background: {
            default: '#0F172A',
            paper: '#1E293B',
        },
        text: {
            primary: '#F1F5F9',
            secondary: '#94A3B8',
        },
        divider: '#334155',
        // Custom colors for admin panel consistency — dark mode
        custom: {
            accent: '#EC4899',
            accentHover: '#DB2777',
            warning: '#F59E0B',
            danger: '#EF4444',
            success: '#10B981',
            neutral: '#94A3B8',
            chart: {
                grid: '#475569',
                axis: '#CBD5E1',
            },
            gradients: {
                users: 'linear-gradient(135deg, #1E293B, #334155)',
                orders: 'linear-gradient(135deg, #6366F1, #818CF8)',
                products: 'linear-gradient(135deg, #059669, #10B981)',
                revenue: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                profit: 'linear-gradient(135deg, #059669, #10B981)',
                totalOrders: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
                catalog: 'linear-gradient(135deg, #EA580C, #F97316)',
                margin: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                cta: 'linear-gradient(to right, #EC4899, #F43F5E)',
            },
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    border: '1px solid #334155',
                    backgroundColor: '#1E293B',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: '#475569',
                    },
                },
            },
        },
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#1E293B',
                },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined', size: 'small' },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        backgroundColor: '#0F172A',
                        '& fieldset': {
                            borderColor: '#334155',
                        },
                        '&:hover fieldset': {
                            borderColor: '#3B82F6',
                        },
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: '#334155',
                    color: '#CBD5E1',
                },
                head: {
                    fontWeight: 600,
                    backgroundColor: '#0F172A',
                    color: '#94A3B8',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#334155',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 8,
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 6,
                },
            },
        },
    },
});

export default theme;
