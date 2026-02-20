'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Alert,
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    CircularProgress,
    Skeleton,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    SelectChangeEvent,
    alpha,
} from '@mui/material';
import GridLegacy from '@mui/material/GridLegacy';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface PromoCode {
    _id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount?: number | null;
    usageLimit?: number | null;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
}

interface PromoCodeFormData {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: string;
    usageLimit: string;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
}

const initialFormData: PromoCodeFormData = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    validFrom: new Date().toISOString().split('T')[0] ?? '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
    isActive: true,
};

const statusChipColor = (color: string): 'default' | 'primary' | 'error' | 'warning' | 'success' | 'info' => {
    if (color === 'bg-gray-500') return 'default';
    if (color === 'bg-blue-500') return 'info';
    if (color === 'bg-red-500') return 'error';
    if (color === 'bg-orange-500') return 'warning';
    if (color === 'bg-green-500') return 'success';
    return 'default';
};

export default function AdminPromoCodes() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [formData, setFormData] = useState<PromoCodeFormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    const fetchPromoCodes = useCallback(async (retry = 0) => {
        setError(null);
        try {
            const response = await api.get('/promo-codes');
            setPromoCodes(response.data?.data || response.data || []);
            setRetryCount(0);
        } catch (err) {
            console.error('Error fetching promo codes:', err);
            if (retry < MAX_RETRIES) {
                setRetryCount(retry + 1);
                setTimeout(() => fetchPromoCodes(retry + 1), RETRY_DELAY * Math.pow(2, retry));
                return;
            }
            setError('Failed to fetch promo codes. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromoCodes();
    }, [fetchPromoCodes]);

    const getStatusInfo = (promo: PromoCode): { color: string; text: string } => {
        if (!promo.isActive) return { color: 'bg-gray-500', text: 'Inactive' };

        const now = new Date();
        const validFrom = new Date(promo.validFrom);
        const validUntil = new Date(promo.validUntil);

        if (now < validFrom) return { color: 'bg-blue-500', text: 'Scheduled' };
        if (now > validUntil) return { color: 'bg-red-500', text: 'Expired' };
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            return { color: 'bg-orange-500', text: 'Limit Reached' };
        }
        return { color: 'bg-green-500', text: 'Active' };
    };

    const handleEdit = (promo: PromoCode) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            minOrderAmount: promo.minOrderAmount,
            maxDiscountAmount: promo.maxDiscountAmount?.toString() || '',
            usageLimit: promo.usageLimit?.toString() || '',
            validFrom: new Date(promo.validFrom).toISOString().split('T')[0] ?? '',
            validUntil: new Date(promo.validUntil).toISOString().split('T')[0] ?? '',
            isActive: promo.isActive,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this promo code?')) return;

        try {
            await api.delete(`/promo-codes/${id}`);
            toast.success('Promo code deleted');
            fetchPromoCodes();
        } catch (error) {
            console.error('Error deleting promo code:', error);
            toast.error('Failed to delete promo code');
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingPromo(null);
        setShowModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code.trim()) {
            toast.error('Promo code is required');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
            };

            if (editingPromo) {
                await api.put(`/promo-codes/${editingPromo._id}`, payload);
                toast.success('Promo code updated');
            } else {
                await api.post('/promo-codes', payload);
                toast.success('Promo code created');
            }
            resetForm();
            fetchPromoCodes();
        } catch (error) {
            console.error('Error saving promo code:', error);
            toast.error('Failed to save promo code');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box>
                <Box sx={{ background: 'linear-gradient(to right, #9333ea, #db2777)', borderRadius: 1, p: 3, mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>🎟️ Promo Codes</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                        {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading promo codes...'}
                    </Typography>
                </Box>
                <GridLegacy container spacing={2}>
                    {[1, 2, 3, 4].map((i) => (
                        <GridLegacy item xs={12} sm={6} lg={4} key={i}>
                            <Skeleton variant="rounded" height={220} />
                        </GridLegacy>
                    ))}
                </GridLegacy>
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Box sx={{ background: 'linear-gradient(to right, #9333ea, #db2777)', borderRadius: 1, p: 3, mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>🎟️ Promo Codes</Typography>
                    <Typography sx={{ color: 'rgba(233,213,255,0.8)', mt: 0.5 }}>Manage discount codes</Typography>
                </Box>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => { setLoading(true); fetchPromoCodes(0); }} startIcon={<RefreshIcon />}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(to right, #9333ea, #db2777)',
                    borderRadius: 1,
                    p: 3,
                    mb: 4,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>
                            🎟️ Promo Codes
                        </Typography>
                        <Typography sx={{ color: 'rgba(233,213,255,0.8)', mt: 0.5 }}>
                            {promoCodes.length} promo codes
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        sx={{
                            bgcolor: '#fff',
                            color: '#9333ea',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'rgba(243,232,255,1)' },
                        }}
                    >
                        Add Promo Code
                    </Button>
                </Box>
            </Box>

            {/* Promo Codes Grid */}
            {promoCodes.length === 0 ? (
                <Card
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                    }}
                >
                    <CardContent sx={{ py: 6, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎟️</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                            No promo codes yet
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            Create your first promo code to offer discounts
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <GridLegacy container spacing={3}>
                    {promoCodes.map((promo) => {
                        const status = getStatusInfo(promo);
                        return (
                            <GridLegacy item xs={12} md={6} lg={4} key={promo._id}>
                                <Card
                                    sx={{
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        transition: 'border-color 0.2s',
                                        '&:hover': { borderColor: 'primary.main' },
                                    }}
                                >
                                    {/* Header */}
                                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Box
                                                component="code"
                                                sx={{
                                                    bgcolor: 'action.selected',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'bold',
                                                    color: 'text.primary',
                                                }}
                                            >
                                                {promo.code}
                                            </Box>
                                            <Chip
                                                label={status.text}
                                                color={statusChipColor(status.color)}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </Box>
                                        <Typography
                                            sx={{
                                                color: 'text.secondary',
                                                fontSize: '0.875rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {promo.description}
                                        </Typography>
                                    </Box>

                                    {/* Discount Info */}
                                    <Box
                                        sx={{
                                            p: 2,
                                            background: (t) => `linear-gradient(to right, ${alpha(t.palette.primary.main, 0.2)}, ${alpha(t.palette.secondary.main, 0.2)})`,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                            {promo.discountType === 'percentage'
                                                ? `${promo.discountValue}%`
                                                : `৳${promo.discountValue}`}
                                        </Typography>
                                        <Typography sx={{ color: 'primary.main', fontSize: '0.875rem', mt: 0.5 }}>
                                            {promo.discountType === 'percentage' ? 'Percentage Off' : 'Fixed Discount'}
                                        </Typography>
                                    </Box>

                                    {/* Details */}
                                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                            <Typography sx={{ color: 'text.secondary', fontSize: 'inherit' }}>Min Order:</Typography>
                                            <Typography sx={{ color: 'text.primary', fontSize: 'inherit' }}>৳{promo.minOrderAmount}</Typography>
                                        </Box>
                                        {promo.maxDiscountAmount && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                <Typography sx={{ color: 'text.secondary', fontSize: 'inherit' }}>Max Discount:</Typography>
                                                <Typography sx={{ color: 'text.primary', fontSize: 'inherit' }}>৳{promo.maxDiscountAmount}</Typography>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                            <Typography sx={{ color: 'text.secondary', fontSize: 'inherit' }}>Usage:</Typography>
                                            <Typography sx={{ color: 'text.primary', fontSize: 'inherit' }}>
                                                {promo.usedCount} / {promo.usageLimit || '∞'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                            <Typography sx={{ color: 'text.secondary', fontSize: 'inherit' }}>Valid Until:</Typography>
                                            <Typography sx={{ color: 'text.primary', fontSize: 'inherit' }}>
                                                {new Date(promo.validUntil).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                                        <Button
                                            fullWidth
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEdit(promo)}
                                            sx={{
                                                bgcolor: (t) => alpha(t.palette.primary.main, 0.2),
                                                color: 'primary.main',
                                                fontWeight: 500,
                                                textTransform: 'none',
                                                borderRadius: 2,
                                                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.4) },
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            fullWidth
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDelete(promo._id)}
                                            sx={{
                                                bgcolor: (t) => alpha(t.palette.error.main, 0.2),
                                                color: 'error.main',
                                                fontWeight: 500,
                                                textTransform: 'none',
                                                borderRadius: 2,
                                                '&:hover': { bgcolor: (t) => alpha(t.palette.error.main, 0.4) },
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </Card>
                            </GridLegacy>
                        );
                    })}
                </GridLegacy>
            )}

            {/* Modal */}
            <Dialog
                open={showModal}
                onClose={resetForm}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        backgroundImage: 'none',
                        maxHeight: '90vh',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(to right, #9333ea, #db2777)',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                    }}
                >
                    {editingPromo ? '✏️ Edit Promo Code' : '➕ Add Promo Code'}
                </DialogTitle>

                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
                        <GridLegacy container spacing={2}>
                            <GridLegacy item xs={6}>
                                <TextField
                                    label="Code"
                                    required
                                    fullWidth
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="SUMMER20"
                                    inputProps={{ style: { textTransform: 'uppercase' } }}
                                />
                            </GridLegacy>
                            <GridLegacy item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Discount Type
                                    </InputLabel>
                                    <Select
                                        value={formData.discountType}
                                        label="Discount Type"
                                        onChange={(e: SelectChangeEvent) =>
                                            setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })
                                        }
                                    >
                                        <MenuItem value="percentage">Percentage (%)</MenuItem>
                                        <MenuItem value="fixed">Fixed Amount (৳)</MenuItem>
                                    </Select>
                                </FormControl>
                            </GridLegacy>
                        </GridLegacy>

                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe this promo code"
                        />

                        <GridLegacy container spacing={2}>
                            <GridLegacy item xs={6}>
                                <TextField
                                    label="Discount Value"
                                    required
                                    fullWidth
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                    inputProps={{ min: 0 }}
                                />
                            </GridLegacy>
                            <GridLegacy item xs={6}>
                                <TextField
                                    label="Min Order Amount"
                                    fullWidth
                                    type="number"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                                    inputProps={{ min: 0 }}
                                />
                            </GridLegacy>
                        </GridLegacy>

                        <GridLegacy container spacing={2}>
                            <GridLegacy item xs={6}>
                                <TextField
                                    label="Max Discount"
                                    fullWidth
                                    type="number"
                                    value={formData.maxDiscountAmount}
                                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                    placeholder="Unlimited"
                                    inputProps={{ min: 0 }}
                                />
                            </GridLegacy>
                            <GridLegacy item xs={6}>
                                <TextField
                                    label="Usage Limit"
                                    fullWidth
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    placeholder="Unlimited"
                                    inputProps={{ min: 0 }}
                                />
                            </GridLegacy>
                        </GridLegacy>

                        <GridLegacy container spacing={2}>
                            <GridLegacy item xs={6}>
                                <TextField
                                    label="Valid From"
                                    fullWidth
                                    type="date"
                                    value={formData.validFrom}
                                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </GridLegacy>
                            <GridLegacy item xs={6}>
                                <TextField
                                    label="Valid Until"
                                    fullWidth
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </GridLegacy>
                        </GridLegacy>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
                        <Button
                            fullWidth
                            onClick={resetForm}
                            sx={{
                                bgcolor: 'action.selected',
                                color: 'text.primary',
                                fontWeight: 500,
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.5,
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            type="submit"
                            disabled={submitting}
                            sx={{
                                background: 'linear-gradient(to right, #9333ea, #db2777)',
                                color: '#fff',
                                fontWeight: 500,
                                textTransform: 'none',
                                borderRadius: 2,
                                py: 1.5,
                                '&:hover': {
                                    background: 'linear-gradient(to right, #7e22ce, #be185d)',
                                },
                                '&.Mui-disabled': { opacity: 0.5, color: '#fff' },
                            }}
                        >
                            {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : editingPromo ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
