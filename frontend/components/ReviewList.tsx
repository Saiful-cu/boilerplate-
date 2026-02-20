'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    Rating,
    LinearProgress,
    CircularProgress,
    Alert,
    Pagination,
    Divider,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
    productId: string;
}

interface RatingDistribution {
    [key: number]: number;
}

export default function ReviewList({ productId }: ReviewListProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({});
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params: Record<string, number> = { page, limit: 10 };
            if (filterRating) params.rating = filterRating;

            const { data } = await api.get(`/reviews/product/${productId}`, { params });

            setReviews(data.data || []);
            setTotalPages(data.pagination?.pages || 1);
            setRatingDistribution(data.ratingDistribution || {});
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.pagination?.total || 0);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews. Please try again later.');
            setReviews([]);
            setTotalPages(1);
            setRatingDistribution({});
            setAverageRating(0);
            setTotalReviews(0);
        } finally {
            setLoading(false);
        }
    }, [productId, page, filterRating]);

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId, fetchReviews]);

    useEffect(() => {
        setPage(1);
    }, [filterRating]);

    const handleHelpful = async (reviewId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to mark reviews as helpful');
                return;
            }

            await api.put(`/reviews/${reviewId}/helpful`);
            fetchReviews();
        } catch (err) {
            console.error('Error marking review as helpful:', err);
        }
    };

    const getRatingPercentage = (rating: number) => {
        const count = ratingDistribution[rating] || 0;
        return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    };

    if (loading && page === 1) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                action={
                    <Button
                        color="inherit"
                        size="small"
                        onClick={() => fetchReviews()}
                        sx={{ textTransform: 'none' }}
                    >
                        Try Again
                    </Button>
                }
            >
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Rating Overview */}
            <Paper variant="outlined" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Product reviews ({totalReviews})
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 2fr' }, gap: 3, mb: 3 }}>
                    {/* Average Rating */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight={700} color="text.primary" gutterBottom>
                            {averageRating.toFixed(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                            <Rating value={Math.round(averageRating)} readOnly />
                        </Box>
                        <Typography variant="caption" fontWeight={500} sx={{ color: 'var(--color-primary)' }}>
                            Very satisfied
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                            Based on {totalReviews} reviews
                        </Typography>
                    </Box>

                    {/* Rating Distribution */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <Box
                                key={rating}
                                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    ...(filterRating === rating
                                        ? { bgcolor: 'rgba(var(--color-primary-rgb), 0.1)', outline: '2px solid var(--color-primary)' }
                                        : { '&:hover': { bgcolor: 'action.hover' } }),
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 36 }}>
                                    <StarIcon sx={{ fontSize: 14, color: '#faaf00' }} />
                                    <Typography
                                        variant="body2"
                                        fontWeight={filterRating === rating ? 700 : 500}
                                        color={filterRating === rating ? 'text.primary' : 'text.secondary'}
                                    >
                                        {rating}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={getRatingPercentage(rating)}
                                    sx={{
                                        flex: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: 'grey.200',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'var(--color-primary)',
                                            borderRadius: 4,
                                        },
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{ minWidth: 28, textAlign: 'right' }}
                                    fontWeight={filterRating === rating ? 700 : 400}
                                    color={filterRating === rating ? 'text.primary' : 'text.secondary'}
                                >
                                    {ratingDistribution[rating] || 0}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Filters and Sort */}
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, pt: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterListIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                            <Typography variant="body2" color="text.secondary">Sort by: Most relevant</Typography>
                        </Box>
                        {filterRating && (
                            <Chip
                                icon={<StarIcon sx={{ fontSize: 14 }} />}
                                label={`${filterRating} Star filter active`}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(var(--color-primary-rgb), 0.1)',
                                    color: 'var(--color-primary)',
                                    fontWeight: 500,
                                }}
                            />
                        )}
                    </Box>
                    {filterRating && (
                        <Button
                            size="small"
                            onClick={() => setFilterRating(null)}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 4,
                                bgcolor: 'rgba(var(--color-primary-rgb), 0.2)',
                                color: 'var(--color-primary)',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                '&:hover': { bgcolor: 'rgba(var(--color-primary-rgb), 0.3)' },
                            }}
                        >
                            Clear filter ×
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* Reviews List */}
            {reviews.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reviews.map((review) => (
                        <ReviewCard key={review._id} review={review} onHelpful={handleHelpful} />
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </Box>
            ) : (
                <Paper variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
                    <StarBorderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                    <Typography color="text.secondary">
                        {filterRating
                            ? `No ${filterRating} star reviews yet`
                            : 'No reviews yet. Be the first to review!'}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}
