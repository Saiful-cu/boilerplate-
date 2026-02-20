'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/lib/context/CartContext';
import { FilterSidebar, SortBar, ProductGrid } from '@/components/products';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    images: string[];
    rating?: number;
    createdAt?: string;
    stock?: number;
}

interface Category {
    _id: string;
    name: string;
}

export default function Products() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');
        if (categoryParam) setCategory(categoryParam);
        if (searchParam) setSearch(searchParam);
    }, [searchParams]);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, category, search, sortBy, priceRange]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories?active=true');
            setCategories(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        if (category) {
            filtered = filtered.filter(
                (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
            );
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    (p.name && p.name.toLowerCase().includes(searchLower)) ||
                    (p.description && p.description.toLowerCase().includes(searchLower)) ||
                    (p.category && p.category.toLowerCase().includes(searchLower))
            );
        }

        filtered = filtered.filter((p) => {
            const productPrice = p.price || 0;
            return productPrice >= priceRange.min && productPrice <= priceRange.max;
        });

        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                filtered.sort(
                    (a, b) =>
                        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
    };

    const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    const clearFilters = () => {
        setCategory('');
        setSearch('');
        setSortBy('featured');
        setPriceRange({ min: 0, max: 10000 });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }} data-testid="products-page">
            {/* Brand stripe */}
            <Box sx={{ height: 3, bgcolor: 'var(--color-primary)' }} />

            <Box className="container mx-auto px-4 md:px-6 py-4 md:py-6" sx={{ maxWidth: '80rem' }}>
                {/* Header Section */}
                <Box
                    sx={{
                        bgcolor: '#fff',
                        border: '1px solid #E8E8E8',
                        borderRadius: '8px',
                        p: { xs: 2, md: 2.5 },
                        mb: { xs: 2, md: 3 },
                    }}
                >
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.5}>
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Box
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(var(--color-primary-rgb), 0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <ShoppingCartIcon sx={{ fontSize: 15, color: 'var(--color-primary)' }} />
                                </Box>
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: { xs: '1rem', sm: '1.1rem' },
                                        color: '#212121',
                                        fontFamily: 'var(--font-heading)',
                                    }}
                                    data-testid="products-title"
                                >
                                    {category ? `${category}` : 'Discover Products'}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" ml={5}>
                                <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }} data-testid="products-count">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                                </Typography>
                                {category && (
                                    <Chip
                                        label={category}
                                        variant="outlined"
                                        size="small"
                                        sx={{ fontWeight: 500, fontSize: '0.68rem', height: 22, borderColor: '#E8E8E8', color: '#757575' }}
                                    />
                                )}
                                {search && (
                                    <Chip
                                        label={`"${search}"`}
                                        variant="outlined"
                                        size="small"
                                        sx={{ fontWeight: 500, fontSize: '0.68rem', height: 22, borderColor: '#E8E8E8', color: '#757575' }}
                                    />
                                )}
                            </Box>
                        </Box>

                        {/* View Mode Toggle - Desktop */}
                        <Box display={{ xs: 'none', lg: 'flex' }} gap={0.5}>
                            <IconButton
                                onClick={() => setViewMode('grid')}
                                size="small"
                                sx={{
                                    bgcolor: viewMode === 'grid' ? 'rgba(var(--color-primary-rgb), 0.08)' : 'transparent',
                                    color: viewMode === 'grid' ? 'var(--color-primary)' : '#9E9E9E',
                                    borderRadius: '6px',
                                    '&:hover': { bgcolor: 'rgba(var(--color-primary-rgb), 0.06)' },
                                }}
                                aria-label="Grid view"
                            >
                                <GridViewIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                                onClick={() => setViewMode('list')}
                                size="small"
                                sx={{
                                    bgcolor: viewMode === 'list' ? 'rgba(var(--color-primary-rgb), 0.08)' : 'transparent',
                                    color: viewMode === 'list' ? 'var(--color-primary)' : '#9E9E9E',
                                    borderRadius: '6px',
                                    '&:hover': { bgcolor: 'rgba(var(--color-primary-rgb), 0.06)' },
                                }}
                                aria-label="List view"
                            >
                                <ViewListIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '320px 1fr' }} gap={{ xs: 2, md: 3 }}>
                    {/* Desktop Filter Sidebar */}
                    <Box display={{ xs: 'none', lg: 'block' }}>
                        <Box position="sticky" top={20}>
                            <FilterSidebar
                                search={search}
                                setSearch={setSearch}
                                category={category}
                                setCategory={setCategory}
                                categories={categories}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                clearFilters={clearFilters}
                            />
                        </Box>
                    </Box>

                    {/* Main Content */}
                    <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={1.5} flexWrap="wrap">
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                                <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                                    <SortBar sortBy={sortBy} setSortBy={setSortBy} />
                                </Box>

                                {/* Mobile Filter Button — icon-only on xs, full button on sm+ */}
                                <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton
                                        aria-label="Open filters"
                                        onClick={() => setFilterDrawerOpen(true)}
                                        size="small"
                                        sx={{ display: { xs: 'inline-flex', sm: 'none' }, bgcolor: 'grey.100' }}
                                    >
                                        <FilterListIcon />
                                    </IconButton>

                                    <Button
                                        onClick={() => setFilterDrawerOpen(true)}
                                        variant="outlined"
                                        startIcon={<FilterListIcon />}
                                        sx={{
                                            display: { xs: 'none', sm: 'inline-flex' },
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            textTransform: 'none',
                                            borderColor: '#E8E8E8',
                                            color: '#757575',
                                            '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' },
                                        }}
                                    >
                                        Filters
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        {loading ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="60vh" gap={2}>
                                <CircularProgress size={40} sx={{ color: 'var(--color-primary)' }} data-testid="loading-spinner" />
                                <Typography sx={{ color: '#9E9E9E', fontWeight: 500, fontSize: '0.82rem' }}>Loading products...</Typography>
                            </Box>
                        ) : filteredProducts.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    py: 8,
                                    bgcolor: '#fff',
                                    border: '1px solid #E8E8E8',
                                    borderRadius: '8px',
                                }}
                                data-testid="no-products"
                            >
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(var(--color-primary-rgb), 0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2,
                                    }}
                                >
                                    <ShoppingCartIcon sx={{ fontSize: 28, color: 'var(--color-primary)' }} />
                                </Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#212121', mb: 1 }}>
                                    No products found
                                </Typography>
                                <Typography sx={{ color: '#9E9E9E', mb: 2.5, fontSize: '0.82rem', textAlign: 'center', maxWidth: 360, px: 2 }}>
                                    Try adjusting your filters to find what you&apos;re looking for.
                                </Typography>
                                <Button
                                    onClick={clearFilters}
                                    variant="contained"
                                    sx={{
                                        borderRadius: '6px',
                                        fontWeight: 600,
                                        px: 3,
                                        textTransform: 'none',
                                        boxShadow: 'none',
                                        bgcolor: 'var(--color-primary)',
                                        fontSize: '0.82rem',
                                        '&:hover': { boxShadow: 'none', bgcolor: 'var(--color-button-hover)' },
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </Box>
                        ) : (
                            <ProductGrid
                                products={filteredProducts}
                                handleQuickAdd={handleQuickAdd}
                                viewMode={viewMode}
                            />
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Mobile Filter Drawer */}
            <Drawer
                anchor="left"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{ sx: { width: { xs: '85vw', sm: 320 } } }}
            >
                <Box
                    position="sticky"
                    top={0}
                    bgcolor="white"
                    borderBottom="1px solid"
                    borderColor="grey.200"
                    px={2}
                    py={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    zIndex={1}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <TuneIcon />
                        <Typography variant="h6" fontWeight="bold">Filters</Typography>
                    </Box>
                    <IconButton onClick={() => setFilterDrawerOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={{ overflow: 'auto' }}>
                    <FilterSidebar
                        search={search}
                        setSearch={setSearch}
                        category={category}
                        setCategory={setCategory}
                        categories={categories}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        clearFilters={clearFilters}
                    />
                </Box>
            </Drawer>
        </Box>
    );
}
