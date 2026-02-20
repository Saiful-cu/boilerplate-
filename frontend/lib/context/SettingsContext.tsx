'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { getAssetUrl } from '@/lib/api';

interface SiteSettings {
    siteName: string;
    siteTagline: string;
    logo: string;
    favicon: string;
    heroBanners: any[];
    aboutUsImage: string;
    footerLogo: string;
    emailHeaderImage: string;
    email: string;
    phone: string;
    address: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    currency: string;
    currencySymbol: string;
    taxRate?: number;
    shippingFee: number;
    freeShippingThreshold: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
    headerBackgroundColor: string;
    footerBackgroundColor: string;
    buttonColor: string;
    buttonHoverColor: string;
    // Admin Panel Colors
    adminPrimaryColor: string;
    adminSecondaryColor: string;
    adminAccentColor: string;
    adminSidebarColor: string;
    adminHeaderColor: string;
    adminSuccessColor: string;
    adminWarningColor: string;
    adminDangerColor: string;
    primaryFont: string;
    secondaryFont: string;
    headingFont: string;
    fontSize: string;
    headingFontWeight: string;
    bodyFontWeight: string;
    [key: string]: any;
}

interface SettingsContextType {
    settings: SiteSettings;
    loading: boolean;
    refreshSettings: () => void;
}

const defaultSettings: SiteSettings = {
    siteName: 'Noboraz',
    siteTagline: 'Your Trusted Ecommerce Store',
    logo: '/logo.svg',
    favicon: '/favicon.svg',
    heroBanners: [],
    aboutUsImage: '',
    footerLogo: '',
    emailHeaderImage: '',
    email: 'info@noboraz.com',
    phone: '+880 1234-567890',
    address: 'Dhaka, Bangladesh',
    currency: 'BDT',
    currencySymbol: '৳',
    shippingFee: 50,
    freeShippingThreshold: 1000,
    primaryColor: '#F85606',
    secondaryColor: '#FF7E2B',
    accentColor: '#FFD700',
    textColor: '#212121',
    backgroundColor: '#F5F5F5',
    headerBackgroundColor: '#FFFFFF',
    footerBackgroundColor: '#1A1A2E',
    buttonColor: '#F85606',
    buttonHoverColor: '#D94800',
    // Admin Panel Colors
    adminPrimaryColor: '#3B82F6',
    adminSecondaryColor: '#6366F1',
    adminAccentColor: '#EC4899',
    adminSidebarColor: '#0F172A',
    adminHeaderColor: '#1E293B',
    adminSuccessColor: '#10B981',
    adminWarningColor: '#F59E0B',
    adminDangerColor: '#EF4444',
    primaryFont: 'Inter',
    secondaryFont: 'Roboto',
    headingFont: 'Inter',
    fontSize: '16px',
    headingFontWeight: '700',
    bodyFontWeight: '400'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const hexToRgb = (hex: string): string => {
        const input = hex || '';
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(input);
        if (!result) return '248, 86, 6';
        const [, r, g, b] = result;
        return `${parseInt(r!, 16)}, ${parseInt(g!, 16)}, ${parseInt(b!, 16)}`;
    };

    const applyStyles = (data: SiteSettings) => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;
        const primary = data.primaryColor || '#F85606';
        const secondary = data.secondaryColor || '#FF7E2B';
        const accent = data.accentColor || '#FFD700';
        const text = data.textColor || '#212121';
        const bg = data.backgroundColor || '#F5F5F5';
        const headerBg = data.headerBackgroundColor || '#FFFFFF';
        const footerBg = data.footerBackgroundColor || '#1A1A2E';
        const button = data.buttonColor || '#F85606';
        const buttonHover = data.buttonHoverColor || '#D94800';

        root.style.setProperty('--color-primary', primary);
        root.style.setProperty('--color-secondary', secondary);
        root.style.setProperty('--color-accent', accent);
        root.style.setProperty('--color-text', text);
        root.style.setProperty('--color-background', bg);
        root.style.setProperty('--color-header-bg', headerBg);
        root.style.setProperty('--color-footer-bg', footerBg);
        root.style.setProperty('--color-button', button);
        root.style.setProperty('--color-button-hover', buttonHover);

        // RGB variants for alpha transparency usage: rgba(var(--color-primary-rgb), 0.1)
        root.style.setProperty('--color-primary-rgb', hexToRgb(primary));
        root.style.setProperty('--color-secondary-rgb', hexToRgb(secondary));
        root.style.setProperty('--color-accent-rgb', hexToRgb(accent));
        root.style.setProperty('--color-button-rgb', hexToRgb(button));
        root.style.setProperty('--color-button-hover-rgb', hexToRgb(buttonHover));

        // Admin Panel color variables
        const adminPrimary = data.adminPrimaryColor || '#3B82F6';
        const adminSecondary = data.adminSecondaryColor || '#6366F1';
        const adminAccent = data.adminAccentColor || '#EC4899';
        const adminSidebar = data.adminSidebarColor || '#0F172A';
        const adminHeader = data.adminHeaderColor || '#1E293B';
        const adminSuccess = data.adminSuccessColor || '#10B981';
        const adminWarning = data.adminWarningColor || '#F59E0B';
        const adminDanger = data.adminDangerColor || '#EF4444';

        root.style.setProperty('--admin-primary', adminPrimary);
        root.style.setProperty('--admin-secondary', adminSecondary);
        root.style.setProperty('--admin-accent', adminAccent);
        root.style.setProperty('--admin-sidebar', adminSidebar);
        root.style.setProperty('--admin-header', adminHeader);
        root.style.setProperty('--admin-success', adminSuccess);
        root.style.setProperty('--admin-warning', adminWarning);
        root.style.setProperty('--admin-danger', adminDanger);
        root.style.setProperty('--admin-primary-rgb', hexToRgb(adminPrimary));
        root.style.setProperty('--admin-secondary-rgb', hexToRgb(adminSecondary));
        root.style.setProperty('--admin-accent-rgb', hexToRgb(adminAccent));

        root.style.setProperty('--font-primary', data.primaryFont || 'Inter');
        root.style.setProperty('--font-secondary', data.secondaryFont || 'Roboto');
        root.style.setProperty('--font-heading', data.headingFont || 'Inter');
        root.style.setProperty('--font-size-base', data.fontSize || '16px');
        root.style.setProperty('--font-weight-heading', data.headingFontWeight || '700');
        root.style.setProperty('--font-weight-body', data.bodyFontWeight || '400');

        document.body.style.fontFamily = `'${data.primaryFont || 'Inter'}', sans-serif`;
        document.body.style.fontSize = data.fontSize || '16px';
        document.body.style.fontWeight = data.bodyFontWeight || '400';
        document.body.style.color = text;
        document.body.style.backgroundColor = bg;

        // Load Google Fonts dynamically with error handling
        const fonts = [data.primaryFont, data.secondaryFont, data.headingFont]
            .filter((font, index, self) => font && self.indexOf(font) === index)
            .map(font => font.replace(/ /g, '+'));

        if (fonts.length > 0) {
            // Add preconnect for better performance
            const preconnectGoogle = document.createElement('link');
            preconnectGoogle.rel = 'preconnect';
            preconnectGoogle.href = 'https://fonts.googleapis.com';
            document.head.appendChild(preconnectGoogle);

            const preconnectGstatic = document.createElement('link');
            preconnectGstatic.rel = 'preconnect';
            preconnectGstatic.href = 'https://fonts.gstatic.com';
            preconnectGstatic.crossOrigin = 'anonymous';
            document.head.appendChild(preconnectGstatic);

            const existingLink = document.querySelector('#dynamic-fonts');
            if (existingLink) existingLink.remove();

            const link = document.createElement('link');
            link.id = 'dynamic-fonts';
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}:wght@300;400;500;600;700;800`).join('&')}&display=swap`;

            // Add error handling for font loading
            link.onerror = () => {
                console.warn('Failed to load Google Fonts, using fallback fonts');
                // Remove the failed link to prevent further errors
                const failedLink = document.querySelector('#dynamic-fonts');
                if (failedLink) failedLink.remove();
            };

            // Add timeout to prevent hanging
            setTimeout(() => {
                const linkElement = document.querySelector('#dynamic-fonts');
                if (linkElement && !document.fonts) {
                    console.warn('Font loading timeout, using fallback fonts');
                    linkElement.remove();
                }
            }, 5000); // 5 second timeout

            document.head.appendChild(link);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(response.data);

            if (typeof window !== 'undefined') {
                if (response.data.siteName) {
                    document.title = response.data.siteName;
                }
                if (response.data.favicon) {
                    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = getAssetUrl(response.data.favicon);
                    const head = document.getElementsByTagName('head')[0];
                    if (head) {
                        head.appendChild(link);
                    }
                }
                applyStyles(response.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshSettings = () => {
        fetchSettings();
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
