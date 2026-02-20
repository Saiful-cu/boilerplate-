'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Box,
    IconButton,
    Button,
    Dialog,
    DialogContent,
    Chip,
    Rating,
    Divider,
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';

interface ReviewUser {
    name?: string;
}

interface Review {
    _id: string;
    user?: ReviewUser;
    rating: number;
    comment: string;
    images?: string[];
    videos?: string[];
    verified?: boolean;
    helpful?: string[];
    createdAt: string;
}

interface ReviewCardProps {
    review: Review;
    onHelpful: (reviewId: string) => void;
}

const getAssetUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `/api${path.startsWith('/') ? path : `/${path}`}`;
};

export default function ReviewCard({ review, onHelpful }: ReviewCardProps) {
    const [showAllImages, setShowAllImages] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ type: string; url: string } | null>(null);

    const displayImages = showAllImages
        ? (review.images || [])
        : (review.images || []).slice(0, 3);

    const helpfulCount = review.helpful?.length || 0;

    return (
        <>
            <Card variant="outlined" sx={{ '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* User Info & Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-accent))',
                                fontWeight: 'bold',
                                fontSize: '1.125rem',
                            }}
                        >
                            {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: { sm: 'space-between' }, gap: 0.5, mb: 0.5 }}>
                                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                    {review.user?.name || 'Anonymous'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PublicIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">International</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Rating value={review.rating} readOnly size="small" />
                                <Typography variant="caption" color="text.disabled">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </Typography>
                            </Box>
                            {review.verified && (
                                <Chip
                                    icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                                    label="Verified purchase"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ mt: 0.75, height: 24, fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Review Content */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                            {review.comment}
                        </Typography>
                    </Box>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                                {displayImages.map((image, index) => (
                                    <Box
                                        key={index}
                                        component="img"
                                        src={getAssetUrl(image)}
                                        alt={`Review ${index + 1}`}
                                        sx={{
                                            width: '100%',
                                            height: 96,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': { opacity: 0.8 },
                                            transition: 'opacity 0.2s',
                                        }}
                                        onClick={() => setSelectedMedia({ type: 'image', url: image })}
                                    />
                                ))}
                            </Box>
                            {review.images.length > 3 && !showAllImages && (
                                <Button
                                    size="small"
                                    onClick={() => setShowAllImages(true)}
                                    sx={{ mt: 1, textTransform: 'none', color: 'var(--color-primary)' }}
                                >
                                    +{review.images.length - 3} more images
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Review Videos */}
                    {review.videos && review.videos.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                                {review.videos.map((video, index) => (
                                    <Box
                                        key={index}
                                        component="video"
                                        src={getAssetUrl(video)}
                                        controls
                                        sx={{
                                            width: '100%',
                                            height: 128,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                        onClick={() => setSelectedMedia({ type: 'video', url: video })}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Helpful Button */}
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            startIcon={<ThumbUpOutlinedIcon />}
                            size="small"
                            color="inherit"
                            onClick={() => onHelpful(review._id)}
                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                        >
                            Helpful ({helpfulCount})
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Media Modal */}
            <Dialog
                open={!!selectedMedia}
                onClose={() => setSelectedMedia(null)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
                slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.75)' } } }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        onClick={() => setSelectedMedia(null)}
                        sx={{ position: 'absolute', top: -40, right: 0, color: 'white', '&:hover': { color: 'var(--color-primary)' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {selectedMedia?.type === 'image' ? (
                        <Box
                            component="img"
                            src={getAssetUrl(selectedMedia.url)}
                            alt="Review media"
                            sx={{ width: '100%', height: 'auto', borderRadius: 2 }}
                        />
                    ) : selectedMedia ? (
                        <Box
                            component="video"
                            src={getAssetUrl(selectedMedia.url)}
                            controls
                            autoPlay
                            sx={{ width: '100%', height: 'auto', borderRadius: 2 }}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
