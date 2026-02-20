'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    TextField,
    Rating,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface ReviewFormProps {
    productId: string;
    orderId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ReviewForm({ productId, orderId, onSuccess, onCancel }: ReviewFormProps) {
    const [formData, setFormData] = useState({ rating: 0, comment: '' });
    const [images, setImages] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [_hoverRating, setHoverRating] = useState<number | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setImages([...images, ...files]);

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (videos.length + files.length > 2) {
            setError('Maximum 2 videos allowed');
            return;
        }

        setVideos([...videos, ...files]);

        files.forEach((file) => {
            const url = URL.createObjectURL(file);
            setVideoPreviews((prev) => [...prev, url]);
        });
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const removeVideo = (index: number) => {
        setVideos(videos.filter((_, i) => i !== index));
        setVideoPreviews(videoPreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.rating === 0) {
            setError('Please select a rating');
            toast.error('Please select a rating');
            return;
        }

        if (!formData.comment.trim()) {
            setError('Please write your review comment');
            toast.error('Please write your review comment');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('productId', productId);
            formDataToSend.append('orderId', orderId);
            formDataToSend.append('rating', formData.rating.toString());
            formDataToSend.append('comment', formData.comment);

            images.forEach((image) => {
                formDataToSend.append('images', image);
            });

            videos.forEach((video) => {
                formDataToSend.append('videos', video);
            });

            await api.post('/reviews', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Review submitted successfully! It will be visible after admin approval.');
            onSuccess();
        } catch (err: unknown) {
            console.error('Review submission error:', err);
            const errorMessage =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Error submitting review';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onClose={onCancel} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Write a Review</Typography>
                <IconButton onClick={onCancel} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    {/* Rating */}
                    <Box>
                        <Typography variant="body2" fontWeight={600} gutterBottom>Rating *</Typography>
                        <Rating
                            value={formData.rating}
                            onChange={(_, newValue) => setFormData({ ...formData, rating: newValue || 0 })}
                            onChangeActive={(_, newHover) => setHoverRating(newHover)}
                            size="large"
                            sx={{ fontSize: '2rem' }}
                        />
                    </Box>

                    {/* Comment */}
                    <Box>
                        <TextField
                            label="Your Review *"
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder="Share your experience with this product"
                            multiline
                            rows={5}
                            fullWidth
                            required
                            inputProps={{ maxLength: 1000 }}
                            helperText={`${formData.comment.length}/1000`}
                        />
                    </Box>

                    {/* Image Upload */}
                    <Box>
                        <Typography variant="body2" fontWeight={600} gutterBottom>Add Photos (Max 5)</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {imagePreviews.map((preview, index) => (
                                <Box key={index} sx={{ position: 'relative', '&:hover .delete-btn': { opacity: 1 } }}>
                                    <Box
                                        component="img"
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 2 }}
                                    />
                                    <IconButton
                                        className="delete-btn"
                                        size="small"
                                        onClick={() => removeImage(index)}
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            bgcolor: 'error.main',
                                            color: 'white',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            p: 0.5,
                                            '&:hover': { bgcolor: 'error.dark' },
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
                            ))}
                            {images.length < 5 && (
                                <Button
                                    component="label"
                                    variant="outlined"
                                    sx={{
                                        width: 96,
                                        height: 96,
                                        borderStyle: 'dashed',
                                        borderWidth: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        textTransform: 'none',
                                    }}
                                >
                                    <AddPhotoAlternateIcon sx={{ color: 'text.disabled' }} />
                                    <Typography variant="caption" color="text.secondary">Add Photo</Typography>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        hidden
                                    />
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Video Upload */}
                    <Box>
                        <Typography variant="body2" fontWeight={600} gutterBottom>Add Videos (Max 2)</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {videoPreviews.map((preview, index) => (
                                <Box key={index} sx={{ position: 'relative', '&:hover .delete-btn': { opacity: 1 } }}>
                                    <Box
                                        component="video"
                                        src={preview}
                                        controls
                                        sx={{ width: 128, height: 96, objectFit: 'cover', borderRadius: 2 }}
                                    />
                                    <IconButton
                                        className="delete-btn"
                                        size="small"
                                        onClick={() => removeVideo(index)}
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            bgcolor: 'error.main',
                                            color: 'white',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            p: 0.5,
                                            '&:hover': { bgcolor: 'error.dark' },
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
                            ))}
                            {videos.length < 2 && (
                                <Button
                                    component="label"
                                    variant="outlined"
                                    sx={{
                                        width: 128,
                                        height: 96,
                                        borderStyle: 'dashed',
                                        borderWidth: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        textTransform: 'none',
                                    }}
                                >
                                    <VideoCameraBackIcon sx={{ color: 'text.disabled' }} />
                                    <Typography variant="caption" color="text.secondary">Add Video</Typography>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        onChange={handleVideoChange}
                                        hidden
                                    />
                                </Button>
                            )}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={loading}
                        fullWidth
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        fullWidth
                        sx={{ textTransform: 'none' }}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
