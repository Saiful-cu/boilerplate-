'use client';

import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Slider,
    List,
    ListItemButton,
    ListItemText,
    Divider,
    InputAdornment,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SearchIcon from '@mui/icons-material/Search';

interface Category {
    _id: string;
    name: string;
    slug?: string;
    icon?: string;
}

interface PriceRange {
    min: number;
    max: number;
}

interface FilterSidebarProps {
    search: string;
    setSearch: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    categories: Category[];
    priceRange: PriceRange;
    setPriceRange: (value: PriceRange) => void;
    clearFilters: () => void;
}

export default function FilterSidebar({
    search,
    setSearch,
    category,
    setCategory,
    categories,
    priceRange,
    setPriceRange,
    clearFilters,
}: FilterSidebarProps) {
    return (
        <Box component="aside" className="lg:w-64 flex-shrink-0">
            <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #E8E8E8', bgcolor: '#fff', p: 2.5, position: 'sticky', top: 96 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FilterListIcon sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
                        <Typography variant="subtitle1" fontWeight={700}>Filters</Typography>
                    </Box>
                    <Button
                        size="small"
                        startIcon={<ClearAllIcon />}
                        onClick={clearFilters}
                        sx={{
                            textTransform: 'none',
                            color: 'var(--color-primary)',
                            fontSize: '0.8125rem',
                        }}
                    >
                        Clear All
                    </Button>
                </Box>

                {/* Search */}
                <Box mb={3}>
                    <Typography variant="body2" fontWeight={500} mb={1}>Search</Typography>
                    <TextField
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                bgcolor: '#FAFAFA',
                                '& fieldset': { borderColor: '#E8E8E8' },
                                '&:hover fieldset': { borderColor: '#D0D0D0' },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--color-primary)',
                                    borderWidth: 1,
                                },
                            },
                        }}
                    />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Category */}
                <Box mb={3}>
                    <Typography variant="body2" fontWeight={500} mb={1}>Category</Typography>
                    <List dense disablePadding>
                        <ListItemButton
                            selected={!category}
                            onClick={() => setCategory('')}
                            sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)',
                                    color: 'var(--color-primary)',
                                    '&:hover': { backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)' },
                                },
                            }}
                        >
                            <ListItemText
                                primary="All Categories"
                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: !category ? 500 : 400 }}
                            />
                        </ListItemButton>
                        {categories.map((cat) => (
                            <ListItemButton
                                key={cat._id}
                                selected={category === cat.name}
                                onClick={() => setCategory(cat.name)}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)',
                                        color: 'var(--color-primary)',
                                        '&:hover': { backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)' },
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <>
                                            {cat.icon && <span className="mr-2">{cat.icon}</span>}
                                            {cat.name}
                                        </>
                                    }
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: category === cat.name ? 500 : 400,
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Price Range */}
                <Box>
                    <Typography variant="body2" fontWeight={500} mb={2}>Price Range</Typography>
                    <Box px={1}>
                        <Typography variant="caption" color="text.secondary">
                            Min: ৳{priceRange.min}
                        </Typography>
                        <Slider
                            value={priceRange.min}
                            onChange={(_, val) => setPriceRange({ ...priceRange, min: val as number })}
                            min={0}
                            max={5000}
                            sx={{
                                color: 'var(--color-primary)',
                                '& .MuiSlider-thumb': { width: 16, height: 16 },
                            }}
                        />
                    </Box>
                    <Box px={1} mt={1}>
                        <Typography variant="caption" color="text.secondary">
                            Max: ৳{priceRange.max}
                        </Typography>
                        <Slider
                            value={priceRange.max}
                            onChange={(_, val) => setPriceRange({ ...priceRange, max: val as number })}
                            min={0}
                            max={10000}
                            sx={{
                                color: 'var(--color-primary)',
                                '& .MuiSlider-thumb': { width: 16, height: 16 },
                            }}
                        />
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
