'use client';

import {
    Box,
    Paper,
    Typography,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import type { SelectChangeEvent } from '@mui/material/Select';

interface SortBarProps {
    sortBy: string;
    setSortBy: (value: string) => void;
}

export default function SortBar({ sortBy, setSortBy }: SortBarProps) {
    const handleChange = (e: SelectChangeEvent<string>) => {
        setSortBy(e.target.value);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '8px',
                border: '1px solid #E8E8E8',
                bgcolor: '#fff',
                p: { xs: 1, sm: 1.5 },
                mb: { xs: 0, md: 2 },
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Box display="flex" alignItems="center" gap={1} sx={{ width: '100%' }}>
                <SortIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} />

                {/* hide the label on very small screens to save space */}
                <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                    Sort by:
                </Typography>

                <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 180 }, ml: { xs: 0.5, sm: 1 } }}>
                    <Select
                        value={sortBy}
                        onChange={handleChange}
                        sx={{
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            bgcolor: '#FAFAFA',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8E8E8' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D0D0' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'var(--color-primary)',
                                borderWidth: 1,
                            },
                        }}
                    >
                        <MenuItem value="featured">Featured</MenuItem>
                        <MenuItem value="newest">Newest</MenuItem>
                        <MenuItem value="price-low">Price: Low to High</MenuItem>
                        <MenuItem value="price-high">Price: High to Low</MenuItem>
                        <MenuItem value="rating">Top Rated</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Paper>
    );
}
