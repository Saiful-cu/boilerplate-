'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import EmailTemplateBuilderModal from '@/components/shared/EmailTemplateBuilderModal';

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

// MUI Icons
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import BusinessIcon from '@mui/icons-material/Business';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ShareIcon from '@mui/icons-material/Share';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import LabelIcon from '@mui/icons-material/Label';
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Hero Banner type
interface HeroBanner {
    image?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
}

interface Settings {
    _id?: string;
    // Branding
    siteName?: string;
    siteTagline?: string;
    siteDescription?: string;
    logo?: string;
    favicon?: string;
    footerLogo?: string;
    emailHeaderImage?: string;
    aboutUsImage?: string;
    heroBanners?: HeroBanner[];
    // Contact
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    // Social Media
    socialFacebook?: string;
    socialTwitter?: string;
    socialInstagram?: string;
    socialYoutube?: string;
    socialLinkedin?: string;
    // Appearance — Website Frontend
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    buttonColor?: string;
    buttonHoverColor?: string;
    headerColor?: string;
    footerColor?: string;
    textColor?: string;
    backgroundColor?: string;
    // Appearance — Admin Panel
    adminPrimaryColor?: string;
    adminSecondaryColor?: string;
    adminAccentColor?: string;
    adminSidebarColor?: string;
    adminHeaderColor?: string;
    adminSuccessColor?: string;
    adminWarningColor?: string;
    adminDangerColor?: string;
    // Typography
    primaryFont?: string;
    secondaryFont?: string;
    headingFont?: string;
    fontSize?: string;
    headingFontWeight?: string;
    bodyFontWeight?: string;
    // Business
    currency?: string;
    currencySymbol?: string;
    taxRate?: number;
    shippingFee?: number;
    freeShippingThreshold?: number;
    // SEO
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    // Maintenance
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
    [key: string]: any;
}

type TabType = 'branding' | 'appearance' | 'contact' | 'social' | 'business' | 'seo' | 'templates' | 'email-templates' | 'maintenance';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'branding', label: 'Branding', icon: <LabelIcon fontSize="small" /> },
    { id: 'appearance', label: 'Appearance', icon: <PaletteIcon fontSize="small" /> },
    { id: 'contact', label: 'Contact', icon: <ContactMailIcon fontSize="small" /> },
    { id: 'social', label: 'Social Media', icon: <ShareIcon fontSize="small" /> },
    { id: 'business', label: 'Business', icon: <BusinessIcon fontSize="small" /> },
    { id: 'seo', label: 'SEO', icon: <SearchIcon fontSize="small" /> },
    { id: 'templates', label: 'Message Templates', icon: <MessageIcon fontSize="small" /> },
    { id: 'email-templates', label: 'Email Templates', icon: <EmailIcon fontSize="small" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <BuildIcon fontSize="small" /> },
];

interface MessageTemplate {
    _id: string;
    name: string;
    content: string;
    category: 'promotional' | 'notification' | 'reminder' | 'announcement' | 'custom';
    variables: { name: string; placeholder: string; defaultValue?: string }[];
    usageCount: number;
    isActive: boolean;
}

interface TemplateFormData {
    name: string;
    content: string;
    category: 'promotional' | 'notification' | 'reminder' | 'announcement' | 'custom';
    variables: { name: string; placeholder: string; defaultValue?: string }[];
    isActive: boolean;
}

const DEFAULT_TEMPLATE_FORM: TemplateFormData = {
    name: '',
    content: '',
    category: 'custom',
    variables: [],
    isActive: true,
};

const DEFAULT_COLORS = {
    // Website Frontend Colors — Daraz/Alibaba inspired warm ecommerce palette
    primaryColor: '#F85606',
    secondaryColor: '#FF7E2B',
    accentColor: '#FFD700',
    buttonColor: '#F85606',
    buttonHoverColor: '#D94800',
    headerColor: '#FFFFFF',
    footerColor: '#1A1A2E',
    textColor: '#212121',
    backgroundColor: '#F5F5F5',
};

const DEFAULT_ADMIN_COLORS = {
    // Admin Panel Colors — Professional trust-focused SaaS palette
    adminPrimaryColor: '#3B82F6',
    adminSecondaryColor: '#6366F1',
    adminAccentColor: '#EC4899',
    adminSidebarColor: '#0F172A',
    adminHeaderColor: '#1E293B',
    adminSuccessColor: '#10B981',
    adminWarningColor: '#F59E0B',
    adminDangerColor: '#EF4444',
};

// Font options for typography
const FONT_OPTIONS = [
    'Inter',
    'Roboto',
    'Poppins',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Raleway',
    'PT Sans',
    'Nunito',
    'Playfair Display'
];

const FONT_WEIGHT_OPTIONS = [
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '800', label: 'Extra Bold (800)' }
];

const FONT_SIZE_OPTIONS = [
    { value: '14px', label: 'Small (14px)' },
    { value: '16px', label: 'Medium (16px)' },
    { value: '18px', label: 'Large (18px)' },
    { value: '20px', label: 'Extra Large (20px)' }
];

const DEFAULT_TYPOGRAPHY = {
    primaryFont: 'Inter',
    secondaryFont: 'Roboto',
    headingFont: 'Poppins',
    fontSize: '16px',
    headingFontWeight: '700',
    bodyFontWeight: '400'
};

const getCategoryChipColor = (category: string): 'secondary' | 'primary' | 'warning' | 'success' | 'default' => {
    const colors: Record<string, 'secondary' | 'primary' | 'warning' | 'success' | 'default'> = {
        promotional: 'secondary',
        notification: 'primary',
        reminder: 'warning',
        announcement: 'success',
        custom: 'default',
    };
    return colors[category] || 'default';
};

// ===== VALIDATION UTILITIES =====
const validators = {
    email: (value: string): string | null => {
        if (!value) return null;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) ? null : 'Please enter a valid email address';
    },
    phone: (value: string): string | null => {
        if (!value) return null;
        const cleaned = value.replace(/[^0-9+]/g, '');
        if (cleaned.length < 10 || cleaned.length > 15) {
            return 'Phone number should be 10-15 digits';
        }
        return null;
    },
    url: (value: string): string | null => {
        if (!value) return null;
        try {
            new URL(value);
            return null;
        } catch {
            return 'Please enter a valid URL (e.g., https://example.com)';
        }
    },
    hexColor: (value: string): string | null => {
        if (!value) return null;
        const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return regex.test(value) ? null : 'Please enter a valid hex color (e.g., #3B82F6)';
    },
    required: (value: any, fieldName: string): string | null => {
        if (value === undefined || value === null || value === '') {
            return `${fieldName} is required`;
        }
        return null;
    },
    maxLength: (value: string, max: number, fieldName: string): string | null => {
        if (value && value.length > max) {
            return `${fieldName} must be ${max} characters or less`;
        }
        return null;
    },
    minLength: (value: string, min: number, fieldName: string): string | null => {
        if (value && value.length < min) {
            return `${fieldName} must be at least ${min} characters`;
        }
        return null;
    },
    positiveNumber: (value: number | undefined, fieldName: string): string | null => {
        if (value !== undefined && value < 0) {
            return `${fieldName} must be a positive number`;
        }
        return null;
    },
};

// File validation constants
const FILE_VALIDATION = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
};

interface ValidationErrors {
    [key: string]: string | null;
}

export default function AdminSettings() {
    const [settings, setSettings] = useState<Settings>({});
    const [originalSettings, setOriginalSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('branding');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    // File upload states
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);

    // Message Templates State
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
    const [templateForm, setTemplateForm] = useState<TemplateFormData>(DEFAULT_TEMPLATE_FORM);
    const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
    const [newVariable, setNewVariable] = useState({ name: '', placeholder: '', defaultValue: '' });

    // Email Templates State
    interface EmailTemplate {
        _id?: string;
        name: string;
        subject: string;
        htmlContent?: string;
        textContent?: string;
        type?: string;
        category?: string;
        variables?: { name: string; placeholder: string; defaultValue?: string }[];
        isActive?: boolean;
        isDefault?: boolean;
        usageCount?: number;
        blocks?: any[];
        designSettings?: any;
    }

    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [emailLoading, setEmailLoading] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [editingEmail, setEditingEmail] = useState<EmailTemplate | null>(null);
    const [filterType, setFilterType] = useState<string>('all');

    const fetchEmailTemplates = async () => {
        setEmailLoading(true);
        try {
            const response = await api.get('/email-templates');
            setEmailTemplates(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Error fetching email templates:', error);
            toast.error('Failed to fetch email templates');
        } finally {
            setEmailLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'email-templates') {
            fetchEmailTemplates();
        }
    }, [activeTab]);

    const openEmailModal = (template?: EmailTemplate) => {
        if (template) {
            setEditingEmail(template);
        } else {
            setEditingEmail(null);
        }
        setShowEmailModal(true);
    };

    const handleSaveEmailTemplate = async (data: EmailTemplate) => {
        try {
            if (editingEmail && editingEmail._id) {
                await api.put(`/email-templates/${editingEmail._id}`, data);
                toast.success('Email template updated');
            } else {
                await api.post('/email-templates', data);
                toast.success('Email template created');
            }
            setShowEmailModal(false);
            setEditingEmail(null);
            fetchEmailTemplates();
        } catch (error) {
            console.error('Error saving email template:', error);
            toast.error('Failed to save email template');
        }
    };

    const handleDeleteEmailTemplate = async (id?: string) => {
        if (!id) return;
        if (!window.confirm('Are you sure you want to delete this email template?')) return;
        try {
            await api.delete(`/email-templates/${id}`);
            toast.success('Email template deleted');
            fetchEmailTemplates();
        } catch (error) {
            console.error('Error deleting email template:', error);
            toast.error('Failed to delete email template');
        }
    };

    const handleDuplicateEmail = async (id?: string) => {
        if (!id) return;
        try {
            await api.post(`/email-templates/${id}/duplicate`);
            toast.success('Template duplicated');
            fetchEmailTemplates();
        } catch (error) {
            console.error('Error duplicating:', error);
            toast.error('Failed to duplicate template');
        }
    };

    const handleSetDefaultEmail = async (id?: string) => {
        if (!id) return;
        try {
            await api.post(`/email-templates/${id}/set-default`);
            toast.success('Template set as default');
            fetchEmailTemplates();
        } catch (error) {
            console.error('Error setting default:', error);
            toast.error('Failed to set default');
        }
    };

    const handleToggleActiveEmail = async (id?: string) => {
        if (!id) return;
        try {
            await api.post(`/email-templates/${id}/toggle-active`);
            toast.success('Template status updated');
            fetchEmailTemplates();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    const [emailPreviewHtml, setEmailPreviewHtml] = useState('');
    const [showEmailPreview, setShowEmailPreview] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    // Warn user about unsaved changes before leaving
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Track unsaved changes
    useEffect(() => {
        if (Object.keys(originalSettings).length > 0) {
            const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
            setHasUnsavedChanges(hasChanges);
        }
    }, [settings, originalSettings]);

    const fetchSettings = async (retry = 0): Promise<void> => {
        try {
            const response = await api.get('/settings');
            const data = response.data?.data || response.data || {};
            setSettings(data);
            setOriginalSettings(data);
            setHasUnsavedChanges(false);
            setRetryCount(0);
        } catch (error: any) {
            console.error('Error fetching settings:', error);

            // Retry logic with exponential backoff
            if (retry < MAX_RETRIES) {
                const delay = Math.pow(2, retry) * 1000; // 1s, 2s, 4s
                toast.error(`Failed to load settings. Retrying in ${delay / 1000}s...`);
                setRetryCount(retry + 1);
                setTimeout(() => fetchSettings(retry + 1), delay);
            } else {
                toast.error('Failed to load settings. Please refresh the page.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Field-level validation
    const validateField = (field: string, value: any): string | null => {
        switch (field) {
            case 'contactEmail':
                return validators.email(value);
            case 'contactPhone':
                return validators.phone(value);
            case 'socialFacebook':
            case 'socialTwitter':
            case 'socialInstagram':
            case 'socialYoutube':
            case 'socialLinkedin':
                return validators.url(value);
            case 'primaryColor':
            case 'secondaryColor':
            case 'accentColor':
            case 'buttonColor':
            case 'buttonHoverColor':
            case 'headerColor':
            case 'footerColor':
            case 'textColor':
            case 'backgroundColor':
            case 'adminPrimaryColor':
            case 'adminSecondaryColor':
            case 'adminAccentColor':
            case 'adminSidebarColor':
            case 'adminHeaderColor':
            case 'adminSuccessColor':
            case 'adminWarningColor':
            case 'adminDangerColor':
                return validators.hexColor(value);
            case 'taxRate':
            case 'shippingFee':
            case 'freeShippingThreshold':
                return validators.positiveNumber(value, field);
            case 'metaTitle':
                return validators.maxLength(value, 60, 'Meta Title');
            case 'metaDescription':
                return validators.maxLength(value, 160, 'Meta Description');
            default:
                return null;
        }
    };

    const handleChange = (field: string, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));

        // Validate and update errors
        const error = validateField(field, value);
        setValidationErrors(prev => ({ ...prev, [field]: error }));
    };

    // Validate all fields before save
    const validateAllFields = (): boolean => {
        const errors: ValidationErrors = {};
        let hasErrors = false;

        // Validate required fields based on active tab
        const fieldsToValidate = [
            'contactEmail', 'contactPhone',
            'socialFacebook', 'socialTwitter', 'socialInstagram', 'socialYoutube', 'socialLinkedin',
            'primaryColor', 'secondaryColor', 'accentColor', 'buttonColor', 'buttonHoverColor',
            'headerColor', 'footerColor', 'textColor', 'backgroundColor',
            'adminPrimaryColor', 'adminSecondaryColor', 'adminAccentColor',
            'adminSidebarColor', 'adminHeaderColor', 'adminSuccessColor', 'adminWarningColor', 'adminDangerColor',
            'taxRate', 'shippingFee', 'freeShippingThreshold',
            'metaTitle', 'metaDescription'
        ];

        fieldsToValidate.forEach(field => {
            const value = settings[field];
            if (value !== undefined && value !== null && value !== '') {
                const error = validateField(field, value);
                if (error) {
                    errors[field] = error;
                    hasErrors = true;
                }
            }
        });

        setValidationErrors(errors);
        return !hasErrors;
    };

    const handleSave = async () => {
        // Validate all fields first
        if (!validateAllFields()) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        setSaving(true);
        try {
            const response = await api.put('/settings', settings);
            const savedData = response.data?.data || response.data;
            setSettings(savedData);
            setOriginalSettings(savedData);
            setHasUnsavedChanges(false);
            toast.success('Settings saved successfully');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            const message = error?.response?.data?.message || 'Failed to save settings';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const resetAppearance = () => {
        if (!window.confirm('Reset all appearance settings to default? This will reset website colors, admin colors, and typography.')) return;
        setSettings(prev => ({ ...prev, ...DEFAULT_COLORS, ...DEFAULT_ADMIN_COLORS, ...DEFAULT_TYPOGRAPHY }));
        toast.success('Appearance reset to defaults');
    };

    // File validation helper
    const validateFile = (file: File): { valid: boolean; error?: string } => {
        if (file.size > FILE_VALIDATION.maxSize) {
            return { valid: false, error: `File size must be less than ${FILE_VALIDATION.maxSize / (1024 * 1024)}MB` };
        }
        if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
            return { valid: false, error: `File type not allowed. Supported: ${FILE_VALIDATION.allowedExtensions.join(', ')}` };
        }
        return { valid: true };
    };

    // File Upload Handlers
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid file');
            e.target.value = '';
            return;
        }

        setUploadingLogo(true);
        const uploadData = new FormData();
        uploadData.append('images', file);

        try {
            const response = await api.post('/upload/images', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const urls = response.data?.urls || response.data;
            if (urls && urls[0]) {
                handleChange('logo', urls[0]);
                toast.success('Logo uploaded successfully!');
            } else {
                toast.error('Upload succeeded but no URL returned');
            }
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            const message = error?.response?.data?.message || 'Error uploading logo';
            toast.error(message);
        } finally {
            setUploadingLogo(false);
            e.target.value = '';
        }
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid file');
            e.target.value = '';
            return;
        }

        setUploadingFavicon(true);
        const uploadData = new FormData();
        uploadData.append('images', file);

        try {
            const response = await api.post('/upload/images', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const urls = response.data?.urls || response.data;
            if (urls && urls[0]) {
                handleChange('favicon', urls[0]);
                toast.success('Favicon uploaded successfully!');
            } else {
                toast.error('Upload succeeded but no URL returned');
            }
        } catch (error: any) {
            console.error('Error uploading favicon:', error);
            const message = error?.response?.data?.message || 'Error uploading favicon';
            toast.error(message);
        } finally {
            setUploadingFavicon(false);
            e.target.value = '';
        }
    };

    // Hero Banner Management
    const addHeroBanner = () => {
        const banners = settings.heroBanners || [];
        if (banners.length >= 10) {
            toast.error('Maximum 10 hero banners allowed');
            return;
        }
        handleChange('heroBanners', [...banners, { image: '', title: '', subtitle: '', buttonText: '', buttonLink: '' }]);
    };

    const removeHeroBanner = (index: number) => {
        if (!window.confirm('Remove this banner slide?')) return;
        const banners = settings.heroBanners || [];
        handleChange('heroBanners', banners.filter((_, i) => i !== index));
        toast.success('Banner removed');
    };

    const updateHeroBanner = (index: number, field: keyof HeroBanner, value: string) => {
        const banners = [...(settings.heroBanners || [])];
        banners[index] = { ...banners[index], [field]: value };
        handleChange('heroBanners', banners);
    };

    // Message Templates Functions
    const fetchTemplates = async () => {
        setTemplatesLoading(true);
        try {
            const response = await api.get('/message-templates');
            setTemplates(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            // Don't show error toast - templates API might not exist yet
        } finally {
            setTemplatesLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'templates') {
            fetchTemplates();
        }
    }, [activeTab]);

    const openTemplateModal = (template?: MessageTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setTemplateForm({
                name: template.name,
                content: template.content,
                category: template.category,
                variables: template.variables || [],
                isActive: template.isActive,
            });
        } else {
            setEditingTemplate(null);
            setTemplateForm(DEFAULT_TEMPLATE_FORM);
        }
        setNewVariable({ name: '', placeholder: '', defaultValue: '' });
        setShowTemplateModal(true);
    };

    const handleAddVariable = () => {
        if (!newVariable.name.trim() || !newVariable.placeholder.trim()) {
            toast.error('Variable name and placeholder are required');
            return;
        }
        setTemplateForm(prev => ({
            ...prev,
            variables: [...prev.variables, { ...newVariable }]
        }));
        setNewVariable({ name: '', placeholder: '', defaultValue: '' });
    };

    const handleRemoveVariable = (index: number) => {
        setTemplateForm(prev => ({
            ...prev,
            variables: prev.variables.filter((_, i) => i !== index)
        }));
    };

    const insertVariable = (varName: string) => {
        // Get textarea element and cursor position
        const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
        if (textarea) {
            const cursorPos = textarea.selectionStart || 0;
            const textBefore = templateForm.content.substring(0, cursorPos);
            const textAfter = templateForm.content.substring(cursorPos);
            setTemplateForm(prev => ({
                ...prev,
                content: textBefore + `{{${varName}}}` + textAfter
            }));
            // Restore focus and cursor position after state update
            setTimeout(() => {
                textarea.focus();
                const newPos = cursorPos + varName.length + 4; // {{}} = 4 chars
                textarea.setSelectionRange(newPos, newPos);
            }, 0);
        } else {
            // Fallback: append to end if textarea not found
            setTemplateForm(prev => ({
                ...prev,
                content: prev.content + `{{${varName}}}`
            }));
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateForm.name.trim() || !templateForm.content.trim()) {
            toast.error('Template name and content are required');
            return;
        }

        setSaving(true);
        try {
            if (editingTemplate) {
                await api.put(`/message-templates/${editingTemplate._id}`, templateForm);
                toast.success('Template updated successfully');
            } else {
                await api.post('/message-templates', templateForm);
                toast.success('Template created successfully');
            }
            setShowTemplateModal(false);
            setEditingTemplate(null);
            setTemplateForm(DEFAULT_TEMPLATE_FORM);
            fetchTemplates();
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;

        try {
            await api.delete(`/message-templates/${id}`);
            toast.success('Template deleted successfully');
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            toast.error('Failed to delete template');
        }
    };

    const ColorInput = ({ label, field, defaultValue }: { label: string; field: string; defaultValue: string }) => {
        const error = validationErrors[field];
        return (
            <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>{label}</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box
                        sx={{
                            position: 'relative',
                            width: 48,
                            height: 40,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '2px solid',
                            borderColor: error ? 'error.main' : 'divider',
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        <input
                            type="color"
                            value={settings[field] || defaultValue}
                            onChange={(e) => handleChange(field, e.target.value)}
                            style={{
                                position: 'absolute',
                                inset: -4,
                                width: 'calc(100% + 8px)',
                                height: 'calc(100% + 8px)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        />
                    </Box>
                    <TextField
                        size="small"
                        value={settings[field] || defaultValue}
                        onChange={(e) => handleChange(field, e.target.value)}
                        error={!!error}
                        helperText={error}
                        sx={{ flex: 1 }}
                        slotProps={{
                            input: {
                                sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                            }
                        }}
                    />
                </Box>
            </Box>
        );
    };

    if (loading) {
        return (
            <Box>
                {/* Skeleton Header */}
                <Box sx={{ background: 'linear-gradient(to right, #374151, #4B5563)', borderRadius: 1, p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <SettingsIcon sx={{ color: 'white' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>Settings</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading settings...</Typography>
                        </Box>
                        <CircularProgress size={32} sx={{ color: 'white' }} />
                    </Box>
                </Box>
                {/* Skeleton Tabs */}
                <Box sx={{ mb: 3, display: 'flex', gap: 1, overflowX: 'auto', pb: 2 }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Box key={i} sx={{ height: 40, width: 100, bgcolor: 'action.hover', borderRadius: 1 }} />
                    ))}
                </Box>
                {/* Skeleton Content */}
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ height: 60, bgcolor: 'action.hover', borderRadius: 1 }} />
                            <Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 1 }} />
                            <Box sx={{ height: 150, bgcolor: 'action.hover', borderRadius: 1 }} />
                        </Box>
                    </CardContent>
                </Card>
                {retryCount > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Connection issue detected. Retrying... (Attempt {retryCount}/{MAX_RETRIES})
                    </Alert>
                )}
            </Box>
        );
    }

    const tabIndex = TABS.findIndex(t => t.id === activeTab);
    const errorCount = Object.values(validationErrors).filter(Boolean).length;

    return (
        <Box>
            {/* Unsaved Changes Warning */}
            {hasUnsavedChanges && (
                <Alert
                    severity="warning"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                        '& .MuiAlert-message': { display: 'flex', alignItems: 'center', gap: 1 }
                    }}
                >
                    You have unsaved changes. Don&apos;t forget to save before leaving.
                </Alert>
            )}

            {/* Validation Errors Warning */}
            {errorCount > 0 && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                    {errorCount} validation error{errorCount > 1 ? 's' : ''} found. Please fix before saving.
                </Alert>
            )}

            {/* Header */}
            <Box
                sx={{
                    background: hasUnsavedChanges
                        ? 'linear-gradient(to right, #92400E, #B45309)'
                        : 'linear-gradient(to right, #374151, #4B5563)',
                    borderRadius: 1,
                    p: 3,
                    mb: 4,
                    transition: 'background 0.3s ease',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SettingsIcon /> Settings
                            {hasUnsavedChanges && (
                                <Chip
                                    label="Unsaved"
                                    size="small"
                                    color="warning"
                                    sx={{ ml: 1, height: 24, fontSize: '0.7rem' }}
                                />
                            )}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                            Configure your store appearance and behavior
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {hasUnsavedChanges && (
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    if (window.confirm('Discard all unsaved changes?')) {
                                        setSettings(originalSettings);
                                        setValidationErrors({});
                                        setHasUnsavedChanges(false);
                                        toast.success('Changes discarded');
                                    }
                                }}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    color: 'white',
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Discard
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving || errorCount > 0}
                            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                bgcolor: hasUnsavedChanges ? 'success.main' : 'primary.main',
                                '&:hover': { bgcolor: hasUnsavedChanges ? 'success.dark' : 'primary.dark' }
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={tabIndex >= 0 ? tabIndex : 0}
                    onChange={(_, newValue) => { const tab = TABS[newValue]; if (tab) setActiveTab(tab.id); }}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: 48,
                        },
                    }}
                >
                    {TABS.map(tab => (
                        <Tab key={tab.id} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>{tab.icon}</span> {tab.label}</Box>} />
                    ))}
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p: 3 }}>
                    {/* Branding Tab */}
                    {activeTab === 'branding' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Site Identity Section */}
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <StorefrontIcon sx={{ color: 'var(--color-primary)' }} /> Site Identity
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Site Name"
                                            value={settings.siteName || ''}
                                            onChange={(e) => handleChange('siteName', e.target.value)}
                                            placeholder="Enter site name"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Tagline"
                                            value={settings.siteTagline || ''}
                                            onChange={(e) => handleChange('siteTagline', e.target.value)}
                                            placeholder="A catchy tagline"
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Site Description"
                                            value={settings.siteDescription || ''}
                                            onChange={(e) => handleChange('siteDescription', e.target.value)}
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Brand Assets Section */}
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <ImageIcon sx={{ color: '#10B981' }} /> Brand Assets
                                </Typography>
                                <Grid container spacing={3}>
                                    {/* Logo Upload */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Logo</Typography>
                                        {settings.logo && (
                                            <Box sx={{ mb: 2, bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                                                <Box component="img" src={settings.logo} alt="Logo" sx={{ height: 64, objectFit: 'contain', mx: 'auto', display: 'block' }} />
                                            </Box>
                                        )}
                                        <Box
                                            component="label"
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 100,
                                                border: '2px dashed',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                            }}
                                        >
                                            <CloudUploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {uploadingLogo ? 'Uploading...' : 'Click to upload'}
                                            </Typography>
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} hidden />
                                        </Box>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Or paste image URL"
                                            value={settings.logo || ''}
                                            onChange={(e) => handleChange('logo', e.target.value)}
                                            sx={{ mt: 1.5 }}
                                        />
                                    </Grid>

                                    {/* Favicon Upload */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Favicon</Typography>
                                        {settings.favicon && (
                                            <Box sx={{ mb: 2, bgcolor: 'action.hover', p: 2, borderRadius: 2, display: 'flex', justifyContent: 'center' }}>
                                                <Box component="img" src={settings.favicon} alt="Favicon" sx={{ height: 48, width: 48, objectFit: 'contain' }} />
                                            </Box>
                                        )}
                                        <Box
                                            component="label"
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 100,
                                                border: '2px dashed',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                            }}
                                        >
                                            <CloudUploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {uploadingFavicon ? 'Uploading...' : 'Click to upload'}
                                            </Typography>
                                            <input type="file" accept="image/*" onChange={handleFaviconUpload} disabled={uploadingFavicon} hidden />
                                        </Box>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Or paste image URL"
                                            value={settings.favicon || ''}
                                            onChange={(e) => handleChange('favicon', e.target.value)}
                                            sx={{ mt: 1.5 }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Hero Banner Slides Section */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SlideshowIcon sx={{ color: '#F59E0B' }} /> Hero Banner Slides
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={addHeroBanner}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Add Slide
                                    </Button>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                    Recommended size: 1920x600px
                                </Typography>

                                {(!settings.heroBanners || settings.heroBanners.length === 0) ? (
                                    <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 4, textAlign: 'center' }}>
                                        <SlideshowIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            No hero banners yet. Click &quot;Add Slide&quot; to create one.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {settings.heroBanners.map((banner, index) => (
                                            <Card key={index} variant="outlined" sx={{ p: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle2">Slide {index + 1}</Typography>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => removeHeroBanner(index)}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                                {banner.image && (
                                                    <Box sx={{ mb: 2, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                                                        <Box component="img" src={banner.image} alt={`Slide ${index + 1}`} sx={{ height: 100, width: '100%', objectFit: 'cover', borderRadius: 1 }} />
                                                    </Box>
                                                )}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Image URL"
                                                        value={banner.image || ''}
                                                        onChange={(e) => updateHeroBanner(index, 'image', e.target.value)}
                                                    />
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Title (optional)"
                                                        value={banner.title || ''}
                                                        onChange={(e) => updateHeroBanner(index, 'title', e.target.value)}
                                                    />
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Subtitle (optional)"
                                                        value={banner.subtitle || ''}
                                                        onChange={(e) => updateHeroBanner(index, 'subtitle', e.target.value)}
                                                    />
                                                    <Grid container spacing={2}>
                                                        <Grid size={6}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                placeholder="Button text"
                                                                value={banner.buttonText || ''}
                                                                onChange={(e) => updateHeroBanner(index, 'buttonText', e.target.value)}
                                                            />
                                                        </Grid>
                                                        <Grid size={6}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                placeholder="Button link"
                                                                value={banner.buttonLink || ''}
                                                                onChange={(e) => updateHeroBanner(index, 'buttonLink', e.target.value)}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </Card>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            <Divider />

                            {/* Additional Images Section */}
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <PhotoLibraryIcon sx={{ color: '#8B5CF6' }} /> Additional Images
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>About Us Image</Typography>
                                        {settings.aboutUsImage && (
                                            <Box sx={{ mb: 1, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                                                <Box component="img" src={settings.aboutUsImage} alt="About Us" sx={{ height: 80, width: '100%', objectFit: 'cover', borderRadius: 1 }} />
                                            </Box>
                                        )}
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Image URL"
                                            value={settings.aboutUsImage || ''}
                                            onChange={(e) => handleChange('aboutUsImage', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Footer Logo</Typography>
                                        {settings.footerLogo && (
                                            <Box sx={{ mb: 1, bgcolor: 'action.hover', p: 1, borderRadius: 1, display: 'flex', justifyContent: 'center' }}>
                                                <Box component="img" src={settings.footerLogo} alt="Footer Logo" sx={{ height: 48, objectFit: 'contain' }} />
                                            </Box>
                                        )}
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Logo URL"
                                            value={settings.footerLogo || ''}
                                            onChange={(e) => handleChange('footerLogo', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Email Header</Typography>
                                        {settings.emailHeaderImage && (
                                            <Box sx={{ mb: 1, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                                                <Box component="img" src={settings.emailHeaderImage} alt="Email Header" sx={{ height: 60, width: '100%', objectFit: 'cover', borderRadius: 1 }} />
                                            </Box>
                                        )}
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Image URL"
                                            value={settings.emailHeaderImage || ''}
                                            onChange={(e) => handleChange('emailHeaderImage', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PaletteIcon sx={{ color: '#9333EA' }} /> Appearance Settings
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Customize colors for your website and admin panel
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<RestartAltIcon />}
                                    onClick={resetAppearance}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Reset All to Default
                                </Button>
                            </Box>

                            {/* ═══════════════════════════════════════════════════════════ */}
                            {/* SECTION 1: Website Frontend Colors                         */}
                            {/* ═══════════════════════════════════════════════════════════ */}
                            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <Box sx={{ background: 'linear-gradient(135deg, #F85606 0%, #FF7E2B 100%)', px: 3, py: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <StorefrontIcon /> Website Frontend Colors
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                        Colors visible to customers on the storefront — inspired by Daraz &amp; Alibaba
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Primary Color" field="primaryColor" defaultValue={DEFAULT_COLORS.primaryColor} />
                                            <Typography variant="caption" color="text.secondary">Main brand color — links, buttons, highlights</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Secondary Color" field="secondaryColor" defaultValue={DEFAULT_COLORS.secondaryColor} />
                                            <Typography variant="caption" color="text.secondary">Secondary actions — sale tags, promotions</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Accent Color" field="accentColor" defaultValue={DEFAULT_COLORS.accentColor} />
                                            <Typography variant="caption" color="text.secondary">Badges, ratings, special deals</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Text Color" field="textColor" defaultValue={DEFAULT_COLORS.textColor} />
                                            <Typography variant="caption" color="text.secondary">Main body text color</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Background Color" field="backgroundColor" defaultValue={DEFAULT_COLORS.backgroundColor} />
                                            <Typography variant="caption" color="text.secondary">Page background</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Header Background" field="headerColor" defaultValue={DEFAULT_COLORS.headerColor} />
                                            <Typography variant="caption" color="text.secondary">Navigation bar background</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Footer Background" field="footerColor" defaultValue={DEFAULT_COLORS.footerColor} />
                                            <Typography variant="caption" color="text.secondary">Footer section background</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Button Color" field="buttonColor" defaultValue={DEFAULT_COLORS.buttonColor} />
                                            <Typography variant="caption" color="text.secondary">Primary CTA button fill</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Button Hover Color" field="buttonHoverColor" defaultValue={DEFAULT_COLORS.buttonHoverColor} />
                                            <Typography variant="caption" color="text.secondary">Button hover/press state</Typography>
                                        </Grid>
                                    </Grid>

                                    {/* Website Preview */}
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
                                            🔍 Website Preview
                                        </Typography>
                                        <Card
                                            variant="outlined"
                                            sx={{ borderRadius: 2, overflow: 'hidden' }}
                                        >
                                            {/* Mini header preview */}
                                            <Box sx={{ bgcolor: settings.headerColor || DEFAULT_COLORS.headerColor, px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: settings.primaryColor || DEFAULT_COLORS.primaryColor }}>YourStore</Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Typography variant="caption" sx={{ color: settings.textColor || DEFAULT_COLORS.textColor, opacity: 0.7 }}>Home</Typography>
                                                    <Typography variant="caption" sx={{ color: settings.primaryColor || DEFAULT_COLORS.primaryColor, fontWeight: 600 }}>Shop</Typography>
                                                    <Typography variant="caption" sx={{ color: settings.textColor || DEFAULT_COLORS.textColor, opacity: 0.7 }}>Contact</Typography>
                                                </Box>
                                            </Box>
                                            {/* Body preview */}
                                            <Box sx={{ bgcolor: settings.backgroundColor || DEFAULT_COLORS.backgroundColor, p: 2.5 }}>
                                                <Typography
                                                    sx={{
                                                        fontFamily: settings.headingFont || DEFAULT_TYPOGRAPHY.headingFont,
                                                        fontWeight: settings.headingFontWeight || DEFAULT_TYPOGRAPHY.headingFontWeight,
                                                        fontSize: '1.25rem',
                                                        mb: 1,
                                                        color: settings.textColor || DEFAULT_COLORS.textColor,
                                                    }}
                                                >
                                                    Featured Products
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontFamily: settings.primaryFont || DEFAULT_TYPOGRAPHY.primaryFont,
                                                        fontSize: settings.fontSize || DEFAULT_TYPOGRAPHY.fontSize,
                                                        fontWeight: settings.bodyFontWeight || DEFAULT_TYPOGRAPHY.bodyFontWeight,
                                                        color: settings.textColor || DEFAULT_COLORS.textColor,
                                                        opacity: 0.75,
                                                        mb: 2,
                                                    }}
                                                >
                                                    Discover amazing deals on the latest products.
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                                    <Box
                                                        component="button"
                                                        sx={{
                                                            bgcolor: settings.buttonColor || DEFAULT_COLORS.buttonColor,
                                                            color: '#FFFFFF',
                                                            px: 2, py: 0.75,
                                                            borderRadius: '6px',
                                                            fontWeight: 600,
                                                            fontSize: '0.8125rem',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.2s',
                                                            '&:hover': { bgcolor: settings.buttonHoverColor || DEFAULT_COLORS.buttonHoverColor },
                                                        }}
                                                    >
                                                        Shop Now
                                                    </Box>
                                                    <Box
                                                        component="button"
                                                        sx={{
                                                            bgcolor: settings.secondaryColor || DEFAULT_COLORS.secondaryColor,
                                                            color: '#FFFFFF',
                                                            px: 2, py: 0.75,
                                                            borderRadius: '6px',
                                                            fontWeight: 600,
                                                            fontSize: '0.8125rem',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        View Deals
                                                    </Box>
                                                    <Chip
                                                        label="⭐ Best Seller"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: settings.accentColor || DEFAULT_COLORS.accentColor,
                                                            color: '#212121',
                                                            fontWeight: 700,
                                                            fontSize: '0.6875rem',
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            {/* Mini footer preview */}
                                            <Box sx={{ bgcolor: settings.footerColor || DEFAULT_COLORS.footerColor, px: 2, py: 1.5 }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>© 2026 YourStore. All rights reserved.</Typography>
                                            </Box>
                                        </Card>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* ═══════════════════════════════════════════════════════════ */}
                            {/* SECTION 2: Admin Panel Colors                              */}
                            {/* ═══════════════════════════════════════════════════════════ */}
                            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <Box sx={{ background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', px: 3, py: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AdminPanelSettingsIcon /> Admin Panel Colors
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                                        Colors for the admin dashboard — professional SaaS palette
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Admin Primary" field="adminPrimaryColor" defaultValue={DEFAULT_ADMIN_COLORS.adminPrimaryColor} />
                                            <Typography variant="caption" color="text.secondary">Primary actions, active states, links</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Admin Secondary" field="adminSecondaryColor" defaultValue={DEFAULT_ADMIN_COLORS.adminSecondaryColor} />
                                            <Typography variant="caption" color="text.secondary">Secondary actions, info badges</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Admin Accent" field="adminAccentColor" defaultValue={DEFAULT_ADMIN_COLORS.adminAccentColor} />
                                            <Typography variant="caption" color="text.secondary">Highlights, CTAs, notifications</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Sidebar Background" field="adminSidebarColor" defaultValue={DEFAULT_ADMIN_COLORS.adminSidebarColor} />
                                            <Typography variant="caption" color="text.secondary">Admin sidebar/navigation background</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Header Background" field="adminHeaderColor" defaultValue={DEFAULT_ADMIN_COLORS.adminHeaderColor} />
                                            <Typography variant="caption" color="text.secondary">Admin top bar background</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Success Color" field="adminSuccessColor" defaultValue={DEFAULT_ADMIN_COLORS.adminSuccessColor} />
                                            <Typography variant="caption" color="text.secondary">Approvals, delivered, positive states</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Warning Color" field="adminWarningColor" defaultValue={DEFAULT_ADMIN_COLORS.adminWarningColor} />
                                            <Typography variant="caption" color="text.secondary">Pending, caution, in‑progress states</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <ColorInput label="Danger Color" field="adminDangerColor" defaultValue={DEFAULT_ADMIN_COLORS.adminDangerColor} />
                                            <Typography variant="caption" color="text.secondary">Errors, rejections, destructive actions</Typography>
                                        </Grid>
                                    </Grid>

                                    {/* Admin Preview */}
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
                                            🔍 Admin Panel Preview
                                        </Typography>
                                        <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex', minHeight: 180 }}>
                                            {/* Sidebar preview */}
                                            <Box sx={{
                                                width: 160,
                                                bgcolor: settings.adminSidebarColor || DEFAULT_ADMIN_COLORS.adminSidebarColor,
                                                p: 1.5,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.5,
                                                flexShrink: 0,
                                            }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1, px: 0.5 }}>Admin Panel</Typography>
                                                {['Dashboard', 'Products', 'Orders', 'Users'].map((item, idx) => (
                                                    <Box
                                                        key={item}
                                                        sx={{
                                                            px: 1, py: 0.5, borderRadius: 1,
                                                            bgcolor: idx === 0 ? (settings.adminPrimaryColor || DEFAULT_ADMIN_COLORS.adminPrimaryColor) : 'transparent',
                                                            opacity: idx === 0 ? 1 : 0.6,
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{ color: '#FFFFFF', fontSize: '0.6875rem' }}>{item}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                            {/* Main content preview */}
                                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                {/* Header bar */}
                                                <Box sx={{ bgcolor: settings.adminHeaderColor || DEFAULT_ADMIN_COLORS.adminHeaderColor, px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>Dashboard</Typography>
                                                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: settings.adminAccentColor || DEFAULT_ADMIN_COLORS.adminAccentColor }} />
                                                </Box>
                                                {/* Stats row */}
                                                <Box sx={{ p: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap', bgcolor: '#F8FAFC' }}>
                                                    {[
                                                        { label: 'Revenue', color: settings.adminPrimaryColor || DEFAULT_ADMIN_COLORS.adminPrimaryColor },
                                                        { label: 'Orders', color: settings.adminSecondaryColor || DEFAULT_ADMIN_COLORS.adminSecondaryColor },
                                                        { label: 'Delivered', color: settings.adminSuccessColor || DEFAULT_ADMIN_COLORS.adminSuccessColor },
                                                        { label: 'Pending', color: settings.adminWarningColor || DEFAULT_ADMIN_COLORS.adminWarningColor },
                                                    ].map((stat) => (
                                                        <Box
                                                            key={stat.label}
                                                            sx={{
                                                                flex: 1,
                                                                minWidth: 70,
                                                                p: 1,
                                                                borderRadius: 1,
                                                                bgcolor: stat.color,
                                                                textAlign: 'center',
                                                            }}
                                                        >
                                                            <Typography sx={{ fontSize: '0.5625rem', color: '#FFFFFF', fontWeight: 600 }}>{stat.label}</Typography>
                                                            <Typography sx={{ fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 800 }}>৳1,234</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                                {/* Danger stripe */}
                                                <Box sx={{ px: 1.5, py: 0.75, bgcolor: settings.adminDangerColor || DEFAULT_ADMIN_COLORS.adminDangerColor, opacity: 0.9 }}>
                                                    <Typography sx={{ fontSize: '0.625rem', color: '#FFFFFF', fontWeight: 500 }}>⚠ 2 orders require attention</Typography>
                                                </Box>
                                            </Box>
                                        </Card>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Divider />

                            {/* Typography Section */}
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <TextFieldsIcon /> Typography
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                    Customize fonts and text styling
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Primary Font</InputLabel>
                                            <Select
                                                value={settings.primaryFont || DEFAULT_TYPOGRAPHY.primaryFont}
                                                label="Primary Font"
                                                onChange={(e) => handleChange('primaryFont', e.target.value)}
                                            >
                                                {FONT_OPTIONS.map(font => (
                                                    <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                                                        {font}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography variant="caption" color="text.secondary">Used for body text and general content</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Secondary Font</InputLabel>
                                            <Select
                                                value={settings.secondaryFont || DEFAULT_TYPOGRAPHY.secondaryFont}
                                                label="Secondary Font"
                                                onChange={(e) => handleChange('secondaryFont', e.target.value)}
                                            >
                                                {FONT_OPTIONS.map(font => (
                                                    <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                                                        {font}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography variant="caption" color="text.secondary">Used for secondary text elements</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Heading Font</InputLabel>
                                            <Select
                                                value={settings.headingFont || DEFAULT_TYPOGRAPHY.headingFont}
                                                label="Heading Font"
                                                onChange={(e) => handleChange('headingFont', e.target.value)}
                                            >
                                                {FONT_OPTIONS.map(font => (
                                                    <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                                                        {font}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography variant="caption" color="text.secondary">Used for headings and titles</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Base Font Size</InputLabel>
                                            <Select
                                                value={settings.fontSize || DEFAULT_TYPOGRAPHY.fontSize}
                                                label="Base Font Size"
                                                onChange={(e) => handleChange('fontSize', e.target.value)}
                                            >
                                                {FONT_SIZE_OPTIONS.map(size => (
                                                    <MenuItem key={size.value} value={size.value}>
                                                        {size.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography variant="caption" color="text.secondary">Base font size for body text</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Heading Font Weight</InputLabel>
                                            <Select
                                                value={settings.headingFontWeight || DEFAULT_TYPOGRAPHY.headingFontWeight}
                                                label="Heading Font Weight"
                                                onChange={(e) => handleChange('headingFontWeight', e.target.value)}
                                            >
                                                {FONT_WEIGHT_OPTIONS.map(weight => (
                                                    <MenuItem key={weight.value} value={weight.value}>
                                                        {weight.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography variant="caption" color="text.secondary">Font weight for headings</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Body Font Weight</InputLabel>
                                            <Select
                                                value={settings.bodyFontWeight || DEFAULT_TYPOGRAPHY.bodyFontWeight}
                                                label="Body Font Weight"
                                                onChange={(e) => handleChange('bodyFontWeight', e.target.value)}
                                            >
                                                {FONT_WEIGHT_OPTIONS.map(weight => (
                                                    <MenuItem key={weight.value} value={weight.value}>
                                                        {weight.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Typography variant="caption" color="text.secondary">Font weight for body text</Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                        </Box>
                    )}

                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ContactMailIcon /> Contact Information
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Contact Email"
                                        type="email"
                                        value={settings.contactEmail || ''}
                                        onChange={(e) => handleChange('contactEmail', e.target.value)}
                                        placeholder="contact@yourstore.com"
                                        error={!!validationErrors.contactEmail}
                                        helperText={validationErrors.contactEmail || 'Primary contact email address'}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Contact Phone"
                                        type="tel"
                                        value={settings.contactPhone || ''}
                                        onChange={(e) => handleChange('contactPhone', e.target.value)}
                                        placeholder="+880XXXXXXXXXX"
                                        error={!!validationErrors.contactPhone}
                                        helperText={validationErrors.contactPhone || 'Customer support phone number'}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                size="small"
                                label="Business Address"
                                value={settings.contactAddress || ''}
                                onChange={(e) => handleChange('contactAddress', e.target.value)}
                                multiline
                                rows={3}
                                placeholder="123 Street, City, Country"
                                helperText="Full business/store address"
                            />
                        </Box>
                    )}

                    {/* Social Media Tab */}
                    {activeTab === 'social' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShareIcon /> Social Media Links
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Enter full URLs including https://
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Facebook"
                                        type="url"
                                        value={settings.socialFacebook || ''}
                                        onChange={(e) => handleChange('socialFacebook', e.target.value)}
                                        placeholder="https://facebook.com/..."
                                        error={!!validationErrors.socialFacebook}
                                        helperText={validationErrors.socialFacebook}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Instagram"
                                        type="url"
                                        value={settings.socialInstagram || ''}
                                        onChange={(e) => handleChange('socialInstagram', e.target.value)}
                                        placeholder="https://instagram.com/..."
                                        error={!!validationErrors.socialInstagram}
                                        helperText={validationErrors.socialInstagram}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Twitter/X"
                                        type="url"
                                        value={settings.socialTwitter || ''}
                                        onChange={(e) => handleChange('socialTwitter', e.target.value)}
                                        placeholder="https://twitter.com/..."
                                        error={!!validationErrors.socialTwitter}
                                        helperText={validationErrors.socialTwitter}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="YouTube"
                                        type="url"
                                        value={settings.socialYoutube || ''}
                                        onChange={(e) => handleChange('socialYoutube', e.target.value)}
                                        placeholder="https://youtube.com/..."
                                        error={!!validationErrors.socialYoutube}
                                        helperText={validationErrors.socialYoutube}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="LinkedIn"
                                        type="url"
                                        value={settings.socialLinkedin || ''}
                                        onChange={(e) => handleChange('socialLinkedin', e.target.value)}
                                        placeholder="https://linkedin.com/..."
                                        error={!!validationErrors.socialLinkedin}
                                        helperText={validationErrors.socialLinkedin}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Business Tab */}
                    {activeTab === 'business' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusinessIcon /> Business Settings
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Currency Code"
                                        value={settings.currency || 'BDT'}
                                        onChange={(e) => handleChange('currency', e.target.value)}
                                        placeholder="BDT"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Currency Symbol"
                                        value={settings.currencySymbol || '৳'}
                                        onChange={(e) => handleChange('currencySymbol', e.target.value)}
                                        placeholder="৳"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Tax Rate (%)"
                                        type="number"
                                        value={settings.taxRate || 0}
                                        onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Default Shipping Fee"
                                        type="number"
                                        value={settings.shippingFee || 0}
                                        onChange={(e) => handleChange('shippingFee', parseFloat(e.target.value))}
                                        inputProps={{ min: 0 }}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Free Shipping Threshold"
                                        type="number"
                                        value={settings.freeShippingThreshold || 0}
                                        onChange={(e) => handleChange('freeShippingThreshold', parseFloat(e.target.value))}
                                        inputProps={{ min: 0 }}
                                        helperText="Orders above this amount get free shipping. Set to 0 to disable."
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* SEO Tab */}
                    {activeTab === 'seo' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SearchIcon /> SEO Settings
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                label="Meta Title"
                                value={settings.metaTitle || ''}
                                onChange={(e) => handleChange('metaTitle', e.target.value)}
                                placeholder="Your Store - Best Products Online"
                                inputProps={{ maxLength: 60 }}
                                helperText={`${(settings.metaTitle || '').length}/60 characters`}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                label="Meta Description"
                                value={settings.metaDescription || ''}
                                onChange={(e) => handleChange('metaDescription', e.target.value)}
                                placeholder="Shop the best products at amazing prices..."
                                multiline
                                rows={3}
                                inputProps={{ maxLength: 160 }}
                                helperText={`${(settings.metaDescription || '').length}/160 characters`}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                label="Meta Keywords"
                                value={settings.metaKeywords || ''}
                                onChange={(e) => handleChange('metaKeywords', e.target.value)}
                                placeholder="ecommerce, shop, products, online store"
                                helperText="Comma-separated keywords"
                            />
                        </Box>
                    )}

                    {/* Message Templates Tab */}
                    {activeTab === 'templates' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MessageIcon /> Message Templates
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                        Create and manage WhatsApp message templates
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="info"
                                    startIcon={<AddIcon />}
                                    onClick={() => openTemplateModal()}
                                    sx={{ textTransform: 'none', fontWeight: 500 }}
                                >
                                    Create Template
                                </Button>
                            </Box>

                            {templatesLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                    <CircularProgress color="info" />
                                </Box>
                            ) : templates.length === 0 ? (
                                <Box sx={{ bgcolor: 'action.hover', borderRadius: 3, p: 6, textAlign: 'center' }}>
                                    <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        No templates yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                        Create your first message template to get started
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={2}>
                                    {templates.map((template) => (
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={template._id}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    height: '100%',
                                                    transition: 'border-color 0.2s',
                                                    '&:hover': { borderColor: 'info.main' },
                                                }}
                                            >
                                                <CardContent sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                                {template.name}
                                                            </Typography>
                                                            <Chip
                                                                label={template.category}
                                                                size="small"
                                                                color={getCategoryChipColor(template.category)}
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            <IconButton size="small" onClick={() => setPreviewTemplate(template)} title="Preview">
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => openTemplateModal(template)} title="Edit">
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => handleDeleteTemplate(template._id)} title="Delete" color="error">
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            mb: 1.5,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}
                                                    >
                                                        {template.content}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            Used {template.usageCount || 0} times
                                                        </Typography>
                                                        {template.variables?.length > 0 && (
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                {template.variables.length} variables
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* Email Templates Tab */}
                    {activeTab === 'email-templates' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailIcon /> Email Templates
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'grey.400', mt: 0.5 }}>
                                        Create and manage email templates for notifications
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={filterType}
                                            label="Type"
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <MenuItem value="all">All Types</MenuItem>
                                            <MenuItem value="verification">Verification</MenuItem>
                                            <MenuItem value="welcome">Welcome</MenuItem>
                                            <MenuItem value="password_reset">Password Reset</MenuItem>
                                            <MenuItem value="order_confirmation">Order Confirmation</MenuItem>
                                            <MenuItem value="order_status">Order Status</MenuItem>
                                            <MenuItem value="shipping">Shipping</MenuItem>
                                            <MenuItem value="promotional">Promotional</MenuItem>
                                            <MenuItem value="newsletter">Newsletter</MenuItem>
                                            <MenuItem value="custom">Custom</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={() => openEmailModal()}
                                        sx={{ textTransform: 'none', fontWeight: 500 }}
                                    >
                                        Create Template
                                    </Button>
                                </Box>
                            </Box>

                            {emailLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                    <CircularProgress />
                                </Box>
                            ) : emailTemplates.length === 0 ? (
                                <Box sx={{ bgcolor: 'action.hover', borderRadius: 3, p: 6, textAlign: 'center' }}>
                                    <EmailIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'grey.300' }}>
                                        No email templates yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'grey.500', mt: 1 }}>
                                        Create your first email template to get started
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={2}>
                                    {(filterType === 'all' ? emailTemplates : emailTemplates.filter(t => t.type === filterType)).map((template) => (
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={template._id}>
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    height: '100%',
                                                    transition: 'border-color 0.2s',
                                                    opacity: !template.isActive ? 0.6 : 1,
                                                    '&:hover': { borderColor: 'primary.main' },
                                                }}
                                            >
                                                <CardContent sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                    {template.name}
                                                                </Typography>
                                                                {template.isDefault && <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />}
                                                            </Box>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'grey.400',
                                                                    display: 'block',
                                                                    mb: 1,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {template.subject}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                <Chip
                                                                    label={(template.type || 'custom').replace('_', ' ')}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                                <Chip
                                                                    label={template.category || 'custom'}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    <Divider sx={{ my: 1.5 }} />

                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                                            Used {template.usageCount || 0} times
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setEmailPreviewHtml(template.htmlContent || '');
                                                                    setShowEmailPreview(true);
                                                                }}
                                                                title="Preview"
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDuplicateEmail(template._id)}
                                                                title="Duplicate"
                                                            >
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleSetDefaultEmail(template._id)}
                                                                title={template.isDefault ? 'Default Template' : 'Set as Default'}
                                                                color={template.isDefault ? 'warning' : 'default'}
                                                            >
                                                                {template.isDefault ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleToggleActiveEmail(template._id)}
                                                                title={template.isActive ? 'Deactivate' : 'Activate'}
                                                                color={template.isActive ? 'success' : 'default'}
                                                            >
                                                                {template.isActive ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => openEmailModal(template)}
                                                                title="Edit"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteEmailTemplate(template._id)}
                                                                title="Delete"
                                                                color="error"
                                                                disabled={template.isDefault}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BuildIcon /> Maintenance Mode
                            </Typography>

                            <Alert severity="warning" variant="outlined">
                                When maintenance mode is enabled, customers will see a maintenance page instead of the store.
                            </Alert>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode || false}
                                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                        color="error"
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 500, color: settings.maintenanceMode ? 'error.main' : 'grey.400' }}>
                                        {settings.maintenanceMode ? '🔴 Maintenance Mode ON' : '🟢 Store is Live'}
                                    </Typography>
                                }
                            />

                            <TextField
                                fullWidth
                                size="small"
                                label="Maintenance Message"
                                value={settings.maintenanceMessage || ''}
                                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                                placeholder="We're currently performing maintenance. Please check back soon!"
                                multiline
                                rows={4}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Save Button (fixed at bottom) */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 3, px: 4 }}
                >
                    {saving ? 'Saving...' : 'Save All Settings'}
                </Button>
            </Box>

            {/* Template Builder Modal */}
            <Dialog
                open={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { maxHeight: '90vh' } }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(to right, #0891B2, #2563EB)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {editingTemplate ? <><EditIcon /> Edit Template</> : <><AddIcon /> Create Message Template</>}
                    </Typography>
                    <IconButton onClick={() => setShowTemplateModal(false)} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
                    {/* Template Name */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Template Name *"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Order Confirmation"
                    />

                    {/* Category */}
                    <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={templateForm.category}
                            label="Category"
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value as TemplateFormData['category'] }))}
                        >
                            <MenuItem value="promotional">Promotional</MenuItem>
                            <MenuItem value="notification">Notification</MenuItem>
                            <MenuItem value="reminder">Reminder</MenuItem>
                            <MenuItem value="announcement">Announcement</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Variables Section */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.300', mb: 1 }}>
                            Variables (Optional)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <TextField
                                size="small"
                                value={newVariable.name}
                                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Variable name"
                                sx={{ flex: 1, minWidth: 100 }}
                            />
                            <TextField
                                size="small"
                                value={newVariable.placeholder}
                                onChange={(e) => setNewVariable(prev => ({ ...prev, placeholder: e.target.value }))}
                                placeholder="Placeholder text"
                                sx={{ flex: 1, minWidth: 100 }}
                            />
                            <TextField
                                size="small"
                                value={newVariable.defaultValue}
                                onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                                placeholder="Default value (optional)"
                                sx={{ flex: 1, minWidth: 100 }}
                            />
                            <Button
                                variant="contained"
                                color="info"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleAddVariable}
                                sx={{ textTransform: 'none' }}
                            >
                                Add
                            </Button>
                        </Box>

                        {templateForm.variables.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {templateForm.variables.map((variable, index) => (
                                    <Chip
                                        key={index}
                                        label={`{{${variable.name}}}`}
                                        color="info"
                                        variant="outlined"
                                        onClick={() => insertVariable(variable.name)}
                                        onDelete={() => handleRemoveVariable(index)}
                                        deleteIcon={<CloseIcon fontSize="small" />}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        )}
                        <Typography variant="caption" sx={{ color: 'grey.500', mt: 1, display: 'block' }}>
                            Click on a variable to insert it into your message
                        </Typography>
                    </Box>

                    {/* Message Content */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Message Content *"
                        id="template-content"
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                        multiline
                        rows={6}
                        placeholder={'Enter your message template here...\n\nUse {{variableName}} to insert dynamic content.'}
                    />

                    {/* Preview */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.300', mb: 1 }}>Preview</Typography>
                        <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
                            <Typography variant="body2" sx={{ color: 'grey.300', whiteSpace: 'pre-wrap' }}>
                                {templateForm.content || 'Your message will appear here...'}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setShowTemplateModal(false)}
                        sx={{ textTransform: 'none', flex: 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={handleSaveTemplate}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                        sx={{ textTransform: 'none', flex: 1 }}
                    >
                        {saving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Template Preview Modal */}
            <Dialog
                open={!!previewTemplate}
                onClose={() => setPreviewTemplate(null)}
                maxWidth="sm"
                fullWidth
            >
                {previewTemplate && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{previewTemplate.name}</Typography>
                                <Chip
                                    label={previewTemplate.category}
                                    size="small"
                                    color={getCategoryChipColor(previewTemplate.category)}
                                    variant="outlined"
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                            <IconButton onClick={() => setPreviewTemplate(null)}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent dividers>
                            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, mb: 2 }}>
                                <Typography variant="body2" sx={{ color: 'grey.300', whiteSpace: 'pre-wrap' }}>
                                    {previewTemplate.content}
                                </Typography>
                            </Box>

                            {previewTemplate.variables?.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Variables:</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {previewTemplate.variables.map((variable, index) => (
                                            <Box key={index} sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={`{{${variable.name}}}`}
                                                        size="small"
                                                        color="info"
                                                        variant="outlined"
                                                        sx={{ fontFamily: 'monospace' }}
                                                    />
                                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                                        → {variable.placeholder}
                                                    </Typography>
                                                </Box>
                                                {variable.defaultValue && (
                                                    <Typography variant="caption" sx={{ color: 'grey.500', mt: 0.5, display: 'block', ml: 1 }}>
                                                        Default: <span style={{ color: '#9CA3AF' }}>{variable.defaultValue}</span>
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setPreviewTemplate(null)}
                                sx={{ textTransform: 'none' }}
                            >
                                Close Preview
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Email Template Builder Modal */}
            <EmailTemplateBuilderModal
                open={showEmailModal}
                onClose={() => { setShowEmailModal(false); setEditingEmail(null); }}
                onSave={handleSaveEmailTemplate}
                editTemplate={editingEmail}
            />

            {/* Email Preview Modal */}
            <Dialog
                open={showEmailPreview}
                onClose={() => setShowEmailPreview(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { maxHeight: '90vh', bgcolor: 'white' } }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Email Preview</Typography>
                    <IconButton onClick={() => setShowEmailPreview(false)} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Box
                        sx={{ border: 1, borderColor: 'grey.300', borderRadius: 2, overflow: 'hidden' }}
                        dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
