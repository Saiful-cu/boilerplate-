'use client';

import { useState } from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';

interface ProductImageGalleryProps {
    images?: string[];
    productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const displayImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600'];

    return (
        <Box className="lg:sticky lg:top-4">
            {/* Main Image */}
            <Paper
                elevation={3}
                sx={{
                    position: 'relative',
                    borderRadius: { xs: 1, sm: 2 },
                    overflow: 'hidden',
                    mb: { xs: 1.5, sm: 2 },
                    aspectRatio: '1',
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                }}
                onClick={() => setIsZoomed(!isZoomed)}
            >
                <img
                    src={displayImages[selectedImage]}
                    alt={productName}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s',
                        transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                    }}
                />
                {displayImages.length > 1 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: { xs: 12, sm: 16 },
                            right: { xs: 12, sm: 16 },
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            px: { xs: 1, sm: 1.5 },
                            py: { xs: 0.5, sm: 0.75 },
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {selectedImage + 1} / {displayImages.length}
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Thumbnail Images */}
            {displayImages.length > 1 && (
                <Box display="flex" gap={{ xs: 1, sm: 1.5 }} overflow="auto" pb={1}>
                    {displayImages.map((img, idx) => (
                        <IconButton
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            disableRipple
                            sx={{
                                p: 0,
                                flexShrink: 0,
                                width: { xs: 64, sm: 80 },
                                height: { xs: 64, sm: 80 },
                                borderRadius: { xs: 1, sm: 2 },
                                overflow: 'hidden',
                                border: 2,
                                borderStyle: 'solid',
                                borderColor: selectedImage === idx ? 'var(--color-primary)' : 'grey.300',
                                opacity: selectedImage === idx ? 1 : 0.7,
                                transform: selectedImage === idx ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.2s',
                                boxShadow: selectedImage === idx ? '0 0 0 3px rgba(var(--color-primary-rgb),0.3)' : 'none',
                                '&:hover': {
                                    opacity: 1,
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            <img
                                src={img}
                                alt={`${productName} ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </IconButton>
                    ))}
                </Box>
            )}
        </Box>
    );
}
