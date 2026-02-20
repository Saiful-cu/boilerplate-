'use client';

import { useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Chip,
    TextField,
    Button,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface CartItemData {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    images?: string[];
}

interface AppliedPromo {
    code: string;
    description?: string;
    discountAmount?: number;
    discount?: number;
    type?: string;
}

interface CheckoutOrderSummaryProps {
    cart: CartItemData[];
    getCartTotal: () => number;
    paymentMethod: string;
    bkashEnabled?: boolean;
    shippingCost?: number;
    appliedPromo?: AppliedPromo | null;
    deliveryEta?: string;
    promoInput?: string;
    promoLoading?: boolean;
    promoError?: string;
    onPromoInputChange?: (value: string) => void;
    onApplyPromo?: () => void;
    onRemovePromo?: () => void;
}

export default function OrderSummary({
    cart,
    getCartTotal,
    paymentMethod,
    bkashEnabled = true,
    shippingCost = 0,
    appliedPromo = null,
    deliveryEta = '',
    promoInput = '',
    promoLoading = false,
    promoError = '',
    onPromoInputChange,
    onApplyPromo,
    onRemovePromo,
}: CheckoutOrderSummaryProps) {
    const [showAllItems, setShowAllItems] = useState(false);
    const subtotal = getCartTotal();
    const promoDiscount = appliedPromo?.discountAmount || appliedPromo?.discount || 0;
    const totalSavings = cart.reduce((sum, item) => {
        if (item.originalPrice && item.originalPrice > item.price) {
            return sum + (item.originalPrice - item.price) * item.quantity;
        }
        return sum;
    }, 0);
    const total = subtotal + shippingCost - promoDiscount;
    const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const visibleItems = showAllItems ? cart : cart.slice(0, 3);
    const hasMoreItems = cart.length > 3;

    return (
        <Box component="aside" aria-label="Order summary" className="lg:sticky lg:top-16 h-fit">
            <Box sx={{ bgcolor: '#fff', border: '1px solid #E8E8E8', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Header */}
                <Box sx={{ px: 2.5, py: 2, bgcolor: '#fff', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={1.25}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBagIcon sx={{ fontSize: 15, color: 'var(--color-primary)' }} />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#212121', fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
                            Order Summary
                        </Typography>
                    </Box>
                    <Chip
                        label={`${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'}`}
                        size="small"
                        sx={{ fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', color: 'var(--color-primary)', height: 22 }}
                    />
                </Box>

                <Box sx={{ p: 2.5 }}>
                    {/* Cart Items */}
                    <Box sx={{ mb: 2 }}>
                        {visibleItems.map((item) => (
                            <Box key={item._id} display="flex" gap={1.5} pb={1.5} mb={1.5}
                                sx={{ borderBottom: '1px solid #F5F5F5', '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 } }}
                            >
                                {/* Thumbnail */}
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: '6px', overflow: 'hidden', bgcolor: '#F5F5F5',
                                    flexShrink: 0, position: 'relative', border: '1px solid #EEEEEE',
                                }}>
                                    {item.images && item.images[0] ? (
                                        <Box component="img" src={item.images[0]} alt={item.name}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box display="flex" alignItems="center" justifyContent="center" height="100%" sx={{ fontSize: '1.1rem' }}>📦</Box>
                                    )}
                                    <Box sx={{
                                        position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%',
                                        bgcolor: 'var(--color-primary)', color: 'white', fontSize: '0.6rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {item.quantity}
                                    </Box>
                                </Box>

                                <Box flex={1} minWidth={0}>
                                    <Typography variant="body2" fontWeight={500}
                                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4, fontSize: '0.82rem', color: '#424242' }}
                                    >
                                        {item.name}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
                                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>Qty: {item.quantity}</Typography>
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <>
                                                <Typography variant="caption" sx={{ color: '#E0E0E0', mx: 0.25 }}>·</Typography>
                                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#BDBDBD', fontSize: '0.72rem' }}>৳{item.originalPrice}</Typography>
                                            </>
                                        )}
                                    </Box>
                                </Box>

                                <Box textAlign="right" flexShrink={0}>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', color: '#212121' }}>
                                        ৳{(item.price * item.quantity).toFixed(0)}
                                    </Typography>
                                    {item.originalPrice && item.originalPrice > item.price && (
                                        <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 500, fontSize: '0.68rem' }}>
                                            Save ৳{((item.originalPrice - item.price) * item.quantity).toFixed(0)}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}

                        {hasMoreItems && (
                            <Button variant="text" size="small" onClick={() => setShowAllItems(!showAllItems)}
                                endIcon={showAllItems ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                sx={{ textTransform: 'none', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.78rem', mt: 0.5 }}
                            >
                                {showAllItems ? 'Show less' : `Show ${cart.length - 3} more items`}
                            </Button>
                        )}
                    </Box>

                    <Divider sx={{ borderColor: '#F0F0F0', mb: 2 }} />

                    {/* Promo Code */}
                    <Box sx={{ mb: 2 }}>
                        {appliedPromo ? (
                            <Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box display="flex" alignItems="center" gap={0.75}>
                                    <CardGiftcardIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ color: '#2E7D32', fontSize: '0.82rem' }}>
                                            {appliedPromo.code}
                                        </Typography>
                                        {appliedPromo.description && (
                                            <Typography variant="caption" sx={{ color: '#4CAF50', fontSize: '0.7rem' }}>{appliedPromo.description}</Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Typography variant="body2" fontWeight={700} sx={{ color: '#2E7D32', fontSize: '0.85rem' }}>-৳{promoDiscount.toFixed(0)}</Typography>
                                    {onRemovePromo && (
                                        <IconButton size="small" onClick={onRemovePromo} sx={{ color: '#9E9E9E', p: 0.25 }}>
                                            <CloseIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        ) : (
                            <Box>
                                <Box display="flex" gap={1}>
                                    <TextField size="small" placeholder="Enter voucher code" value={promoInput}
                                        onChange={(e) => onPromoInputChange?.(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && onApplyPromo?.()}
                                        fullWidth error={!!promoError}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.85rem', '& fieldset': { borderColor: '#E0E0E0' } } }}
                                    />
                                    <Button variant="outlined" size="small" onClick={onApplyPromo}
                                        disabled={!promoInput.trim() || promoLoading}
                                        sx={{
                                            borderRadius: '6px', textTransform: 'none', fontWeight: 600, minWidth: 68, fontSize: '0.82rem',
                                            borderColor: 'var(--color-primary)', color: 'var(--color-primary)',
                                            '&:hover': { borderColor: 'var(--color-primary)', bgcolor: 'rgba(var(--color-primary-rgb), 0.04)' },
                                        }}
                                    >
                                        {promoLoading ? <CircularProgress size={16} /> : 'Apply'}
                                    </Button>
                                </Box>
                                {promoError && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', fontSize: '0.72rem' }}>{promoError}</Typography>}
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ borderColor: '#F0F0F0', mb: 2 }} />

                    {/* Price Breakdown */}
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.82rem' }}>Subtotal ({totalItemCount} items)</Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem', color: '#424242' }}>৳{subtotal.toFixed(0)}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.82rem' }}>Shipping</Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem', color: '#424242' }}>৳{shippingCost.toFixed(0)}</Typography>
                        </Box>
                        {totalSavings > 0 && (
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 500, fontSize: '0.82rem' }}>Product Discount</Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#4CAF50', fontSize: '0.85rem' }}>-৳{totalSavings.toFixed(0)}</Typography>
                            </Box>
                        )}
                        {promoDiscount > 0 && (
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 500, fontSize: '0.82rem' }}>Voucher Discount</Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#4CAF50', fontSize: '0.85rem' }}>-৳{promoDiscount.toFixed(0)}</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Total + extras footer */}
                <Box sx={{ px: 2.5, py: 2, bgcolor: '#FAFAFA', borderTop: '1px solid #F0F0F0' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography fontWeight={700} sx={{ fontSize: '0.9rem', color: '#212121' }}>Total</Typography>
                        <Box textAlign="right">
                            <Typography fontWeight={800} sx={{ fontSize: '1.2rem', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                                ৳{total.toFixed(0)}
                            </Typography>
                            {(promoDiscount > 0 || totalSavings > 0) && (
                                <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 500, fontSize: '0.7rem' }}>
                                    You save ৳{(promoDiscount + totalSavings).toFixed(0)}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Delivery ETA */}
                    {deliveryEta && (
                        <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: 'rgba(var(--color-primary-rgb), 0.04)', border: '1px solid rgba(var(--color-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 15, color: 'var(--color-primary)' }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.68rem' }}>Estimated Delivery</Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ color: 'var(--color-primary)', fontSize: '0.82rem' }}>{deliveryEta}</Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Payment indicator */}
                    {paymentMethod === 'cash_on_delivery' && (
                        <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: '#fefce8', border: '1px solid #fef08a', display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                            <Typography fontSize="0.95rem">💵</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#854d0e', fontSize: '0.8rem' }}>Cash on Delivery</Typography>
                        </Box>
                    )}
                    {paymentMethod === 'bkash' && (
                        <Box sx={{ p: 1.25, borderRadius: '6px', bgcolor: '#fdf2f8', border: '1px solid #fbcfe8', display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                            <Box sx={{ width: 24, height: 24, borderRadius: '4px', bgcolor: '#E2136E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.55rem' }}>bK</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#E2136E', fontSize: '0.8rem' }}>bKash Payment</Typography>
                        </Box>
                    )}

                    {/* Warn if bKash was selected but not available */}
                    {paymentMethod === 'bkash' && !(typeof (bkashEnabled) === 'undefined' ? true : bkashEnabled) && (
                        <Alert severity="warning" sx={{ mb: 1, borderRadius: 1 }}>
                            bKash payments are currently unavailable. Please choose another payment method.
                        </Alert>
                    )}

                    {/* Trust badges */}
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} mt={0.5}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <VerifiedUserIcon sx={{ fontSize: 13, color: '#4CAF50' }} />
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.68rem' }}>Secure Checkout</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <AssignmentReturnIcon sx={{ fontSize: 13, color: '#4CAF50' }} />
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.68rem' }}>7-Day Returns</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <LocalShippingIcon sx={{ fontSize: 13, color: '#4CAF50' }} />
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.68rem' }}>Reliable Delivery</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <SupportAgentIcon sx={{ fontSize: 13, color: '#4CAF50' }} />
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.68rem' }}>24/7 Support</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
