'use client';

import { Box, Typography, IconButton, Paper } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

interface QuantitySelectorProps {
    quantity: number;
    onQuantityChange: (quantity: number) => void;
    maxStock: number;
    compact?: boolean;
}

export default function QuantitySelector({ quantity, onQuantityChange, maxStock, compact = false }: QuantitySelectorProps) {
    return (
        <Box onClick={(e) => compact && e.stopPropagation()}>
            {/* Hide label in compact mode (sticky bar) */}
            {!compact && (
                <Typography
                    fontWeight={700}
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: { xs: 1, sm: 1.5 }, color: 'text.primary' }}
                >
                    Quantity
                </Typography>
            )}
            <Paper
                variant="outlined"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: compact ? 1.5 : { xs: 2, sm: 3 },
                    borderWidth: 1,
                    borderColor: 'grey.300',
                    overflow: 'hidden',
                    boxShadow: compact ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                    height: compact ? 36 : 'auto',
                }}
            >
                <IconButton
                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    sx={{
                        borderRadius: 0,
                        width: compact ? 32 : { xs: 40, sm: 44 },
                        height: compact ? 34 : { xs: 40, sm: 44 },
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'grey.100', color: 'text.primary' },
                    }}
                >
                    <RemoveIcon sx={{ fontSize: compact ? 16 : { xs: 18, sm: 20 } }} />
                </IconButton>
                <Box
                    sx={{
                        px: compact ? 1 : { xs: 2, sm: 2.5 },
                        height: '100%',
                        bgcolor: 'grey.50',
                        minWidth: compact ? 36 : { xs: 48, sm: 56 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: '1px solid',
                        borderRight: '1px solid',
                        borderColor: 'grey.200',
                    }}
                >
                    <Typography fontWeight={700} sx={{ fontSize: compact ? '0.875rem' : { xs: '1rem', sm: '1.125rem' }, lineHeight: 1 }}>
                        {quantity}
                    </Typography>
                </Box>
                <IconButton
                    onClick={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock}
                    aria-label="Increase quantity"
                    sx={{
                        borderRadius: 0,
                        width: compact ? 32 : { xs: 40, sm: 44 },
                        height: compact ? 34 : { xs: 40, sm: 44 },
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'grey.100', color: 'text.primary' },
                        '&.Mui-disabled': { opacity: 0.4 },
                    }}
                >
                    <AddIcon sx={{ fontSize: compact ? 16 : { xs: 18, sm: 20 } }} />
                </IconButton>
            </Paper>
        </Box>
    );
}
