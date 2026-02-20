'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import api from '@/lib/api';
import { ShippingForm, PaymentMethod, OrderSummary } from '@/components/checkout';
import { isDhakaCity } from '@/components/checkout/ShippingForm';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

interface SavedAddress {
    _id: string;
    label: string;
    firstName?: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    type: string;
    isDefault: boolean;
}

interface PromoData {
    code: string;
    discount: number;
    type: string;
    description?: string;
    discountAmount?: number;
}

const CHECKOUT_STEPS = [
    { key: 'contact', label: 'Contact', icon: <PhoneIcon sx={{ fontSize: 15 }} /> },
    { key: 'shipping', label: 'Address', icon: <LocationOnIcon sx={{ fontSize: 15 }} /> },
    { key: 'payment', label: 'Payment', icon: <PaymentIcon sx={{ fontSize: 15 }} /> },
];

export default function Checkout() {
    const router = useRouter();
    const { cart, getCartTotal, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<PromoData | null>(null);
    const [promoInput, setPromoInput] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [mobileOrderOpen, setMobileOrderOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Bangladesh',
        shippingMethod: 'inside_dhaka',
        paymentMethod: 'cash_on_delivery',
    });

    // bKash availability (fetched from backend public config)
    const [bkashEnabled, _setBkashEnabled] = useState(false);

    // bKash client-side config fetch/commented out per request — keep bkashDisabled (false)
    /*
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await api.get('/public/config');
                if (!mounted) return;
                setBkashEnabled(Boolean(res.data?.bkashEnabled));
            } catch (err) {
                // fail silently — default to disabled
                console.warn('Failed to fetch public config', err);
            }
        })();
        return () => { mounted = false; };
    }, []);
    */

    const shippingRates: Record<string, { label: string; price: number; icon: string; description: string; eta: string }> = {
        inside_dhaka: { label: 'Inside Dhaka', price: 70, icon: '🏙️', description: 'Standard Delivery', eta: '2-3 business days' },
        outside_dhaka: { label: 'Outside Dhaka', price: 130, icon: '🚚', description: 'Standard Delivery', eta: '4-5 business days' },
    };

    const deliveryEta = useMemo(() => {
        const rate = shippingRates[formData.shippingMethod];
        if (!rate) return '';
        const today = new Date();
        const minDays = formData.shippingMethod === 'inside_dhaka' ? 2 : 4;
        const maxDays = formData.shippingMethod === 'inside_dhaka' ? 3 : 5;
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + minDays);
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + maxDays);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
    }, [formData.shippingMethod]);

    const completedSteps = useMemo(() => {
        const steps: Record<string, boolean> = { contact: false, shipping: false, payment: true };
        if (formData.phone.trim().length >= 11) steps.contact = true;
        if (formData.city && formData.street && formData.lastName) steps.shipping = true;
        return steps;
    }, [formData]);

    const currentTotal = useMemo(() => {
        const subtotal = getCartTotal();
        const shippingCost = shippingRates[formData.shippingMethod]?.price ?? 70;
        const promoDiscount = appliedPromo?.discountAmount || appliedPromo?.discount || 0;
        return subtotal + shippingCost - promoDiscount;
    }, [cart, formData.shippingMethod, appliedPromo, getCartTotal]);

    useEffect(() => {
        if (formData.city) {
            const method = isDhakaCity(formData.city) ? 'inside_dhaka' : 'outside_dhaka';
            if (formData.shippingMethod !== method) {
                setFormData((prev) => ({ ...prev, shippingMethod: method }));
            }
        }
    }, [formData.city]);

    useEffect(() => {
        fetchSavedAddresses();
        const promoStr = sessionStorage.getItem('appliedPromo');
        if (promoStr) {
            try {
                setAppliedPromo(JSON.parse(promoStr));
            } catch { /* ignore */ }
            sessionStorage.removeItem('appliedPromo');
        }
    }, []);

    const fetchSavedAddresses = async () => {
        try {
            const response = await api.get('/auth/addresses');
            const addresses = (response.data as SavedAddress[]).filter(
                (addr) => addr.type === 'shipping' || addr.type === 'both'
            );
            setSavedAddresses(addresses);
            const defaultAddr = addresses.find((addr) => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id);
                loadAddressToForm(defaultAddr);
            } else if (addresses.length === 0) {
                setUseNewAddress(true);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setUseNewAddress(true);
        }
    };

    const loadAddressToForm = (address: SavedAddress) => {
        setFormData((prev) => ({
            ...prev,
            firstName: address.firstName || '',
            lastName: address.lastName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            zipCode: address.zipCode || '',
            country: address.country,
        }));
    };

    const handleAddressSelect = (addressId: string) => {
        setSelectedAddressId(addressId);
        const address = savedAddresses.find((addr) => addr._id === addressId);
        if (address) loadAddressToForm(address);
        setUseNewAddress(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handlePaymentMethodChange = (method: string) => {
        setFormData((prev) => ({ ...prev, paymentMethod: method }));
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.phone || formData.phone.trim().length < 11) errors.phone = 'Please enter a valid phone number (min 11 digits)';
        if (!formData.lastName.trim()) errors.lastName = 'Name is required';
        if (!formData.street.trim()) errors.street = 'Street address is required';
        if (!formData.city) errors.city = 'Please select your district';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        try {
            const response = await api.post('/promo/validate', { code: promoInput.trim(), cartTotal: getCartTotal() });
            const data = response.data as PromoData;
            setAppliedPromo(data);
            setPromoInput('');
            toast.success('Promo code applied!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setPromoError(err.response?.data?.message || 'Invalid promo code');
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoInput('');
        setPromoError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) { toast.error('Please fill in all required fields'); return; }
        setLoading(true);
        try {
            const shippingCost = shippingRates[formData.shippingMethod]?.price ?? 70;
            const orderData = {
                items: cart.map((item) => ({ product: item._id, quantity: item.quantity })),
                shippingAddress: {
                    firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone,
                    street: formData.street, city: formData.city, state: formData.state,
                    zipCode: formData.zipCode, country: formData.country,
                },
                shippingMethod: formData.shippingMethod, shippingCost,
                paymentMethod: formData.paymentMethod, promoCode: appliedPromo?.code || null,
            };
            const response = await api.post('/orders', orderData);
            const orderResult = response.data;

            if (orderResult.requiresBkashPayment && orderResult.bkashURL) {
                toast.loading('Redirecting to bKash...', { duration: 3000 });
                clearCart();
                window.location.href = orderResult.bkashURL;
                return;
            }
            if (orderResult.requiresBkashPayment && !orderResult.bkashURL) {
                clearCart();
                toast.error(orderResult.bkashError || orderResult.message || 'bKash payment could not be initiated');
                router.push('/orders');
                return;
            }
            clearCart();
            toast.success('Order placed successfully! 🎉');
            router.push('/orders');
        } catch (error: unknown) {
            console.error('Error placing order:', error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Guards ─────────────────────────────────────────
    if (!authLoading && !user) {
        router.push('/login?redirect=/checkout');
        return (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress size={40} />
                    <Typography color="text.secondary">Redirecting to login...</Typography>
                </Box>
            </Box>
        );
    }

    if (cart.length === 0) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" px={2} sx={{ bgcolor: '#F5F5F5' }}>
                <Box sx={{ textAlign: 'center', p: { xs: 4, sm: 5 }, borderRadius: '8px', maxWidth: 400, width: '100%', bgcolor: '#fff', border: '1px solid #E8E8E8' }}>
                    <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                        <ShoppingCartOutlinedIcon sx={{ fontSize: 32, color: '#BDBDBD' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} mb={0.5} sx={{ fontFamily: 'var(--font-heading)' }}>Your cart is empty</Typography>
                    <Typography color="text.secondary" mb={3} variant="body2">Add some items to get started</Typography>
                    <Button onClick={() => router.push('/products')} variant="contained" size="large" fullWidth
                        sx={{ borderRadius: '4px', fontWeight: 600, py: 1.5, fontSize: '0.95rem', bgcolor: 'var(--color-primary)', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'var(--color-button-hover)', boxShadow: 'none' } }}
                    >
                        Continue Shopping
                    </Button>
                </Box>
            </Box>
        );
    }

    // ─── Main Render ────────────────────────────────────
    return (
        <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh', pb: { xs: '80px', lg: 4 } }} data-testid="checkout-page">
            {/* Brand accent stripe */}
            <Box sx={{ height: '3px', bgcolor: 'var(--color-primary)' }} />

            {/* Header */}
            <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E8E8E8', position: 'sticky', top: 0, zIndex: 100 }}>
                <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <IconButton onClick={() => router.back()} size="small"
                            sx={{ border: '1px solid #E8E8E8', borderRadius: '6px', width: 36, height: 36, '&:hover': { bgcolor: '#F5F5F5' } }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Box>
                            <Typography variant="h6" fontWeight={700} data-testid="checkout-title"
                                sx={{ fontSize: { xs: '1rem', sm: '1.15rem' }, fontFamily: 'var(--font-heading)', lineHeight: 1.2, color: '#212121' }}
                            >
                                Checkout
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>
                                {cart.length} {cart.length === 1 ? 'item' : 'items'} in your bag
                            </Typography>
                        </Box>
                    </Box>

                    {/* Step Progress — desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0 }}>
                        {CHECKOUT_STEPS.map((step, i) => {
                            const done = completedSteps[step.key];
                            return (
                                <Box key={step.key} display="flex" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={0.75} sx={{ px: 1.25 }}>
                                        <Box sx={{
                                            width: 24, height: 24, borderRadius: '50%',
                                            bgcolor: done ? 'var(--color-primary)' : '#E0E0E0',
                                            color: done ? '#fff' : '#9E9E9E',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.3s',
                                        }}>
                                            {done ? <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} /> : i + 1}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: done ? 600 : 400, color: done ? '#212121' : '#9E9E9E', fontSize: '0.8rem' }}>
                                            {step.label}
                                        </Typography>
                                    </Box>
                                    {i < CHECKOUT_STEPS.length - 1 && (
                                        <Box sx={{ width: 28, height: '2px', bgcolor: done ? 'var(--color-primary)' : '#E0E0E0', borderRadius: 1, transition: 'all 0.3s' }} />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    <Box display="flex" alignItems="center" gap={0.5} sx={{ px: 1.25, py: 0.5, borderRadius: '4px', bgcolor: '#E8F5E9' }}>
                        <VerifiedUserIcon sx={{ fontSize: 14, color: '#388E3C' }} />
                        <Typography variant="caption" fontWeight={600} sx={{ color: '#388E3C', display: { xs: 'none', sm: 'block' }, fontSize: '0.72rem' }}>
                            Secure
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Mobile Order Summary Toggle */}
            <Box sx={{ display: { xs: 'block', lg: 'none' }, px: 2, pt: 2 }}>
                <Box onClick={() => setMobileOrderOpen(!mobileOrderOpen)}
                    sx={{
                        p: 1.75, borderRadius: '6px', cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        bgcolor: '#fff', border: '1px solid #E8E8E8', transition: 'all 0.2s',
                        '&:hover': { borderColor: '#BDBDBD' },
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <ShoppingCartOutlinedIcon sx={{ color: 'var(--color-primary)', fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', color: '#424242' }}>
                            {mobileOrderOpen ? 'Hide' : 'Show'} Order Summary ({cart.length})
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={700} sx={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
                            ৳{currentTotal.toFixed(0)}
                        </Typography>
                        {mobileOrderOpen ? <ExpandLessIcon sx={{ fontSize: 20, color: '#757575' }} /> : <ExpandMoreIcon sx={{ fontSize: 20, color: '#757575' }} />}
                    </Box>
                </Box>
                <Collapse in={mobileOrderOpen}>
                    <Box sx={{ mt: 1.5 }}>
                        <OrderSummary cart={cart} getCartTotal={getCartTotal} paymentMethod={formData.paymentMethod} bkashEnabled={false} /* bKash disabled */
                            shippingCost={shippingRates[formData.shippingMethod]?.price ?? 70}
                            appliedPromo={appliedPromo} deliveryEta={deliveryEta}
                            promoInput={promoInput} promoLoading={promoLoading} promoError={promoError}
                            onPromoInputChange={setPromoInput} onApplyPromo={handleApplyPromo} onRemovePromo={handleRemovePromo}
                        />
                    </Box>
                </Collapse>
            </Box>

            {/* ─── Content Grid ──────────────────────────────── */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, pt: { xs: 2, lg: 3 }, pb: 4 }}>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 380px' }} gap={{ xs: 2, lg: 3 }} alignItems="flex-start">

                    {/* ─── Left Column ───────────────────────────── */}
                    <Box component="section" aria-label="Checkout form" data-testid="checkout-form-section">
                        <form onSubmit={handleSubmit} data-testid="checkout-form">

                            {/* ── Section 1 ─ Contact ─────────────────── */}
                            <Box sx={{
                                bgcolor: '#fff', border: formErrors.phone ? '1px solid #F44336' : '1px solid #E8E8E8',
                                borderRadius: '8px', mb: 2, overflow: 'hidden', transition: 'border-color 0.2s',
                            }}>
                                <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 1.75, borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <PhoneIcon sx={{ fontSize: 15, color: 'var(--color-primary)' }} />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography fontWeight={700} sx={{ fontSize: '0.9rem', color: '#212121' }}>Contact Information</Typography>
                                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>We&apos;ll send order updates here</Typography>
                                    </Box>
                                    {completedSteps.contact && <CheckCircleIcon sx={{ fontSize: 20, color: '#4CAF50' }} />}
                                </Box>
                                <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
                                    <TextField id="phone" name="phone" type="tel" label="Phone Number" placeholder="01XXX-XXXXXX"
                                        value={formData.phone} onChange={handleChange} required fullWidth
                                        error={!!formErrors.phone} helperText={formErrors.phone || ''}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Typography variant="body2" sx={{ color: '#757575', fontWeight: 500 }}>+88</Typography></InputAdornment>,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '6px', bgcolor: '#FAFAFA',
                                                '&:hover': { bgcolor: '#F5F5F5' }, '&.Mui-focused': { bgcolor: '#fff' },
                                                '& fieldset': { borderColor: '#E0E0E0' },
                                                '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)' },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-primary)' },
                                        }}
                                        data-testid="phone-input"
                                    />
                                </Box>
                            </Box>

                            {/* ── Section 2 ─ Shipping Address ─────────── */}
                            <Box sx={{
                                bgcolor: '#fff',
                                border: (formErrors.lastName || formErrors.street || formErrors.city) ? '1px solid #F44336' : '1px solid #E8E8E8',
                                borderRadius: '8px', mb: 2, overflow: 'hidden', transition: 'border-color 0.2s',
                            }}>
                                <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 1.75, borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <LocationOnIcon sx={{ fontSize: 15, color: 'var(--color-primary)' }} />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography fontWeight={700} sx={{ fontSize: '0.9rem', color: '#212121' }}>Shipping &amp; Billing Address</Typography>
                                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>Where should we deliver your order?</Typography>
                                    </Box>
                                    {completedSteps.shipping && <CheckCircleIcon sx={{ fontSize: 20, color: '#4CAF50' }} />}
                                </Box>

                                <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
                                    {/* Saved Addresses */}
                                    {savedAddresses.length > 0 && (
                                        <Box mb={2.5}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                                                <Typography variant="body2" fontWeight={600} sx={{ color: '#616161', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    Saved Addresses
                                                </Typography>
                                                <Button variant="text" size="small"
                                                    startIcon={useNewAddress ? <BookmarkIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                                                    onClick={() => { setUseNewAddress(!useNewAddress); setSelectedAddressId(null); }}
                                                    sx={{ borderRadius: '4px', textTransform: 'none', fontWeight: 600, fontSize: '0.76rem', color: 'var(--color-primary)', px: 1, py: 0.25 }}
                                                >
                                                    {useNewAddress ? 'Use Saved' : 'New Address'}
                                                </Button>
                                            </Box>
                                            {!useNewAddress && (
                                                <Box display="flex" flexDirection="column" gap={1}>
                                                    {savedAddresses.map((address) => {
                                                        const isSelected = selectedAddressId === address._id;
                                                        return (
                                                            <Box key={address._id} onClick={() => handleAddressSelect(address._id)}
                                                                sx={{
                                                                    p: 2, cursor: 'pointer', borderRadius: '6px',
                                                                    border: '1px solid', borderColor: isSelected ? 'var(--color-primary)' : '#E8E8E8',
                                                                    bgcolor: isSelected ? 'rgba(var(--color-primary-rgb), 0.02)' : '#FAFAFA',
                                                                    transition: 'all 0.15s', display: 'flex', gap: 1.5, alignItems: 'flex-start',
                                                                    '&:hover': { borderColor: isSelected ? 'var(--color-primary)' : '#BDBDBD' },
                                                                }}
                                                            >
                                                                <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid', borderColor: isSelected ? 'var(--color-primary)' : '#BDBDBD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                                                                    {isSelected && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--color-primary)' }} />}
                                                                </Box>
                                                                <Box flex={1} minWidth={0}>
                                                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                                        <Typography variant="body2" fontWeight={700} sx={{ color: isSelected ? 'var(--color-primary)' : '#212121', fontSize: '0.85rem' }}>
                                                                            {address.label}
                                                                        </Typography>
                                                                        {address.isDefault && (
                                                                            <Chip label="Default" size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', color: 'var(--color-primary)', fontWeight: 600 }} />
                                                                        )}
                                                                    </Box>
                                                                    <Typography variant="caption" sx={{ color: '#757575', display: 'block', lineHeight: 1.5 }}>
                                                                        {address.firstName && `${address.firstName} `}{address.lastName} · {address.phone}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {address.street}, {address.city}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        </Box>
                                    )}

                                    {(useNewAddress || savedAddresses.length === 0) && (
                                        <ShippingForm formData={formData} handleChange={handleChange} formErrors={formErrors} />
                                    )}
                                </Box>
                            </Box>

                            {/* ── Section 3 ─ Delivery Method ─────────── */}
                            <Box sx={{ bgcolor: '#fff', border: '1px solid #E8E8E8', borderRadius: '8px', mb: 2, overflow: 'hidden' }}>
                                <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 1.75, borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <LocalShippingOutlinedIcon sx={{ fontSize: 15, color: 'var(--color-primary)' }} />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography fontWeight={700} sx={{ fontSize: '0.9rem', color: '#212121' }}>Delivery Method</Typography>
                                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>Auto-detected based on your district</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
                                    {formData.city ? (() => {
                                        const rate = shippingRates[formData.shippingMethod] ?? shippingRates.inside_dhaka ?? { icon: '🚚', description: 'Standard Delivery', price: 70 };
                                        return (
                                            <Box sx={{
                                                p: 2, borderRadius: '6px', border: '1px solid',
                                                borderColor: 'var(--color-primary)', bgcolor: 'rgba(var(--color-primary-rgb), 0.02)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1,
                                            }}>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Box sx={{ width: 40, height: 40, borderRadius: '6px', bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem' }}>
                                                        {rate.icon}
                                                    </Box>
                                                    <Box>
                                                        <Typography fontWeight={600} sx={{ fontSize: '0.9rem', color: '#212121' }}>{rate.description}</Typography>
                                                        <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
                                                            <AccessTimeIcon sx={{ fontSize: 13, color: '#9E9E9E' }} />
                                                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>Est: {deliveryEta}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Box textAlign="right">
                                                    <Typography fontWeight={700} sx={{ fontSize: '1rem', color: 'var(--color-primary)' }}>৳{rate?.price}</Typography>
                                                    {rate && 'label' in rate && <Chip label={(rate as any).label} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', color: 'var(--color-primary)', fontWeight: 600, mt: 0.25 }} />}
                                                </Box>
                                            </Box>
                                        );
                                    })() : (
                                        <Alert severity="info" variant="outlined" sx={{ borderRadius: '6px' }}>
                                            Select your district above to see delivery options
                                        </Alert>
                                    )}
                                </Box>
                            </Box>

                            {/* ── Section 4 ─ Payment ─────────────────── */}
                            <Box sx={{ bgcolor: '#fff', border: '1px solid #E8E8E8', borderRadius: '8px', mb: 2.5, overflow: 'hidden' }}>
                                <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
                                    <PaymentMethod value={formData.paymentMethod} onChange={handlePaymentMethodChange} totalAmount={currentTotal} bkashEnabled={false} /* bKash UI disabled */ />
                                    {/* bKash notice/commented out — bKash UI disabled per request */}
                                </Box>
                            </Box>

                            {/* Desktop CTA */}
                            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                                <Button type="submit" variant="contained" fullWidth disabled={loading || cart.length === 0 || (formData.paymentMethod === 'bkash' && !bkashEnabled)} size="large"
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon sx={{ fontSize: 18 }} />}
                                    sx={{
                                        py: 1.75, borderRadius: '6px', fontWeight: 700, fontSize: '0.95rem',
                                        bgcolor: formData.paymentMethod === 'bkash' ? '#E2136E' : 'var(--color-primary)',
                                        boxShadow: 'none', textTransform: 'none', letterSpacing: 0.2,
                                        '&:hover': { bgcolor: formData.paymentMethod === 'bkash' ? '#C8105E' : 'var(--color-button-hover)', boxShadow: 'none' },
                                        '&:active': { transform: 'scale(0.99)' }, transition: 'all 0.2s ease',
                                    }}
                                    data-testid="place-order-btn" aria-busy={loading}
                                >
                                    {loading ? 'Processing...' : formData.paymentMethod === 'bkash' ? `Pay with bKash  ·  ৳${currentTotal.toFixed(0)}` : `Place Order  ·  ৳${currentTotal.toFixed(0)}`}
                                </Button>
                            </Box>
                        </form>
                    </Box>

                    {/* ─── Right Column ───────────────────────────── */}
                    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                        <OrderSummary cart={cart} getCartTotal={getCartTotal} paymentMethod={formData.paymentMethod} bkashEnabled={false} /* bKash disabled */
                            shippingCost={shippingRates[formData.shippingMethod]?.price ?? 70}
                            appliedPromo={appliedPromo} deliveryEta={deliveryEta}
                            promoInput={promoInput} promoLoading={promoLoading} promoError={promoError}
                            onPromoInputChange={setPromoInput} onApplyPromo={handleApplyPromo} onRemovePromo={handleRemovePromo}
                        />
                    </Box>
                </Box>
            </Box>

            {/* ─── Mobile Bottom Bar ─────────────────────────── */}
            <Box sx={{
                display: { xs: 'block', lg: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0,
                bgcolor: '#fff', borderTop: '1px solid #E8E8E8', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                zIndex: 1000, px: 2, py: 1.5,
            }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box flex={1}>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>Total</Typography>
                        <Typography fontWeight={800} fontSize="1.15rem" sx={{ color: 'var(--color-primary)', lineHeight: 1.2 }}>৳{currentTotal.toFixed(0)}</Typography>
                    </Box>
                    <Button type="button" variant="contained" disabled={loading || cart.length === 0 || (formData.paymentMethod === 'bkash' && !bkashEnabled)}
                        onClick={handleSubmit as any}
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            flex: 2, py: 1.4, borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem',
                            bgcolor: formData.paymentMethod === 'bkash' ? '#E2136E' : 'var(--color-primary)',
                            textTransform: 'none', boxShadow: 'none',
                            '&:hover': { bgcolor: formData.paymentMethod === 'bkash' ? '#C8105E' : 'var(--color-button-hover)', boxShadow: 'none' },
                        }}
                    >
                        {loading ? 'Processing...' : formData.paymentMethod === 'bkash' ? 'Pay with bKash' : 'Place Order'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
