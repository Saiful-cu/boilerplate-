'use client';

import { Box, Typography, Chip } from '@mui/material';

interface SizeSelectorProps {
    sizes: string[];
    selectedSize: string;
    onSizeChange: (size: string) => void;
}

export default function SizeSelector({ sizes, selectedSize, onSizeChange }: SizeSelectorProps) {
    if (!sizes || sizes.length === 0) return null;

    return (
        <Box>
            <Typography
                fontWeight={700}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: { xs: 1, sm: 1.5 }, color: 'text.primary' }}
            >
                Size:{' '}
                <Box component="span" sx={{ color: 'var(--color-primary)' }}>
                    {selectedSize || 'Select a size'}
                </Box>
            </Typography>
            <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }} flexWrap="wrap">
                {sizes.map((size, idx) => {
                    const isSelected = selectedSize === size;
                    return (
                        <Chip
                            key={idx}
                            label={size}
                            onClick={() => onSizeChange(size)}
                            sx={{
                                width: { xs: 48, sm: 56 },
                                height: { xs: 48, sm: 56 },
                                borderRadius: { xs: 2, sm: 3 },
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 700,
                                border: '2px solid',
                                borderColor: isSelected ? 'var(--color-primary)' : 'grey.300',
                                backgroundColor: isSelected ? 'var(--color-primary)' : 'white',
                                color: isSelected ? 'white' : 'text.primary',
                                boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: isSelected ? 'var(--color-primary)' : 'rgba(var(--color-primary-rgb),0.4)',
                                    transform: 'scale(1.05)',
                                    backgroundColor: isSelected ? 'var(--color-primary)' : 'white',
                                },
                                '& .MuiChip-label': { px: 0 },
                            }}
                        />
                    );
                })}
            </Box>
        </Box>
    );
}
