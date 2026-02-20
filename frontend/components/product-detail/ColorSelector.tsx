'use client';

import { Box, Typography } from '@mui/material';

interface ColorOption {
    name: string;
    image?: string;
}

interface ColorSelectorProps {
    colors: (string | ColorOption)[];
    selectedColor: string;
    onColorChange: (color: string) => void;
    getColorHex: (name: string | null | undefined) => string | null;
    isLightColor: (name: string | null | undefined) => boolean;
}

export default function ColorSelector({ colors, selectedColor, onColorChange, getColorHex, isLightColor }: ColorSelectorProps) {
    if (!colors || colors.length === 0) return null;

    return (
        <Box>

            <Box display="flex" alignItems="center" gap={{ xs: 2, sm: 1.5 }} flexWrap="wrap">
                {colors.map((color, idx) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    const colorImage = typeof color === 'object' ? color.image : null;
                    const colorHex = getColorHex(colorName);
                    const isLight = isLightColor(colorName);
                    const isSelected = selectedColor === colorName;

                    return (
                        <Box key={idx} display="flex" flexDirection="column" alignItems="center" sx={{ minWidth: 64 }}>
                            <Box
                                onClick={() => onColorChange(colorName)}
                                role="button"
                                tabIndex={0}
                                sx={{
                                    width: { xs: 44, sm: 56 },
                                    height: { xs: 44, sm: 56 },
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: isSelected ? '3px solid var(--color-primary)' : '2px solid #E5E7EB',
                                    boxShadow: isSelected ? '0 6px 20px rgba(var(--color-primary-rgb),0.18)' : 'none',
                                    backgroundColor: colorHex || '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.18s',
                                }}
                            >
                                {colorImage ? (
                                    <img src={colorImage} alt={colorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Box sx={{ width: '60%', height: '60%', borderRadius: '50%', backgroundColor: colorHex || '#F3F4F6', border: isLight ? '1px solid rgba(0,0,0,0.2)' : 'none' }} />
                                )}
                            </Box>
                            <Typography variant="caption" sx={{ mt: 0.5, fontWeight: isSelected ? 700 : 600, color: isSelected ? 'text.primary' : 'text.secondary' }}>{colorName}</Typography>
                        </Box>
                    );
                })}
            </Box>
            <Typography
                fontWeight={500}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, mt: 1, color: 'text.secondary' }}
            >
                Color:{' '}
                <Box component="span" sx={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    {selectedColor || 'Select a color'}
                </Box>
            </Typography>
        </Box>
    );
}
