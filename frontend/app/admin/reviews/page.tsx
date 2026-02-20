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
    MenuItem,
    Select,
    FormControl,
    Chip,
    Skeleton,
    Card,
    CardContent,
    Rating,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    SelectChangeEvent,
    alpha,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StarIcon from '@mui/icons-material/Star';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface Review {
    _id: string;
    user: { _id: string; name: string; email: string };
    product: { _id: string; name: string };
    rating: number;
    title: string;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    images?: string[];
    adminResponse?: string;
    createdAt: string;
}

interface StatusCounts {
    pending?: number;
    approved?: number;
    rejected?: number;
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [ratingFilter, setRatingFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusCounts, setStatusCounts] = useState<StatusCounts>({});
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = useCallback(async (retry = 0) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(statusFilter && { status: statusFilter }),
                ...(ratingFilter && { rating: ratingFilter }),
                ...(searchQuery && { search: searchQuery }),
            });

            const response = await api.get(`/admin/reviews?${params}`);
            setReviews(response.data?.data || []);
            setTotalPages(response.data?.pagination?.pages || 1);
            setStatusCounts(response.data?.statusCounts || {});
            setRetryCount(0);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            if (retry < MAX_RETRIES) {
                setRetryCount(retry + 1);
                setTimeout(() => fetchReviews(retry + 1), RETRY_DELAY * Math.pow(2, retry));
                return;
            }
            setError('Failed to fetch reviews. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, ratingFilter, searchQuery]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleStatusUpdate = async (reviewId: string, newStatus: string, response?: string) => {
        setSubmitting(true);
        try {
            await api.put(`/admin/reviews/${reviewId}/status`, {
                status: newStatus,
                ...(response && { adminResponse: response }),
            });
            toast.success(`Review ${newStatus}`);
            fetchReviews();
            setSelectedReview(null);
            setAdminResponse('');
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Failed to update review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await api.delete(`/admin/reviews/${reviewId}`);
            toast.success('Review deleted');
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const getStatusChipProps = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'pending', sx: { bgcolor: 'rgba(250,204,21,0.2)', color: 'custom.warning', fontWeight: 500, fontSize: '0.75rem' } };
            case 'approved':
                return { label: 'approved', sx: { bgcolor: 'rgba(74,222,128,0.2)', color: 'custom.success', fontWeight: 500, fontSize: '0.75rem' } };
            case 'rejected':
                return { label: 'rejected', sx: { bgcolor: 'rgba(248,113,113,0.2)', color: 'custom.danger', fontWeight: 500, fontSize: '0.75rem' } };
            default:
                return { label: status, sx: { bgcolor: 'rgba(156,163,175,0.2)', color: 'custom.neutral', fontWeight: 500, fontSize: '0.75rem' } };
        }
    };

    const totalReviews = (statusCounts.pending || 0) + (statusCounts.approved || 0) + (statusCounts.rejected || 0);

    if (loading && reviews.length === 0) {
        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Reviews Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading reviews...'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="rounded" height={80} />
                    ))}
                </Box>
                <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rounded" height={150} />
                    ))}
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Reviews Management</Typography>
                    <Typography variant="body2" color="text.secondary">Moderate and respond to customer reviews.</Typography>
                </Box>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => { setLoading(true); fetchReviews(0); }} startIcon={<RefreshIcon />}>
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
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StarIcon sx={{ color: 'custom.warning' }} /> Reviews Management
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,228,230,0.8)', mt: 0.5 }}>
                            {totalReviews} total reviews
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Chip
                            label={`Pending: ${statusCounts.pending || 0}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(250,204,21,0.3)', color: '#fef08a' }}
                        />
                        <Chip
                            label={`Approved: ${statusCounts.approved || 0}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(74,222,128,0.3)', color: '#bbf7d0' }}
                        />
                        <Chip
                            label={`Rejected: ${statusCounts.rejected || 0}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(248,113,113,0.3)', color: '#fecaca' }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Filters */}
            <Card
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    mb: 3,
                }}
            >
                <CardContent>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <FormControl fullWidth size="small">
                            <Select
                                value={statusFilter}
                                onChange={(e: SelectChangeEvent) => { setStatusFilter(e.target.value); setPage(1); }}
                                displayEmpty
                                sx={{
                                    bgcolor: 'background.default',
                                    color: 'text.primary',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: { bgcolor: 'background.paper', color: 'text.primary' },
                                    },
                                }}
                            >
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <Select
                                value={ratingFilter}
                                onChange={(e: SelectChangeEvent) => { setRatingFilter(e.target.value); setPage(1); }}
                                displayEmpty
                                sx={{
                                    bgcolor: 'background.default',
                                    color: 'text.primary',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                    '& .MuiSvgIcon-root': { color: 'text.secondary' },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: { bgcolor: 'background.paper', color: 'text.primary' },
                                    },
                                }}
                            >
                                <MenuItem value="">All Ratings</MenuItem>
                                <MenuItem value="5">5 Stars</MenuItem>
                                <MenuItem value="4">4 Stars</MenuItem>
                                <MenuItem value="3">3 Stars</MenuItem>
                                <MenuItem value="2">2 Stars</MenuItem>
                                <MenuItem value="1">1 Star</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchReviews()}
                            placeholder="Search reviews..."
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'background.default',
                                    color: 'text.primary',
                                    '& fieldset': { borderColor: 'divider' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                },
                                '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <Card
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        py: 6,
                        textAlign: 'center',
                    }}
                >
                    <CardContent>
                        <Typography sx={{ fontSize: '3rem', mb: 2 }}>📝</Typography>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                            No reviews found
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            Try adjusting your filters
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reviews.map((review) => (
                        <Card
                            key={review._id}
                            sx={{
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                '&:hover': { borderColor: 'action.selected' },
                                transition: 'border-color 0.2s',
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', lg: 'row' },
                                        gap: 2,
                                    }}
                                >
                                    {/* User Info */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flexShrink: 0, width: { lg: 192 } }}>
                                        <Avatar
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                background: 'linear-gradient(to bottom right, #a855f7, #ec4899)',
                                                fontWeight: 'bold',
                                                fontSize: '1.125rem',
                                            }}
                                        >
                                            {review.user?.name?.[0] || '?'}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {review.user?.name || 'Unknown'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {review.user?.email || ''}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Review Content */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                                            <Rating
                                                value={review.rating}
                                                readOnly
                                                size="small"
                                                sx={{
                                                    '& .MuiRating-iconFilled': { color: '#facc15' },
                                                    '& .MuiRating-iconEmpty': { color: 'action.disabled' },
                                                }}
                                            />
                                            <Chip size="small" {...getStatusChipProps(review.status)} />
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>

                                        {review.title && (
                                            <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                                {review.title}
                                            </Typography>
                                        )}
                                        <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                                            {review.comment}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Product: <Box component="span" sx={{ color: 'primary.main' }}>{review.product?.name || 'Unknown'}</Box>
                                        </Typography>

                                        {review.images && review.images.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                                                {review.images.map((img, i) => (
                                                    <Box
                                                        key={i}
                                                        component="img"
                                                        src={img}
                                                        alt=""
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            borderRadius: 2,
                                                            objectFit: 'cover',
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}

                                        {review.adminResponse && (
                                            <Box
                                                sx={{
                                                    mt: 1.5,
                                                    p: 1.5,
                                                    bgcolor: (t) => alpha(t.palette.warning.main, 0.1),
                                                    border: '1px solid',
                                                    borderColor: (t) => alpha(t.palette.warning.main, 0.3),
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500, mb: 0.5 }}>
                                                    Admin Response:
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {review.adminResponse}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Actions */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'row', lg: 'column' },
                                            gap: 1,
                                            flexShrink: 0,
                                            width: { lg: 128 },
                                        }}
                                    >
                                        {review.status === 'pending' && (
                                            <>
                                                <Button
                                                    onClick={() => handleStatusUpdate(review._id, 'approved')}
                                                    startIcon={<CheckIcon />}
                                                    size="small"
                                                    sx={{
                                                        flex: { xs: 1, lg: 'unset' },
                                                        bgcolor: (t) => alpha(t.palette.success.main, 0.2),
                                                        color: 'success.main',
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        '&:hover': { bgcolor: (t) => alpha(t.palette.success.main, 0.4) },
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate(review._id, 'rejected')}
                                                    startIcon={<CloseIcon />}
                                                    size="small"
                                                    sx={{
                                                        flex: { xs: 1, lg: 'unset' },
                                                        bgcolor: (t) => alpha(t.palette.error.main, 0.2),
                                                        color: 'error.main',
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        '&:hover': { bgcolor: (t) => alpha(t.palette.error.main, 0.4) },
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            onClick={() => setSelectedReview(review)}
                                            startIcon={<ChatBubbleOutlineIcon />}
                                            size="small"
                                            sx={{
                                                flex: { xs: 1, lg: 'unset' },
                                                bgcolor: (t) => alpha(t.palette.warning.main, 0.2),
                                                color: 'warning.main',
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                '&:hover': { bgcolor: (t) => alpha(t.palette.warning.main, 0.4) },
                                            }}
                                        >
                                            Reply
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(review._id)}
                                            startIcon={<DeleteOutlineIcon />}
                                            size="small"
                                            sx={{
                                                flex: { xs: 1, lg: 'unset' },
                                                bgcolor: 'action.hover',
                                                color: 'text.secondary',
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                '&:hover': { bgcolor: 'action.selected' },
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4 }}>
                    <Button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        startIcon={<NavigateBeforeIcon />}
                        sx={{
                            bgcolor: 'action.selected',
                            color: 'text.primary',
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'action.hover' },
                            '&.Mui-disabled': { opacity: 0.5, color: 'text.secondary' },
                        }}
                    >
                        Previous
                    </Button>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Page {page} of {totalPages}
                    </Typography>
                    <Button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        endIcon={<NavigateNextIcon />}
                        sx={{
                            bgcolor: 'action.selected',
                            color: 'text.primary',
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'action.hover' },
                            '&.Mui-disabled': { opacity: 0.5, color: 'text.secondary' },
                        }}
                    >
                        Next
                    </Button>
                </Box>
            )}

            {/* Response Modal */}
            <Dialog
                open={!!selectedReview}
                onClose={() => { setSelectedReview(null); setAdminResponse(''); }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        overflow: 'hidden',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(to right, #ea580c, #dc2626)',
                        color: '#fff',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <ChatBubbleOutlineIcon /> Reply to Review
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 1 }}>
                    {selectedReview && (
                        <>
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Rating
                                        value={selectedReview.rating}
                                        readOnly
                                        size="small"
                                        sx={{
                                            '& .MuiRating-iconFilled': { color: '#facc15' },
                                            '& .MuiRating-iconEmpty': { color: 'action.disabled' },
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        by {selectedReview.user?.name}
                                    </Typography>
                                </Box>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    {selectedReview.comment}
                                </Typography>
                            </Box>

                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                                Your Response
                            </Typography>
                            <TextField
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                placeholder="Write your response..."
                                multiline
                                rows={4}
                                fullWidth
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
                    <Button
                        onClick={() => { setSelectedReview(null); setAdminResponse(''); }}
                        fullWidth
                        sx={{
                            bgcolor: 'action.selected',
                            color: 'text.primary',
                            textTransform: 'none',
                            fontWeight: 500,
                            py: 1.5,
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => selectedReview && handleStatusUpdate(selectedReview._id, selectedReview.status, adminResponse)}
                        disabled={submitting || !adminResponse.trim()}
                        fullWidth
                        sx={{
                            background: 'linear-gradient(to right, #ea580c, #dc2626)',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 500,
                            py: 1.5,
                            '&:hover': { background: 'linear-gradient(to right, #c2410c, #b91c1c)' },
                            '&.Mui-disabled': { opacity: 0.5, color: '#fff' },
                        }}
                    >
                        {submitting ? 'Sending...' : 'Send Response'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
