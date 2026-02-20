'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddIcon from '@mui/icons-material/Add';
import api, { getAssetUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import ShippingTracker from '@/components/shared/ShippingTracker';
import AddOrderModal from '@/components/shared/AddOrderModal';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

type OrderItem = {
    product?: { _id?: string; name?: string; images?: string[]; image?: string } | null;
    name?: string;
    quantity: number;
    price: number;
    color?: string;
};

type ShippingAddress = {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string;
    street?: string;
    address?: string;
    city?: string;
    area?: string;
    state?: string;
    zipCode?: string;
    postalCode?: string;
    country?: string;
};

type StatusHistoryItem = {
    status: string;
    timestamp: string;
    note?: string;
};

type ApiOrder = {
    _id: string;
    user?: { _id?: string; name?: string; email?: string; phone?: string } | null;
    totalAmount?: number;
    totalPrice?: number;
    orderStatus?: string;
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    createdAt?: string;
    items?: OrderItem[];
    shippingAddress?: ShippingAddress;
    notes?: string;
    statusHistory?: StatusHistoryItem[];
    trackingNumber?: string;
};

type Order = {
    _id: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    notes: string;
    statusHistory?: StatusHistoryItem[];
    trackingNumber?: string;
};

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLOR: Record<OrderStatus, 'warning' | 'info' | 'secondary' | 'success' | 'error'> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'error',
};

function normalizeStatus(value: string | undefined): OrderStatus {
    const v = (value || '').toLowerCase();
    if (v === 'pending' || v === 'processing' || v === 'shipped' || v === 'delivered' || v === 'cancelled') {
        return v;
    }
    return 'pending';
}

function toOrder(raw: ApiOrder): Order {
    return {
        _id: raw._id,
        userName: raw.user?.name || 'Unknown',
        userEmail: raw.user?.email || 'N/A',
        userPhone: raw.shippingAddress?.phone || raw.user?.phone || '',
        totalAmount: Number(raw.totalAmount ?? raw.totalPrice ?? 0),
        orderStatus: normalizeStatus(raw.orderStatus || raw.status),
        paymentMethod: raw.paymentMethod || 'cash_on_delivery',
        paymentStatus: raw.paymentStatus || 'pending',
        createdAt: raw.createdAt || '',
        items: Array.isArray(raw.items) ? raw.items : [],
        shippingAddress: raw.shippingAddress || {},
        notes: raw.notes || '',
        statusHistory: raw.statusHistory,
        trackingNumber: raw.trackingNumber,
    };
}

function formatMoney(value: number): string {
    return `৳${Number(value || 0).toLocaleString()}`;
}

function formatDate(value: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
}

function getApiError(error: any, fallback: string): string {
    const msg = error?.response?.data?.message;
    const errors = error?.response?.data?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
        return errors.map((e: any) => e?.message).filter(Boolean).join(', ');
    }
    if (typeof msg === 'string' && msg.trim()) return msg;
    return fallback;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [expanded, setExpanded] = useState<string | false>(false);
    const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const loadOrders = useCallback(async (retry = 0) => {
        setError(null);
        try {
            const res = await api.get('/admin/orders');
            const data = res.data?.data || [];
            setOrders(Array.isArray(data) ? data.map((x: ApiOrder) => toOrder(x)) : []);
            setRetryCount(0);
        } catch (err: any) {
            console.error('Error loading orders:', err);
            if (retry < MAX_RETRIES) {
                setRetryCount(retry + 1);
                setTimeout(() => loadOrders(retry + 1), RETRY_DELAY * Math.pow(2, retry));
                return;
            }
            setError(getApiError(err, 'Failed to fetch orders'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    const stats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter((o) => o.orderStatus === 'pending').length;
        const delivered = orders.filter((o) => o.orderStatus === 'delivered').length;
        const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        return { total, pending, delivered, revenue };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        return orders.filter((o) => {
            const statusMatch = filterStatus === 'all' || o.orderStatus === filterStatus;
            if (!statusMatch) return false;
            if (!q) return true;
            return [
                o._id,
                o.userName,
                o.userEmail,
                o.userPhone,
                o.shippingAddress?.phone,
            ]
                .filter(Boolean)
                .some((x) => String(x).toLowerCase().includes(q));
        });
    }, [orders, search, filterStatus]);

    const refresh = async () => {
        setRefreshing(true);
        await loadOrders(0);
    };

    const onUpdateStatus = async (orderId: string, status: OrderStatus) => {
        // Confirm if changing to cancelled
        if (status === 'cancelled') {
            if (!window.confirm('Are you sure you want to cancel this order? This may affect inventory and customer notifications.')) {
                return;
            }
        }
        // Confirm if changing from delivered
        const currentOrder = orders.find(o => o._id === orderId);
        if (currentOrder?.orderStatus === 'delivered' && status !== 'delivered') {
            if (!window.confirm('This order is already delivered. Are you sure you want to change its status?')) {
                return;
            }
        }

        setUpdatingStatus(orderId);
        try {
            await api.put(`/admin/orders/${orderId}`, { orderStatus: status });
            setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o)));
            toast.success(`Order status updated to ${status}`);
        } catch (err: any) {
            toast.error(getApiError(err, 'Failed to update order status'));
        } finally {
            setUpdatingStatus(null);
        }
    };

    const onDeleteOrder = async (orderId: string) => {
        if (!window.confirm('Delete this order? This action cannot be undone.')) return;
        setDeleting(orderId);
        try {
            await api.delete(`/admin/orders/${orderId}`);
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            toast.success('Order deleted');
        } catch (error: any) {
            toast.error(getApiError(error, 'Failed to delete order'));
        } finally {
            setDeleting(null);
        }
    };

    const openWhatsApp = (phone: string, orderId: string) => {
        const clean = String(phone || '').replace(/[^0-9]/g, '');
        if (!clean) return;
        const msg = encodeURIComponent(`Hello, regarding your order #${orderId.slice(-6).toUpperCase()}`);
        window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
    };

    const handleCreateOrder = async (orderData: any) => {
        try {
            const res = await api.post('/admin/orders', orderData);
            const newOrder = res.data?.data || res.data;
            if (newOrder?._id) {
                setOrders((prev) => [toOrder(newOrder), ...prev]);
                toast.success('Order created successfully');
                setShowAddModal(false);
            }
        } catch (error: any) {
            toast.error(getApiError(error, 'Failed to create order'));
            throw error;
        }
    };

    if (loading) {
        return (
            <Stack spacing={2.5}>
                {/* Header Skeleton */}
                <Paper sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <ShoppingCartIcon />
                        <Typography variant="h5" fontWeight={700}>Orders</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading orders...'}
                    </Typography>
                </Paper>
                {/* Stats Skeleton */}
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="rounded" height={80} />
                    ))}
                </Box>
                {/* Search Skeleton */}
                <Skeleton variant="rounded" height={56} />
                {/* Orders Skeleton */}
                <Stack spacing={1.2}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} variant="rounded" height={72} />
                    ))}
                </Stack>
            </Stack>
        );
    }

    if (error) {
        return (
            <Stack spacing={2.5}>
                <Paper sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ShoppingCartIcon />
                        <Typography variant="h5" fontWeight={700}>Orders</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">Manage customer orders and shipment status.</Typography>
                </Paper>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => { setLoading(true); loadOrders(0); }} startIcon={<RefreshIcon />}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Stack>
        );
    }

    return (
        <Stack spacing={2.5}>
            <Paper sx={{ p: 2.5 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ md: 'center' }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <ShoppingCartIcon />
                            <Typography variant="h5" fontWeight={700}>Orders</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">Manage customer orders and shipment status.</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddModal(true)}>
                            Add Order
                        </Button>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh} disabled={refreshing}>
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Orders</Typography>
                    <Typography variant="h5" fontWeight={700}>{stats.total}</Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Pending</Typography>
                    <Typography variant="h5" fontWeight={700} color="warning.main">{stats.pending}</Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Delivered</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{stats.delivered}</Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Revenue</Typography>
                    <Typography variant="h5" fontWeight={700}>{formatMoney(stats.revenue)}</Typography>
                </Paper>
            </Box>

            <Paper sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                    <TextField
                        fullWidth
                        label="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Order ID, customer name, email, phone"
                    />
                    <TextField
                        select
                        label="Status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | OrderStatus)}
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        {STATUS_OPTIONS.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </Paper>

            {filteredOrders.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <Typography color="text.secondary">No orders found.</Typography>
                </Paper>
            ) : (
                <Stack spacing={1.2}>
                    {filteredOrders.map((order) => {
                        const fullName = order.shippingAddress.fullName
                            || [order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(' ')
                            || order.userName;
                        const addressLine = order.shippingAddress.address || order.shippingAddress.street || '';
                        const cityLine = [order.shippingAddress.area, order.shippingAddress.city, order.shippingAddress.state]
                            .filter(Boolean)
                            .join(', ');

                        return (
                            <Accordion
                                key={order._id}
                                expanded={expanded === order._id}
                                onChange={(_, isExpanded) => setExpanded(isExpanded ? order._id : false)}
                                disableGutters
                                sx={{ borderRadius: 2, '&::before': { display: 'none' } }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Stack
                                        direction={{ xs: 'column', md: 'row' }}
                                        spacing={1.2}
                                        alignItems={{ md: 'center' }}
                                        justifyContent="space-between"
                                        width="100%"
                                    >
                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                            <Typography fontWeight={700}>#{order._id.slice(-6).toUpperCase()}</Typography>
                                            <Chip size="small" color={STATUS_COLOR[order.orderStatus]} label={order.orderStatus} />
                                        </Stack>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                                            <Typography variant="body2">{order.userName}</Typography>
                                            <Typography variant="body2" color="text.secondary">{order.userEmail}</Typography>
                                            <Typography fontWeight={700}>{formatMoney(order.totalAmount)}</Typography>
                                            <Typography variant="caption" color="text.secondary">{formatDate(order.createdAt)}</Typography>
                                        </Stack>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={2}>
                                        {/* Shipping Tracker */}
                                        <ShippingTracker order={order} />

                                        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                                <Typography fontWeight={600} sx={{ mb: 1 }}>Customer</Typography>
                                                <Typography variant="body2">{fullName || 'N/A'}</Typography>
                                                <Typography variant="body2" color="text.secondary">{order.userEmail}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {order.userPhone || order.shippingAddress.phone || 'No phone'}
                                                </Typography>
                                                {(order.userPhone || order.shippingAddress.phone) ? (
                                                    <Button
                                                        size="small"
                                                        sx={{ mt: 1 }}
                                                        startIcon={<WhatsAppIcon />}
                                                        onClick={() => openWhatsApp(order.userPhone || order.shippingAddress.phone || '', order._id)}
                                                    >
                                                        WhatsApp
                                                    </Button>
                                                ) : null}
                                            </Paper>
                                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                                <Typography fontWeight={600} sx={{ mb: 1 }}>Shipping Address</Typography>
                                                <Typography variant="body2">{addressLine || 'N/A'}</Typography>
                                                <Typography variant="body2" color="text.secondary">{cityLine || '-'}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {[order.shippingAddress.zipCode, order.shippingAddress.postalCode, order.shippingAddress.country]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                </Typography>
                                            </Paper>
                                        </Box>

                                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <Inventory2Icon fontSize="small" />
                                                <Typography fontWeight={600}>Items</Typography>
                                            </Stack>
                                            <Stack spacing={1}>
                                                {order.items.map((item, idx) => {
                                                    const image = item.product?.image || item.product?.images?.[0];
                                                    const name = item.product?.name || item.name || 'Product';
                                                    return (
                                                        <Box key={`${order._id}-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                                            <Box sx={{ width: 52, height: 52, borderRadius: 1, bgcolor: 'action.hover', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                                                                {image ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={getAssetUrl(image)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <Inventory2Icon fontSize="small" />
                                                                )}
                                                            </Box>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography fontSize={14} noWrap>{name}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Qty {item.quantity} x {formatMoney(item.price)} {item.color ? ` | Color: ${item.color}` : ''}
                                                                </Typography>
                                                            </Box>
                                                            <Typography fontWeight={600}>{formatMoney(item.price * item.quantity)}</Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                        </Paper>

                                        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr auto' } }}>
                                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                    {order.orderStatus === 'pending' ? <PendingActionsIcon fontSize="small" /> : null}
                                                    {order.orderStatus === 'processing' ? <Inventory2Icon fontSize="small" /> : null}
                                                    {order.orderStatus === 'shipped' ? <LocalShippingIcon fontSize="small" /> : null}
                                                    {order.orderStatus === 'delivered' ? <CheckCircleIcon fontSize="small" /> : null}
                                                    <Typography fontWeight={600}>Order Actions</Typography>
                                                </Stack>
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                                    <Select
                                                        size="small"
                                                        value={order.orderStatus}
                                                        onChange={(e) => void onUpdateStatus(order._id, e.target.value as OrderStatus)}
                                                        disabled={updatingStatus === order._id}
                                                        sx={{ minWidth: 190, textTransform: 'capitalize' }}
                                                    >
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                                                                {status}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    <Tooltip title="Delete Order">
                                                        <span>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => void onDeleteOrder(order._id)}
                                                                disabled={deleting === order._id}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                            </Paper>
                                            <Paper variant="outlined" sx={{ p: 1.5, minWidth: 220 }}>
                                                <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                                                <Typography sx={{ textTransform: 'capitalize', mb: 0.8 }}>{order.paymentMethod.replaceAll('_', ' ')}</Typography>
                                                <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                                                <Typography sx={{ textTransform: 'capitalize', mb: 1 }}>{order.paymentStatus}</Typography>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="body2" color="text.secondary">Total</Typography>
                                                <Typography variant="h6" fontWeight={700}>{formatMoney(order.totalAmount)}</Typography>
                                            </Paper>
                                        </Box>

                                        {order.notes ? (
                                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                                <Typography variant="body2" color="text.secondary">Notes</Typography>
                                                <Typography variant="body2">{order.notes}</Typography>
                                            </Paper>
                                        ) : null}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Stack>
            )}

            <AddOrderModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleCreateOrder}
            />
        </Stack>
    );
}
