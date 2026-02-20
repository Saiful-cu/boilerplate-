'use client';

import { useSettings } from '@/lib/context/SettingsContext';
import Link from 'next/link';
import { getAssetUrl } from '@/lib/api';
import { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Alert,
    AlertTitle,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Paper,
    Rating,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/* ─── Loading Spinner ─── */
export function LoadingSpinner({ size = 'md', text, testId }: { size?: 'sm' | 'md' | 'lg'; text?: string; testId?: string }) {
    const sizeMap = { sm: 24, md: 40, lg: 64 };
    const { settings } = useSettings();
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }} data-testid={testId}>
            <CircularProgress size={sizeMap[size]} sx={{ color: settings?.primaryColor || 'primary.main' }} />
            {text && <Typography color="text.secondary" fontWeight={500}>{text}</Typography>}
        </Box>
    );
}

/* ─── Empty State ─── */
export function EmptyState({ icon, title, description, action, actionText, onAction, testId }: {
    icon?: string;
    title: string;
    description?: string;
    action?: { label: string; href: string };
    actionText?: string;
    onAction?: () => void;
    testId?: string;
}) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 2, textAlign: 'center' }} data-testid={testId}>
            {icon && <Typography sx={{ fontSize: '3.5rem', mb: 2 }}>{icon}</Typography>}
            <Typography variant="h5" fontWeight={700} gutterBottom>{title}</Typography>
            {description && <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>{description}</Typography>}
            {action && (
                <Button component={Link} href={action.href} variant="contained" size="large">
                    {action.label}
                </Button>
            )}
            {!action && actionText && onAction && (
                <Button onClick={onAction} variant="contained" size="large">
                    {actionText}
                </Button>
            )}
        </Box>
    );
}

/* ─── Alert Components ─── */
export function ErrorAlert({ message, testId }: { message: string; testId?: string }) {
    return (
        <Alert severity="error" icon={<WarningAmberIcon />} sx={{ borderRadius: 3 }} data-testid={testId}>
            <AlertTitle>Error</AlertTitle>
            {message}
        </Alert>
    );
}

export function SuccessAlert({ message }: { message: string }) {
    return (
        <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ borderRadius: 3 }}>
            <AlertTitle>Success</AlertTitle>
            {message}
        </Alert>
    );
}

/* ─── Form Input ─── */
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: string;
    testId?: string;
    hint?: string;
}

export function FormInput({ label, error, icon, testId, hint, id, ...props }: FormInputProps) {
    return (
        <Box sx={{ mb: 2 }}>
            <TextField
                fullWidth
                label={`${icon ? icon + ' ' : ''}${label}`}
                error={!!error}
                helperText={error || hint}
                inputProps={{ 'data-testid': testId, ...props }}
                id={id}
                value={props.value}
                onChange={props.onChange as any}
                name={props.name}
                type={props.type}
                placeholder={props.placeholder}
                required={props.required}
                autoComplete={props.autoComplete}
            />
        </Box>
    );
}

/* ─── Submit Button ─── */
interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    testId?: string;
    gradient?: string;
    hoverGradient?: string;
    children: ReactNode;
}

export function SubmitButton({ loading, loadingText, testId, gradient, hoverGradient, children }: SubmitButtonProps) {
    const { settings } = useSettings();
    const resolvedBackground = gradient
        ? `linear-gradient(to right, ${gradient.replace('from-', '').replace(' to-', ', ')})`
        : settings?.buttonColor || 'primary.main';
    const resolvedHoverBackground = hoverGradient
        ? `linear-gradient(to right, ${hoverGradient.replace('from-', '').replace(' to-', ', ')})`
        : resolvedBackground;

    return (
        <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            data-testid={testId}
            sx={{
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '0.9375rem',
                background: resolvedBackground,
                '&:hover': { background: resolvedHoverBackground, opacity: 0.9 },
            }}
        >
            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    {loadingText || 'Processing...'}
                </Box>
            ) : (
                children
            )}
        </Button>
    );
}

/* ─── Page Container ─── */
export function PageContainer({ children, className = '', gradient, testId }: { children: ReactNode; className?: string; gradient?: string; testId?: string }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                py: 4,
                px: 2,
                ...(gradient ? { background: gradient } : {}),
            }}
            className={className}
            data-testid={testId}
        >
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                {children}
            </Box>
        </Box>
    );
}

/* ─── Form Container ─── */
export function FormContainer({ children, title, subtitle, icon, testId }: { children: ReactNode; title: string; subtitle?: string; icon?: string; testId?: string }) {
    const { settings } = useSettings();
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, px: 2, bgcolor: '#F9FAFB' }} data-testid={testId}>
            <Box sx={{ width: '100%', maxWidth: 440 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    {icon && <Typography sx={{ fontSize: '3rem', mb: 2 }}>{icon}</Typography>}
                    {settings?.logo ? (
                        <img src={getAssetUrl(settings.logo)} alt="Logo" style={{ height: 64, margin: '0 auto 16px' }} />
                    ) : (
                        <Typography variant="h4" fontWeight={800} sx={{ color: settings?.primaryColor || 'primary.main', mb: 1 }}>
                            {settings?.siteName || 'Noboraz'}
                        </Typography>
                    )}
                    <Typography variant="h5" fontWeight={700}>{title}</Typography>
                    {subtitle && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
                </Box>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                    {children}
                </Paper>
            </Box>
        </Box>
    );
}

/* ─── Product Card ─── */
export function ProductCard({ product }: { product: any }) {
    const { settings } = useSettings();
    const imageUrl = product.images && product.images.length > 0 ? getAssetUrl(product.images[0]) : '/placeholder-product.png';
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

    return (
        <Card
            component={Link}
            href={`/products/${product._id}`}
            sx={{
                textDecoration: 'none',
                display: 'block',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                '&:hover img': { transform: 'scale(1.1)' },
            }}
        >
            <Box sx={{ position: 'relative', overflow: 'hidden', aspectRatio: '1', bgcolor: '#F3F4F6' }}>
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={product.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                />
                {hasDiscount && (
                    <Chip
                        label={`-${discountPercent}%`}
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700 }}
                    />
                )}
                {product.stock <= 0 && (
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Chip label="Out of Stock" sx={{ bgcolor: '#fff', fontWeight: 700 }} />
                    </Box>
                )}
            </Box>
            <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', mb: 1, color: 'text.primary' }}>
                    {product.name}
                </Typography>
                {product.category && (
                    <Chip label={product.category} size="small" variant="outlined" sx={{ mb: 1, height: 22, fontSize: '0.6875rem' }} />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: settings?.primaryColor || 'primary.main' }}>
                        ৳{product.price?.toLocaleString()}
                    </Typography>
                    {hasDiscount && (
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                            ৳{product.compareAtPrice?.toLocaleString()}
                        </Typography>
                    )}
                </Box>
                {product.rating > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <Rating value={product.rating} precision={0.5} size="small" readOnly />
                        <Typography variant="caption" color="text.secondary">({product.numReviews || 0})</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

/* ─── Badge ─── */
export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' }) {
    const colorMap = {
        default: 'default' as const,
        success: 'success' as const,
        warning: 'warning' as const,
        error: 'error' as const,
    };
    return (
        <Chip label={children} color={colorMap[variant]} size="small" />
    );
}

/* ─── Section Header ─── */
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: { label: string; href: string } }) {
    const { settings } = useSettings();
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 4 }}>
            <Box>
                <Typography variant="h4" fontWeight={800}>{title}</Typography>
                {subtitle && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
                <Box sx={{ width: 64, height: 4, borderRadius: 2, mt: 1.5, bgcolor: settings?.primaryColor || 'primary.main' }} />
            </Box>
            {action && (
                <Button component={Link} href={action.href} sx={{ fontWeight: 600 }}>
                    {action.label} →
                </Button>
            )}
        </Box>
    );
}
