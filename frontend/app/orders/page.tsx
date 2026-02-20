'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import StarIcon from '@mui/icons-material/Star';

interface OrderItem {
    product?: {
        _id: string;
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
    paymentMethod: string;
    paymentStatus: string;
    bkashPaymentID?: string;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
    };
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
}

export default function Orders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [router]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/orders');
            const ordersData = response.data.data || response.data;

            if (Array.isArray(ordersData)) {
                setOrders(ordersData);
            } else {
                setOrders([]);
            }
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                router.push('/login');
            } else {
                setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRetryBkash = async (orderId: string) => {
        try {
            setRetryingOrderId(orderId);
            const response = await api.post('/bkash/create-payment', { orderId });
            if (response.data.success && response.data.bkashURL) {
                window.location.href = response.data.bkashURL;
            } else {
                setError(response.data.message || 'Failed to initiate bKash payment');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to retry bKash payment');
        } finally {
            setRetryingOrderId(null);
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

    const getPaymentStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
        const colors: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
            pending: 'warning',
            completed: 'success',
            failed: 'error',
            cancelled: 'error',
            refunded: 'default',
        };
        return colors[status] || 'default';
    };

    const getPaymentStatusIcon = (status: string) => {
        const icons: Record<string, string> = {
            pending: '⏳',
            completed: '✅',
            failed: '❌',
            cancelled: '🚫',
            refunded: '↩️',
        };
        return icons[status] || '💰';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, string> = {
            pending: '⏳',
            processing: '🔄',
            shipped: '🚚',
            delivered: '✅',
            cancelled: '❌',
        };
        return icons[status] || '📦';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" data-testid="orders-loading" role="status">
                <CircularProgress size={64} sx={{ color: 'var(--color-primary)' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="bg-gray-50" minHeight="100vh" py={4}>
                <Box className="container mx-auto" px={2}>
                    <Box maxWidth={600} mx="auto">
                        <Alert
                            severity="error"
                            icon={<Typography fontSize="2rem">⚠️</Typography>}
                            sx={{ borderRadius: 2, p: 4 }}
                            action={
                                <Button onClick={fetchOrders} color="error" variant="contained" sx={{ fontWeight: 600, borderRadius: 2 }}>
                                    Try Again
                                </Button>
                            }
                        >
                            <Typography variant="h6" fontWeight="bold" mb={1}>Error Loading Orders</Typography>
                            <Typography>{error}</Typography>
                        </Alert>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="bg-gray-50" minHeight="100vh" py={4} data-testid="orders-page">
            <Box className="container mx-auto" px={2}>
                <Typography variant="h4" fontWeight="bold" mb={4} data-testid="orders-title" fontSize={{ xs: '1.5rem', sm: '2.125rem' }}>
                    📦 My Orders
                </Typography>

                {orders.length === 0 ? (
                    <Paper elevation={2} sx={{ textAlign: 'center', py: 10, borderRadius: 2 }} data-testid="no-orders-message" role="status">
                        <Typography fontSize="3.75rem" mb={2}>📝</Typography>
                        <Typography variant="h6" fontWeight={600} mb={1}>No orders yet</Typography>
                        <Typography color="text.secondary" mb={2}>Start shopping and your orders will appear here</Typography>
                        <Button component={Link} href="/products" variant="text" sx={{ fontWeight: 500, textTransform: 'none' }}>
                            Browse Products
                        </Button>
                    </Paper>
                ) : (
                    <Box display="flex" flexDirection="column" gap={3} data-testid="orders-list">
                        {orders.map((order, index) => (
                            <Paper
                                key={order._id}
                                elevation={3}
                                sx={{ borderRadius: 2, overflow: 'hidden', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}
                                component="article"
                                data-testid={`order-card-${index}`}
                            >
                                <Box
                                    p={{ xs: 2, sm: 3 }}
                                    sx={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))', color: 'white' }}
                                >
                                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} gap={1.5}>
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }} data-testid={`order-id-${index}`}>
                                                Order #{order._id.slice(-8).toUpperCase()}
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold" data-testid={`order-date-${index}`}>
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
                                            variant="filled"
                                            sx={{ fontWeight: 'bold', fontSize: { xs: '0.7rem', sm: '0.8rem' }, alignSelf: 'flex-start' }}
                                            data-testid={`order-status-${index}`}
                                        />
                                    </Box>
                                </Box>

                                <Box p={{ xs: 2, sm: 3 }}>
                                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={3}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                                            <Typography fontWeight={600} data-testid={`order-payment-${index}`}>
                                                {order.paymentMethod === 'cash_on_delivery'
                                                    ? '💵 Cash on Delivery'
                                                    : order.paymentMethod === 'bkash'
                                                        ? '📱 bKash'
                                                        : '💳 ' + order.paymentMethod.replace('_', ' ').toUpperCase()}
                                            </Typography>
                                            {order.paymentStatus && (
                                                <Chip
                                                    label={`${getPaymentStatusIcon(order.paymentStatus)} ${order.paymentStatus.toUpperCase()}`}
                                                    color={getPaymentStatusColor(order.paymentStatus)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.7rem' }}
                                                />
                                            )}
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Shipping Address</Typography>
                                            <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                                                {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                                                {order.shippingAddress.state}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* bKash Retry Button */}
                                    {order.paymentMethod === 'bkash' &&
                                        ['pending', 'failed', 'cancelled'].includes(order.paymentStatus) && (
                                            <Box mb={2}>
                                                <Alert
                                                    severity={order.paymentStatus === 'pending' ? 'warning' : 'error'}
                                                    sx={{ borderRadius: 2, alignItems: 'center' }}
                                                    action={
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            disabled={retryingOrderId === order._id}
                                                            onClick={() => handleRetryBkash(order._id)}
                                                            sx={{
                                                                bgcolor: '#E2136E',
                                                                '&:hover': { bgcolor: '#C8115E' },
                                                                fontWeight: 600,
                                                                textTransform: 'none',
                                                                borderRadius: 2,
                                                                minWidth: 120,
                                                            }}
                                                        >
                                                            {retryingOrderId === order._id ? (
                                                                <CircularProgress size={18} sx={{ color: 'white' }} />
                                                            ) : (
                                                                '🔄 Retry bKash'
                                                            )}
                                                        </Button>
                                                    }
                                                >
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {order.paymentStatus === 'pending'
                                                            ? 'bKash payment is pending. Complete your payment.'
                                                            : order.paymentStatus === 'cancelled'
                                                                ? 'bKash payment was cancelled. You can try again.'
                                                                : 'bKash payment failed. You can retry.'}
                                                    </Typography>
                                                </Alert>
                                            </Box>
                                        )}

                                    <Divider sx={{ mb: 2 }} />

                                    <Typography fontWeight={600} mb={1.5} color="text.primary">Order Items</Typography>
                                    <Box display="flex" flexDirection="column" gap={2} data-testid={`order-items-${index}`}>
                                        {order.items.map((item, itemIndex) => (
                                            <Paper
                                                key={itemIndex}
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5, borderRadius: 2,
                                                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                                                    alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 1.5,
                                                    '&:hover': { bgcolor: 'grey.50' }, transition: 'background 0.2s',
                                                }}
                                                data-testid={`order-item-${index}-${itemIndex}`}
                                            >
                                                <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                                                    <Box component={Link} href={`/products/${item.product?._id}`} flexShrink={0}>
                                                        {item.product?.images && item.product.images[0] ? (
                                                            <Box
                                                                component="img"
                                                                src={item.product.images[0]}
                                                                alt={item.product.name}
                                                                sx={{
                                                                    width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 },
                                                                    objectFit: 'cover', borderRadius: 2, border: '2px solid',
                                                                    borderColor: 'grey.200', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.2s',
                                                                }}
                                                            />
                                                        ) : (
                                                            <Box
                                                                sx={{
                                                                    width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 },
                                                                    bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                }}
                                                            >
                                                                <Typography fontSize="2rem">📦</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    <Box flex={1} minWidth={0}>
                                                        <Typography
                                                            component={Link}
                                                            href={`/products/${item.product?._id}`}
                                                            fontWeight={500}
                                                            color="text.primary"
                                                            noWrap
                                                            display="block"
                                                            sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}
                                                            data-testid={`order-item-name-${index}-${itemIndex}`}
                                                        >
                                                            {item.product?.name || 'Product'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">Qty: {item.quantity}</Typography>
                                                        {item.selectedColor && (
                                                            <Typography variant="caption" color="text.secondary" display="block">Color: {item.selectedColor}</Typography>
                                                        )}
                                                        {item.selectedSize && (
                                                            <Typography variant="caption" color="text.secondary" display="block">Size: {item.selectedSize}</Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Box display="flex" alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-end' }} gap={{ xs: 1.5, sm: 2 }}>
                                                    <Typography
                                                        fontWeight="bold"
                                                        fontSize="1.125rem"
                                                        data-testid={`order-item-price-${index}-${itemIndex}`}
                                                    >
                                                        ৳{(item.price * item.quantity).toFixed(2)}
                                                    </Typography>

                                                    {order.orderStatus === 'delivered' && (
                                                        <Button
                                                            component={Link}
                                                            href={`/products/${item.product?._id}?review=true`}
                                                            variant="contained"
                                                            size="small"
                                                            startIcon={<StarIcon sx={{ fontSize: 16 }} />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 500,
                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                                bgcolor: 'var(--color-primary)',
                                                                '&:hover': { boxShadow: 4 },
                                                            }}
                                                        >
                                                            <Box component="span" display={{ xs: 'none', sm: 'inline' }}>Write Review</Box>
                                                            <Box component="span" display={{ xs: 'inline', sm: 'none' }}>Review</Box>
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
                                        <Typography fontWeight="bold" fontSize={{ xs: '1rem', sm: '1.125rem' }} data-testid={`order-total-label-${index}`}>
                                            Total Amount:
                                        </Typography>
                                        <Typography
                                            fontWeight="bold"
                                            fontSize={{ xs: '1.25rem', sm: '1.5rem' }}
                                            sx={{ color: 'var(--color-primary)' }}
                                            data-testid={`order-total-amount-${index}`}
                                        >
                                            ৳{order.totalAmount.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
