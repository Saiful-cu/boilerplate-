'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    LinearProgress,
    Alert,
} from '@mui/material';
import {
    ShoppingBag as ShoppingBagIcon,
    LocalShipping as ShippingIcon,
    CardGiftcard as GiftIcon,
    ChevronRight as ChevronRightIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Lock as LockIcon,
    Replay as ReplayIcon,
} from '@mui/icons-material';

interface CartItemData {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
}

interface AppliedPromo {
    code: string;
    description: string;
    discountAmount: number;
}

interface OrderSummaryProps {
    cart: CartItemData[];
    getCartTotal: () => number;
    onCheckout: (promo: AppliedPromo | null) => void;
}

export default function OrderSummary({ cart, getCartTotal, onCheckout }: OrderSummaryProps) {
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
    const [validatingPromo, setValidatingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');

    const subtotal = getCartTotal();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalSavings = cart.reduce((sum, item) => {
        if (item.originalPrice && item.originalPrice > item.price) {
            return sum + (item.originalPrice - item.price) * item.quantity;
        }
        return sum;
    }, 0);

    const freeShippingThreshold = 5000;
    const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
    const amountUntilFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

    const promoDiscount = appliedPromo?.discountAmount || 0;
    const finalTotal = subtotal - promoDiscount;

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            setPromoError('Please enter a promo code');
            return;
        }

        setValidatingPromo(true);
        setPromoError('');
        try {
            const response = await api.post('/promo-codes/validate', {
                code: promoCode,
                cartTotal: subtotal,
            });

            setAppliedPromo(response.data.promoCode);
            setPromoError('');
            toast.success(`Promo code applied! You saved ৳${response.data.promoCode.discountAmount}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Invalid promo code';
            setPromoError(errorMsg);
            setAppliedPromo(null);
        } finally {
            setValidatingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
        toast.success('Promo code removed');
    };

    const handleCheckoutWithPromo = () => {
        onCheckout(appliedPromo);
    };

    return (
        <Box component="aside" sx={{ height: 'fit-content' }} aria-label="Order summary">
            <Box
                sx={{
                    borderRadius: '8px',
                    border: '1px solid #E8E8E8',
                    bgcolor: '#fff',
                    p: { xs: 2, sm: 2.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2, sm: 2.5 },
                }}
            >
                {/* Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                bgcolor: 'rgba(var(--color-primary-rgb), 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ShoppingBagIcon sx={{ fontSize: 15, color: 'var(--color-primary)' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#212121', fontFamily: 'var(--font-heading)' }}>
                            Order Summary
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </Typography>
                </Box>

                {/* Free Shipping Progress */}
                {subtotal < freeShippingThreshold && (
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: '6px',
                            bgcolor: 'rgba(var(--color-primary-rgb), 0.04)',
                            border: '1px solid #E8E8E8',
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#757575', fontSize: '0.72rem' }}>
                                <ShippingIcon sx={{ fontSize: 14 }} /> Free Shipping Progress
                            </Typography>
                            <Typography variant="caption" fontWeight={600} sx={{ color: 'var(--color-primary)', fontSize: '0.72rem' }}>
                                {Math.round(shippingProgress)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={shippingProgress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                mb: 0.75,
                                bgcolor: '#F0F0F0',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    bgcolor: 'var(--color-primary)',
                                },
                            }}
                        />
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.68rem' }}>
                            Add <strong>৳{amountUntilFreeShipping.toFixed(0)}</strong> more for FREE shipping
                        </Typography>
                    </Box>
                )}

                {/* Promo Code Section */}
                <Box
                    sx={{
                        border: '1px dashed #D0D0D0',
                        borderRadius: '6px',
                        p: 1.5,
                    }}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#757575', fontSize: '0.72rem' }}>
                            <GiftIcon sx={{ fontSize: 14, color: 'var(--color-primary)' }} />
                            {appliedPromo ? 'Promo Code Applied!' : 'Enter Promo Code'}
                        </Typography>
                        {appliedPromo && (
                            <Button
                                size="small"
                                color="error"
                                onClick={handleRemovePromo}
                                sx={{ textTransform: 'none', fontSize: '0.68rem', minWidth: 'auto', p: 0 }}
                            >
                                Remove
                            </Button>
                        )}
                    </Box>

                    {appliedPromo ? (
                        <Box
                            sx={{
                                bgcolor: 'rgba(76, 175, 80, 0.06)',
                                border: '1px solid rgba(76, 175, 80, 0.2)',
                                borderRadius: '6px',
                                p: 1.5,
                            }}
                        >
                            <Box className="flex items-center justify-between">
                                <Box>
                                    <Typography variant="body2" fontWeight="bold" color="success.dark">
                                        {appliedPromo.code}
                                    </Typography>
                                    <Typography variant="caption" color="success.main">
                                        {appliedPromo.description}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="success.main">
                                        Discount
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="success.dark">
                                        -৳{appliedPromo.discountAmount.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box className="flex flex-col sm:flex-row gap-2">
                                <TextField
                                    size="small"
                                    placeholder="Enter code"
                                    value={promoCode}
                                    onChange={(e) => {
                                        setPromoCode(e.target.value.toUpperCase());
                                        setPromoError('');
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                    disabled={validatingPromo}
                                    error={!!promoError}
                                    inputProps={{ style: { textTransform: 'uppercase' } }}
                                    sx={{ flex: 1 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleApplyPromo}
                                    disabled={validatingPromo}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        px: { xs: 2, sm: 3 },
                                    }}
                                >
                                    {validatingPromo ? 'Validating...' : 'Apply'}
                                </Button>
                            </Box>
                            {promoError && (
                                <Alert
                                    severity="error"
                                    icon={<CloseIcon fontSize="small" />}
                                    sx={{ fontSize: '0.8rem', py: 0.5 }}
                                >
                                    {promoError}
                                </Alert>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Price Breakdown */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.75rem' }}>
                            Subtotal ({totalItems} items)
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#212121', fontSize: '0.75rem' }}>
                            ৳{subtotal.toFixed(2)}
                        </Typography>
                    </Box>

                    {totalSavings > 0 && (
                        <Box
                            sx={{
                                bgcolor: 'rgba(76, 175, 80, 0.06)',
                                mx: -2.5,
                                px: 2.5,
                                py: 1,
                                borderRadius: 0,
                            }}
                        >
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="caption" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4CAF50', fontSize: '0.72rem' }}>
                                    <CheckCircleIcon sx={{ fontSize: 13 }} />
                                    Product Savings
                                </Typography>
                                <Typography variant="caption" fontWeight={600} sx={{ color: '#4CAF50', fontSize: '0.72rem' }}>
                                    −৳{totalSavings.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {appliedPromo && (
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4CAF50', fontSize: '0.72rem' }}>
                                <GiftIcon sx={{ fontSize: 13 }} />
                                Promo ({appliedPromo.code})
                            </Typography>
                            <Typography variant="caption" fontWeight={600} sx={{ color: '#4CAF50', fontSize: '0.72rem' }}>
                                −৳{appliedPromo.discountAmount.toFixed(2)}
                            </Typography>
                        </Box>
                    )}

                    <Divider sx={{ borderColor: '#F0F0F0', my: 0.5 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#212121' }}>
                            Total
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                                ৳{finalTotal.toFixed(2)}
                            </Typography>
                            {(totalSavings > 0 || appliedPromo) && (
                                <Typography variant="caption" sx={{ color: '#4CAF50', fontSize: '0.68rem' }}>
                                    You saved ৳{(totalSavings + promoDiscount).toFixed(2)}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleCheckoutWithPromo}
                        startIcon={<ChevronRightIcon />}
                        sx={{
                            py: 1.5,
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            boxShadow: 'none',
                            bgcolor: 'var(--color-primary)',
                            '&:hover': { boxShadow: 'none', bgcolor: 'var(--color-button-hover)' },
                        }}
                    >
                        Proceed to Checkout
                    </Button>

                    <Button
                        component={Link}
                        href="/products"
                        variant="outlined"
                        fullWidth
                        sx={{
                            py: 1,
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            textTransform: 'none',
                            borderColor: '#E8E8E8',
                            color: '#757575',
                            '&:hover': {
                                borderColor: 'var(--color-primary)',
                                color: 'var(--color-primary)',
                                bgcolor: 'rgba(var(--color-primary-rgb), 0.04)',
                            },
                        }}
                    >
                        ← Continue Shopping
                    </Button>
                </Box>

                {/* Payment Options */}
                <Box sx={{ borderTop: '1px solid #F0F0F0', pt: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#9E9E9E', fontSize: '0.68rem', mb: 1, display: 'block' }}>
                        Payment Options
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.72rem' }}>
                                💰 Cash on Delivery
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600, fontSize: '0.65rem' }}>
                                Available
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.72rem' }}>
                                📱 Mobile Banking
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.65rem' }}>
                                bKash, Nagad, Rocket
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Trust Badges */}
                <Box sx={{ borderTop: '1px solid #F0F0F0', pt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <LockIcon sx={{ fontSize: 13, color: '#4CAF50' }} />
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.68rem' }}>
                            Secure checkout
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <ReplayIcon sx={{ fontSize: 13, color: '#4CAF50' }} />
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.68rem' }}>
                            Easy returns within 7 days
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
