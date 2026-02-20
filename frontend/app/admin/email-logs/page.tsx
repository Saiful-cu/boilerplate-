'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';

// MUI Icons
import EmailIcon from '@mui/icons-material/Email';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface EmailLog {
    _id: string;
    to: string;
    subject: string;
    type: string;
    status: 'sent' | 'failed' | 'pending';
    arrowDownward: string;
    createdAt: string;
    messageId?: string;
    error?: string;
    metadata?: Record<string, unknown>;
}

interface EmailStats {
    total: number;
    sent: number;
    failed: number;
    successRate: number;
}

const EMAIL_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'order_confirmation', label: '📦 Order Confirmation' },
    { value: 'order_status', label: '🚚 Order Status' },
    { value: 'verification', label: '✉️ Verification' },
    { value: 'welcome', label: '👋 Welcome' },
    { value: 'password_reset', label: '🔑 Password Reset' },
    { value: 'promotional', label: '🎉 Promotional' },
    { value: 'newsletter', label: '📰 Newsletter' },
];

export default function AdminEmailLogs() {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [stats, setStats] = useState<EmailStats>({ total: 0, sent: 0, failed: 0, successRate: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
    const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

    const fetchLogs = useCallback(async (retry = 0) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus && { status: filterStatus }),
                ...(filterType && { type: filterType }),
            });

            const response = await api.get(`/email-logs?${params}`);
            setLogs(response.data?.data || []);
            setTotalPages(response.data?.pagination?.pages || 1);
            setRetryCount(0);
        } catch (err) {
            console.error('Error fetching email logs:', err);
            if (retry < MAX_RETRIES) {
                setRetryCount(retry + 1);
                setTimeout(() => fetchLogs(retry + 1), RETRY_DELAY * Math.pow(2, retry));
                return;
            }
            setError('Failed to fetch email logs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterStatus, filterType]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/email-logs/stats');
            setStats({
                total: response.data?.totalEmails || 0,
                sent: response.data?.sentEmails || 0,
                failed: response.data?.failedEmails || 0,
                successRate: parseFloat(response.data?.successRate) || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleResend = async (logId: string) => {
        try {
            await api.post(`/email-logs/${logId}/resend`);
            toast.success('Email resent successfully');
            fetchLogs();
            fetchStats();
        } catch (error) {
            console.error('Error resending email:', error);
            toast.error('Failed to resend email');
        }
    };

    const handleDelete = async (logId: string) => {
        if (!window.confirm('Are you sure you want to delete this log?')) return;

        try {
            await api.delete(`/email-logs/${logId}`);
            toast.success('Log deleted');
            fetchLogs();
            fetchStats();
        } catch (error) {
            console.error('Error deleting log:', error);
            toast.error('Failed to delete log');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedLogs.length} selected logs?`)) return;

        try {
            await api.post('/email-logs/bulk-delete', { ids: selectedLogs });
            toast.success(`${selectedLogs.length} logs deleted`);
            setSelectedLogs([]);
            fetchLogs();
            fetchStats();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            toast.error('Failed to delete logs');
        }
    };

    const toggleSelectLog = (logId: string) => {
        setSelectedLogs(prev =>
            prev.includes(logId)
                ? prev.filter(id => id !== logId)
                : [...prev, logId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedLogs.length === logs.length) {
            setSelectedLogs([]);
        } else {
            setSelectedLogs(logs.map(log => log._id));
        }
    };

    const getStatusChipProps = (status: string) => {
        switch (status) {
            case 'sent':
                return { color: 'success' as const, icon: <CheckCircleIcon /> };
            case 'failed':
                return { color: 'error' as const, icon: <ErrorIcon /> };
            case 'pending':
                return { color: 'warning' as const, icon: <AccessTimeIcon /> };
            default:
                return { color: 'default' as const };
        }
    };

    const getTypeBadge = (type: string) => {
        const found = EMAIL_TYPES.find(t => t.value === type);
        return found?.label || type;
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading && logs.length === 0) {
        return (
            <Box>
                <Card sx={{ background: 'linear-gradient(to right, #374151, #4B5563)', borderRadius: 1, mb: 4 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h4" fontWeight="bold" color="white" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon fontSize="large" /> Email Logs
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(233, 213, 255, 0.85)', mt: 0.5 }}>
                            {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading email logs...'}
                        </Typography>
                    </CardContent>
                </Card>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                            <Skeleton variant="rounded" height={100} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={400} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Card sx={{ background: 'linear-gradient(to right, #7c3aed, #9333ea)', borderRadius: 1, mb: 4 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h4" fontWeight="bold" color="white" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon fontSize="large" /> Email Logs
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(233, 213, 255, 0.85)', mt: 0.5 }}>
                            Monitor and manage email delivery
                        </Typography>
                    </CardContent>
                </Card>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => { setLoading(true); fetchLogs(0); }} startIcon={<RefreshIcon />}>
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
            <Card
                sx={{
                    background: 'linear-gradient(to right, #7c3aed, #9333ea)',
                    borderRadius: 1,
                    mb: 4,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="white" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon fontSize="large" /> Email Logs
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(233, 213, 255, 0.85)', mt: 0.5 }}>
                                Monitor and manage email delivery
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={() => { fetchLogs(); fetchStats(); }}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Refresh
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card sx={{ background: 'linear-gradient(to bottom right, #2563eb, #0891b2)', borderRadius: 1 }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ color: 'rgba(191, 219, 254, 0.85)' }}>Total Emails</Typography>
                            <Typography variant="h4" fontWeight="bold" color="white" mt={0.5}>
                                {stats.total}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card sx={{ background: 'linear-gradient(to bottom right, #059669, #16a34a)', borderRadius: 1 }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ color: 'rgba(187, 247, 208, 0.85)' }}>Sent Successfully</Typography>
                            <Typography variant="h4" fontWeight="bold" color="white" mt={0.5}>
                                {stats.sent}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card sx={{ background: 'linear-gradient(to bottom right, #dc2626, #e11d48)', borderRadius: 1 }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ color: 'rgba(254, 202, 202, 0.85)' }}>Failed</Typography>
                            <Typography variant="h4" fontWeight="bold" color="white" mt={0.5}>
                                {stats.failed}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card sx={{ background: 'linear-gradient(to bottom right, #7c3aed, #9333ea)', borderRadius: 1 }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ color: 'rgba(233, 213, 255, 0.85)' }}>Success Rate</Typography>
                            <Typography variant="h4" fontWeight="bold" color="white" mt={0.5}>
                                {stats.successRate.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={stats.successRate}
                                sx={{
                                    mt: 1.5,
                                    height: 8,
                                    borderRadius: 1,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    '& .MuiLinearProgress-bar': { bgcolor: 'white', borderRadius: 1 },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchLogs()}
                                placeholder="Search by email or subject..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'grey.500' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filterStatus}
                                    label="Status"
                                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                    IconComponent={ArrowDownward}
                                >
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="sent">Sent</MenuItem>
                                    <MenuItem value="failed">Failed</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={filterType}
                                    label="Type"
                                    onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                                    IconComponent={ArrowDownward}
                                >
                                    {EMAIL_TYPES.map(type => (
                                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<SearchIcon />}
                                onClick={() => { setCurrentPage(1); fetchLogs(); }}
                                sx={{ height: '100%', textTransform: 'none', fontWeight: 600 }}
                            >
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedLogs.length > 0 && (
                <Alert
                    severity="info"
                    sx={{ mb: 3, borderRadius: 1 }}
                    action={
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkDelete}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Delete Selected
                        </Button>
                    }
                >
                    {selectedLogs.length} item(s) selected
                </Alert>
            )}

            {/* Logs Table */}
            {logs.length === 0 ? (
                <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <CardContent sx={{ py: 8, textAlign: 'center' }}>
                        <EmailIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            No email logs found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email logs will appear here when emails are sent
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedLogs.length === logs.length && logs.length > 0}
                                        indeterminate={selectedLogs.length > 0 && selectedLogs.length < logs.length}
                                        onChange={toggleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log._id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedLogs.includes(log._id)}
                                            onChange={() => toggleSelectLog(log._id)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {log.to}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.primary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {log.subject}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {getTypeBadge(log.type)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.status}
                                            size="small"
                                            {...getStatusChipProps(log.status)}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatRelativeTime(log.createdAt)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="flex-end" gap={0.5}>
                                            <IconButton
                                                size="small"
                                                onClick={() => setSelectedLog(log)}
                                                title="View Details"
                                                sx={{ color: 'info.main' }}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                            {log.status === 'failed' && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleResend(log._id)}
                                                    title="Resend"
                                                    sx={{ color: 'success.main' }}
                                                >
                                                    <ReplayIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(log._id)}
                                                title="Delete"
                                                sx={{ color: 'error.main' }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        color="primary"
                        shape="rounded"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {/* Detail Dialog */}
            <Dialog
                open={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { bgcolor: 'background.paper', borderRadius: 1, backgroundImage: 'none' },
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(to right, #7c3aed, #9333ea)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon /> Email Details
                    </Box>
                    <IconButton onClick={() => setSelectedLog(null)} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                {selectedLog && (
                    <DialogContent sx={{ pt: 3 }}>
                        <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Recipient</Typography>
                                <Typography color="text.primary">{selectedLog.to}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Subject</Typography>
                                <Typography color="text.primary">{selectedLog.subject}</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Type</Typography>
                                    <Typography color="text.primary">{getTypeBadge(selectedLog.type)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Status</Typography>
                                    <Box mt={0.5}>
                                        <Chip
                                            label={selectedLog.status}
                                            size="small"
                                            {...getStatusChipProps(selectedLog.status)}
                                            variant="outlined"
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Sent At</Typography>
                                <Typography color="text.primary">{new Date(selectedLog.createdAt).toLocaleString()}</Typography>
                            </Box>
                            {selectedLog.messageId && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Message ID</Typography>
                                    <Typography color="text.primary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                        {selectedLog.messageId}
                                    </Typography>
                                </Box>
                            )}
                            {selectedLog.error && (
                                <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Typography variant="body2">{selectedLog.error}</Typography>
                                </Alert>
                            )}
                        </Box>
                    </DialogContent>
                )}

                <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="inherit"

                        onClick={() => setSelectedLog(null)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Close
                    </Button>
                    {selectedLog?.status === 'failed' && (
                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<SendIcon />}
                            onClick={() => {
                                handleResend(selectedLog._id);
                                setSelectedLog(null);
                            }}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Resend Email
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}
