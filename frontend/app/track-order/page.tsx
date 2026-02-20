'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface OrderItem {
    product?: {
        name: string;
        images?: string[];
    };
    quantity: number;
    price: number;
    selectedColor?: string;
    selectedSize?: string;
}

interface Order {
    _id: string;
    orderStatus: string;
    paymentStatus: string;
    shippingAddress: string;
    totalAmount: number;
    trackingNumber?: string;
    items?: OrderItem[];
    createdAt: string;
}

export default function TrackOrder() {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setOrder(null);

        if (!orderId.trim()) {
            setError('Please enter an order ID');
            return;
        }

        setLoading(true);

        try {
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data);
            toast.success('Order found!');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || 'Order not found. Please check your order ID.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getStatusChipColor = (status: string): 'warning' | 'info' | 'secondary' | 'success' | 'error' | 'default' => {
        const colors: Record<string, 'warning' | 'info' | 'secondary' | 'success' | 'error' | 'default'> = {
            pending: 'warning',
            processing: 'info',
            shipped: 'secondary',
            delivered: 'success',
            cancelled: 'error',
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, string> = {
            pending: '⏳',
            processing: '⚙️',
            shipped: '🚚',
            delivered: '✅',
            cancelled: '❌',
        };
        return icons[status] || '📦';
    };

    const getStatusIndex = (status: string) => {
        const statuses = ['pending', 'processing', 'shipped', 'delivered'];
        return statuses.indexOf(status);
    };

    const shippingSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

    return (
        <Box className="bg-gray-50" minHeight="100vh" py={6}>
            <Box className="container mx-auto" px={2} maxWidth="md" sx={{ maxWidth: '56rem' }}>
                <Box textAlign="center" mb={4}>
                    <Typography variant="h3" fontWeight="bold" mb={1.5} sx={{ color: 'var(--color-primary)', fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}>
                        🚚 Track Your Order
                    </Typography>
                    <Typography color="text.secondary">Enter your order ID to track your shipment</Typography>
                </Box>

                {/* Search Form */}
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                            <TextField
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter Order ID (e.g., 12345678)"
                                fullWidth
                                variant="outlined"
                                size="medium"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                sx={{
                                    px: 4,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    bgcolor: 'var(--color-primary)',
                                    '&:hover': { opacity: 0.9 },
                                }}
                            >
                                {loading ? 'Searching...' : 'Track Order'}
                            </Button>
                        </Box>
                    </form>
                </Paper>

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Order Details */}
                {order && (
                    <Box display="flex" flexDirection="column" gap={3}>
                        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Box
                                p={3}
                                sx={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))', color: 'white' }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }} mb={0.5}>Order ID</Typography>
                                        <Typography variant="h5" fontWeight="bold">#{order._id.slice(-8).toUpperCase()}</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }} mt={1}>
                                            Placed on{' '}
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${getStatusIcon(order.orderStatus)} ${order.orderStatus.toUpperCase()}`}
                                        color={getStatusChipColor(order.orderStatus)}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                            </Box>

                            <Box p={3}>
                                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} mb={3}>
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                            <LocationOnIcon sx={{ color: 'var(--color-primary)' }} />
                                            <Typography fontWeight={600}>Shipping Address</Typography>
                                        </Box>
                                        <Typography color="text.secondary">{order.shippingAddress}</Typography>
                                    </Box>

                                    <Box>
                                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                            <PaymentIcon sx={{ color: 'var(--color-primary)' }} />
                                            <Typography fontWeight={600}>Payment Status</Typography>
                                        </Box>
                                        <Typography color="text.secondary" mb={1}>
                                            Status: <Typography component="span" fontWeight={600}>{order.paymentStatus}</Typography>
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Total:{' '}
                                            <Typography component="span" fontWeight="bold" fontSize="1.5rem" sx={{ color: 'var(--color-primary)' }}>
                                                ৳{order.totalAmount.toFixed(2)}
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Box>

                                {order.trackingNumber && (
                                    <Alert severity="info" icon={<LocalShippingIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                                        <Typography variant="body2" fontWeight={600} mb={0.5}>Tracking Number</Typography>
                                        <Typography fontWeight="bold" fontFamily="monospace" fontSize="1.125rem">
                                            {order.trackingNumber}
                                        </Typography>
                                    </Alert>
                                )}

                                {/* Shipping Progress */}
                                {order.orderStatus !== 'cancelled' && (
                                    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, bgcolor: 'grey.50' }}>
                                        <Typography fontWeight={600} textAlign="center" mb={3}>Shipping Progress</Typography>
                                        <Stepper activeStep={getStatusIndex(order.orderStatus)} alternativeLabel>
                                            {shippingSteps.map((label, index) => (
                                                <Step key={label} completed={index <= getStatusIndex(order.orderStatus)}>
                                                    <StepLabel
                                                        StepIconProps={{
                                                            sx: {
                                                                '&.Mui-completed': { color: 'var(--color-primary)' },
                                                                '&.Mui-active': { color: 'var(--color-primary)' },
                                                            },
                                                        }}
                                                    >
                                                        <Typography variant="body2" fontWeight={index <= getStatusIndex(order.orderStatus) ? 600 : 400} sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' } }}>
                                                            <Box component="span" display={{ xs: 'none', sm: 'inline' }}>{getStatusIcon(label.toLowerCase())} </Box>{label}
                                                        </Typography>
                                                    </StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    </Paper>
                                )}

                                {/* Order Items */}
                                <Box mt={3}>
                                    <Typography fontWeight={600} mb={2}>Order Items ({order.items?.length || 0})</Typography>
                                    <Box display="flex" flexDirection="column" gap={1.5}>
                                        {order.items?.map((item, index) => (
                                            <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                {item.product?.images?.[0] && (
                                                    <Box
                                                        component="img"
                                                        src={item.product.images[0]}
                                                        alt={item.product?.name || 'Product'}
                                                        sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1 }}
                                                    />
                                                )}
                                                <Box flex={1}>
                                                    <Typography fontWeight={500}>{item.product?.name || 'Product'}</Typography>
                                                    <Typography variant="body2" color="text.secondary">Quantity: {item.quantity}</Typography>
                                                    {item.selectedColor && <Typography variant="body2" color="text.secondary">Color: {item.selectedColor}</Typography>}
                                                    {item.selectedSize && <Typography variant="body2" color="text.secondary">Size: {item.selectedSize}</Typography>}
                                                </Box>
                                                <Typography fontWeight="bold">৳{(item.price * item.quantity).toFixed(2)}</Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                )}

                {/* Help Section */}
                {!order && !error && (
                    <Alert
                        severity="info"
                        icon={<HelpOutlineIcon />}
                        sx={{ mt: 4, borderRadius: 2 }}
                    >
                        <Typography fontWeight={600} mb={1}>Where is my order ID?</Typography>
                        <Typography variant="body2" mb={1}>Your order ID can be found in:</Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            <li><Typography variant="body2">Your order confirmation email</Typography></li>
                            <li><Typography variant="body2">Your account&apos;s order history page</Typography></li>
                            <li><Typography variant="body2">The order details page after checkout</Typography></li>
                        </Box>
                    </Alert>
                )}
            </Box>
        </Box>
    );
}
