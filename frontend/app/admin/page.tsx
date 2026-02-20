'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
    Box,
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Avatar,
    Chip,
    CircularProgress,
    LinearProgress,
    Button,
    Skeleton,
    Alert,
    IconButton,
    useTheme,
    alpha,
} from '@mui/material';
import GridLegacy from '@mui/material/GridLegacy';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
}

interface TrendData {
    date: string;
    revenue: number;
    profit: number;
    orders: number;
}

type TimeRange = 'week' | 'month' | 'year' | 'all';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
];

function formatCurrency(amount: number): string {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProfit: 0,
        profitMargin: 0,
    });
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    const fetchStats = useCallback(async (retry = 0) => {
        setLoading(true);
        setError(null);
        try {
            // Try to use admin stats API first
            const statsRes = await api.get(`/admin/stats?timeRange=${timeRange}`).catch(() => null);

            if (statsRes?.data) {
                const data = statsRes.data;
                setStats({
                    totalUsers: data.totalUsers || 0,
                    totalProducts: data.totalProducts || 0,
                    totalOrders: data.totalOrders || 0,
                    totalRevenue: data.totalRevenue || 0,
                    totalProfit: data.totalProfit || 0,
                    profitMargin: data.profitMargin || 0,
                });
                setTrendData(data.profitTrend || []);
                setRecentOrders(data.recentOrders || []);
            } else {
                // Fallback to individual API calls
                const [usersRes, productsRes, ordersRes] = await Promise.all([
                    api.get('/admin/users').catch(() => ({ data: { data: [] } })),
                    api.get('/products').catch(() => ({ data: { data: [] } })),
                    api.get('/admin/orders').catch(() => ({ data: { data: [] } }))
                ]);

                const users = usersRes.data?.data || [];
                const products = productsRes.data?.data || [];
                const orders = ordersRes.data?.data || [];
                const revenue = orders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
                const cost = orders.reduce((sum: number, order: any) => {
                    return sum + (order.items?.reduce((itemSum: number, item: any) => {
                        return itemSum + ((item.cost || item.price * 0.7) * item.quantity);
                    }, 0) || 0);
                }, 0);
                const profit = revenue - cost;

                setStats({
                    totalUsers: users.length,
                    totalProducts: products.length,
                    totalOrders: orders.length,
                    totalRevenue: revenue,
                    totalProfit: profit,
                    profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
                });
                setRecentOrders(orders.slice(0, 5));

                // Generate mock trend data
                const mockTrend = generateMockTrend(orders, timeRange);
                setTrendData(mockTrend);
            }
            setRetryCount(0);
        } catch (err) {
            console.error('Error fetching stats:', err);
            if (retry < MAX_RETRIES) {
                setRetryCount(retry + 1);
                setTimeout(() => fetchStats(retry + 1), RETRY_DELAY * Math.pow(2, retry));
                return;
            }
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const generateMockTrend = (orders: any[], range: TimeRange): TrendData[] => {
        const days = range === 'week' ? 7 : range === 'month' ? 30 : range === 'year' ? 12 : 30;
        const data: TrendData[] = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            if (range === 'year') {
                date.setMonth(date.getMonth() - i);
            } else {
                date.setDate(date.getDate() - i);
            }

            const dateStr = range === 'year'
                ? date.toLocaleDateString('en-US', { month: 'short' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Aggregate orders for this period
            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                if (range === 'year') {
                    return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
                }
                return orderDate.toDateString() === date.toDateString();
            });

            const revenue = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            const profit = revenue * 0.3; // Estimate 30% profit margin

            data.push({
                date: dateStr,
                revenue,
                profit,
                orders: dayOrders.length,
            });
        }
        return data;
    };

    const theme = useTheme();

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.5,
                        boxShadow: 8,
                    }}
                >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{label}</Typography>
                    {payload.map((entry: any, index: number) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: {entry.name.includes('Orders') ? entry.value : formatCurrency(entry.value)}
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Skeleton Header */}
                <Card sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0ea5e9 100%)', border: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}><DashboardIcon /> Dashboard</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                                    {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading your store data...'}
                                </Typography>
                            </Box>
                            <CircularProgress size={32} sx={{ color: 'white' }} />
                        </Box>
                    </CardContent>
                </Card>
                {/* Skeleton Stats */}
                <GridLegacy container spacing={2}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <GridLegacy item xs={12} sm={6} lg key={i}>
                            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
                        </GridLegacy>
                    ))}
                </GridLegacy>
                {/* Skeleton Chart */}
                <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
                {/* Skeleton Bottom Grid */}
                <GridLegacy container spacing={3}>
                    <GridLegacy item xs={12} lg={6}>
                        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
                    </GridLegacy>
                    <GridLegacy item xs={12} lg={6}>
                        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
                    </GridLegacy>
                </GridLegacy>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Card sx={{ background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f97316 100%)', border: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}><DashboardIcon /> Dashboard</Typography>
                        <Typography sx={{ color: 'error.light', mt: 0.5 }}>Unable to load dashboard</Typography>
                    </CardContent>
                </Card>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => fetchStats(0)} startIcon={<RefreshIcon />}>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header */}
            <Card sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 35%, #0ea5e9 70%, #06b6d4 100%)', border: 'none' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DashboardIcon /> Dashboard
                            </Typography>
                            <Typography sx={{ color: 'rgba(219,234,254,0.9)', mt: 0.5 }}>Overview of your store performance</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                                onClick={() => fetchStats(0)}
                                sx={{ color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.15) } }}
                                title="Refresh dashboard"
                            >
                                <RefreshIcon />
                            </IconButton>
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <Select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                                    sx={{
                                        bgcolor: alpha('#fff', 0.15),
                                        color: '#fff',
                                        border: `1px solid ${alpha('#fff', 0.3)}`,
                                        borderRadius: 1,
                                        '.MuiSelect-icon': { color: '#fff' },
                                        '&:hover': { bgcolor: alpha('#fff', 0.2) },
                                    }}
                                >
                                    {TIME_RANGES.map(range => (
                                        <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <GridLegacy container spacing={2}>
                {[
                    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), sub: `${timeRange === 'all' ? 'All time' : `This ${timeRange}`}`, gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)', subColor: alpha('#BBF7D0', 0.9) },
                    { label: 'Total Profit', value: formatCurrency(stats.totalProfit), sub: 'Net earnings', gradient: 'linear-gradient(135deg, #0891b2 0%, #0ea5e9 50%, #38bdf8 100%)', subColor: alpha('#BFDBFE', 0.9) },
                    { label: 'Total Orders', value: stats.totalOrders, sub: 'Orders placed', gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', subColor: alpha('#E9D5FF', 0.9) },
                    { label: 'Products', value: stats.totalProducts, sub: 'In catalog', gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)', subColor: alpha('#FED7AA', 0.9) },
                    { label: 'Profit Margin', value: `${(Number(stats.profitMargin) || 0).toFixed(1)}%`, sub: null, gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)', subColor: alpha('#DBEAFE', 0.9), showBar: true },
                ].map((stat, i) => (
                    <GridLegacy item xs={12} sm={6} lg key={i}>
                        <Card sx={{ background: stat.gradient, border: 'none', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', fontWeight: 500 }}>{stat.label}</Typography>
                                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 0.5 }}>{stat.value}</Typography>
                                {stat.sub && <Typography sx={{ color: stat.subColor, fontSize: '0.75rem', mt: 1 }}>{stat.sub}</Typography>}
                                {stat.showBar && (
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(Number(stats.profitMargin) || 0, 100)}
                                        sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' }, borderRadius: 2 }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </GridLegacy>
                ))}
            </GridLegacy>

            {/* Revenue & Profit Chart */}
            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 22 }} /> Revenue & Profit Trend
                        <Typography component="span" variant="body2" color="text.secondary">({TIME_RANGES.find(r => r.value === timeRange)?.label})</Typography>
                    </Typography>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }} />
                                <YAxis stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="Revenue" stroke={theme.palette.secondary.main} strokeWidth={2} dot={{ fill: theme.palette.secondary.main }} />
                                <Line type="monotone" dataKey="profit" name="Profit" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ fill: theme.palette.primary.main }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="text.secondary">No data available for this period</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <GridLegacy container spacing={3}>
                {/* Recent Orders */}
                <GridLegacy item xs={12} lg={6}>
                    <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ShoppingCartIcon sx={{ fontSize: 22 }} /> Recent Orders</Typography>
                                <Button component={Link} href="/admin/orders" size="small" endIcon={<ArrowForwardIcon />} sx={{ color: 'secondary.main' }}>
                                    View all
                                </Button>
                            </Box>
                            {recentOrders.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <InboxOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography color="text.secondary">No orders yet</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {recentOrders.map((order: any) => (
                                        <Box key={order._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' }, transition: 'background 0.2s' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'action.selected', fontSize: '0.875rem' }}>
                                                    {order.user?.name?.[0]?.toUpperCase() || '?'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{order.user?.name || 'Guest'}</Typography>
                                                    <Typography variant="caption" color="text.secondary">#{order._id?.slice(-6)}</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="body2" fontWeight={700} sx={{ color: 'secondary.main' }}>{formatCurrency(order.totalPrice || 0)}</Typography>
                                                <Chip
                                                    size="small"
                                                    label={order.status}
                                                    sx={{
                                                        height: 20, fontSize: '0.625rem', fontWeight: 600,
                                                        bgcolor: order.status === 'delivered' ? alpha(theme.palette.success.main, 0.15) : order.status === 'pending' ? alpha(theme.palette.warning.main, 0.15) : order.status === 'processing' ? alpha(theme.palette.primary.main, 0.15) : order.status === 'shipped' ? alpha(theme.palette.info.main, 0.15) : alpha(theme.palette.grey[500], 0.15),
                                                        color: order.status === 'delivered' ? 'success.main' : order.status === 'pending' ? 'warning.main' : order.status === 'processing' ? 'primary.main' : order.status === 'shipped' ? 'info.main' : 'text.secondary',
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </GridLegacy>

                {/* Quick Actions */}
                <GridLegacy item xs={12} lg={6}>
                    <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><BoltIcon sx={{ fontSize: 22, color: 'warning.main' }} /> Quick Actions</Typography>
                            <GridLegacy container spacing={1.5}>
                                {[
                                    { href: '/admin/products', icon: <InventoryIcon />, label: 'Products', colorKey: 'primary' as const },
                                    { href: '/admin/orders', icon: <ShoppingCartIcon />, label: 'Orders', colorKey: 'secondary' as const },
                                    { href: '/admin/users', icon: <PeopleIcon />, label: 'Users', colorKey: 'info' as const },
                                    { href: '/admin/categories', icon: <CategoryIcon />, label: 'Categories', colorKey: 'warning' as const },
                                    { href: '/admin/promo-codes', icon: <LocalOfferIcon />, label: 'Promo Codes', colorKey: 'error' as const },
                                    { href: '/admin/settings', icon: <SettingsIcon />, label: 'Settings', colorKey: 'grey' as const },
                                ].map((action) => {
                                    const color = action.colorKey === 'grey' ? theme.palette.grey[500] : theme.palette[action.colorKey].main;
                                    return (
                                        <GridLegacy item xs={6} key={action.href}>
                                            <Card
                                                sx={{
                                                    bgcolor: alpha(color, 0.12),
                                                    border: '1px solid',
                                                    borderColor: alpha(color, 0.3),
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { transform: 'scale(1.02)', bgcolor: alpha(color, 0.2) },
                                                }}
                                            >
                                                <CardActionArea
                                                    component={Link}
                                                    href={action.href}
                                                    sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5, textDecoration: 'none', alignItems: 'center' }}
                                                >
                                                    <Box sx={{ color }}>{action.icon}</Box>
                                                    <Typography variant="body2" fontWeight={600} sx={{ color }}>{action.label}</Typography>
                                                </CardActionArea>
                                            </Card>
                                        </GridLegacy>
                                    );
                                })}
                            </GridLegacy>
                        </CardContent>
                    </Card>
                </GridLegacy>
            </GridLegacy>
        </Box>
    );
}
