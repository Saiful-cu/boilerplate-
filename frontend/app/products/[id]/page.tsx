'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import api from '@/lib/api';
import { LoadingSpinner, EmptyState } from '@/components/shared/UIComponents';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import {
    ColorSelector,
    SizeSelector,
    ProductImageGallery,
    ProductInfo,
    QuantitySelector,
    ProductActionButtons,
} from '@/components/product-detail';
import { getColorHex, isLightColor } from '@/lib/colorHelpers';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface ColorObj {
    name: string;
    image?: string;
}

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    images: string[];
    colors?: (string | ColorObj)[];
    sizes?: string[];
    stock: number;
    rating: number;
    numReviews: number;
    brand?: string;
    modelNumber?: string;
    weight?: string;
    volume?: string;
    placeOfOrigin?: string;
    features?: string[];
}

export default function ProductDetail() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [searchParams] = [useSearchParams()];
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [_canReview, setCanReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [eligibleOrder, setEligibleOrder] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [openPurchaseModal, setOpenPurchaseModal] = useState(false);

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);

        if (searchParams.get('review') === 'true') {
            setActiveTab(2);
            setShowReviewForm(true);
        }
    }, [id, searchParams]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            const productData = response.data.data || response.data;
            setProduct(productData);
            if (productData.colors?.length > 0) {
                const firstColor =
                    typeof productData.colors[0] === 'string'
                        ? productData.colors[0]
                        : productData.colors[0].name;
                setSelectedColor(firstColor);
            }
            if (productData.sizes?.length > 0) {
                setSelectedSize(productData.sizes[0]);
            }
            await checkReviewEligibility();
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkReviewEligibility = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setReviewMessage('Please login to write a review');
                return;
            }

            const { data } = await api.get(`/reviews/can-review/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setCanReview(data.canReview);
            setEligibleOrder(data.orderId);
            if (!data.canReview && data.message) {
                setReviewMessage(data.message);
            }
        } catch (error) {
            console.error('Error checking review eligibility:', error);
            setReviewMessage('Unable to check review eligibility');
        }
    };

    const handleAddToCart = () => {
        if (product) {
            const cartItem = {
                ...product,
                quantity,
                selectedColor,
                selectedSize,
            };
            addToCart(cartItem, quantity);
        }
    };

    const handleBuyNow = () => {
        if (product) {
            handleAddToCart();
            router.push('/cart');
        }
    };

    const handleReviewSuccess = async () => {
        setShowReviewForm(false);
        setCanReview(false);
        setReviewMessage(
            '✅ Thank you for your review! Your review has been submitted and is pending admin approval. It will be visible on the product page once approved.'
        );
        await fetchProduct();
        await checkReviewEligibility();
    };

    const getCurrentColorImage = (): string[] => {
        if (!product) return ['https://via.placeholder.com/600'];
        if (selectedColor && product.colors?.length) {
            const colorObj = product.colors.find(
                (c) => (typeof c === 'string' ? c : c.name) === selectedColor
            );
            if (colorObj && typeof colorObj === 'object' && colorObj.image) {
                return [colorObj.image];
            }
        }
        return product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600'];
    };

    if (loading) {
        return <LoadingSpinner size="lg" testId="product-detail-loading" />;
    }

    if (!product) {
        return (
            <Box className="container mx-auto px-4 py-20">
                <EmptyState
                    icon="🚫"
                    title="Product not found"
                    description="The product you're looking for doesn't exist"
                    actionText="← Back to Products"
                    onAction={() => router.push('/products')}
                    testId="product-not-found"
                />
            </Box>
        );
    }

    const images = getCurrentColorImage();

    /* Specs for the inline row */
    const specsPreview = [
        product.brand && `Brand`,
        product.weight && `Weight`,
        product.volume && `Volume`,
        product.placeOfOrigin && `Origin`,
    ].filter(Boolean).join(', ');

    return (
        <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh' }} pb={{ xs: 14, lg: 3 }} data-testid="product-detail-page">
            {/* Brand stripe */}
            <Box sx={{ height: 3, bgcolor: 'var(--color-primary)' }} />
            {/* ===== DESKTOP: side-by-side ===== */}
            <Box display={{ xs: 'none', lg: 'block' }}>
                <Box className="container mx-auto" px={2} py={3} sx={{ maxWidth: '80rem' }}>
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        sx={{ mb: 3, overflowX: 'auto', whiteSpace: 'nowrap', pb: 1, '& .MuiBreadcrumbs-separator': { color: '#D0D0D0' } }}
                    >
                        <MuiLink component={Link} href="/" underline="hover" sx={{ color: '#9E9E9E', fontSize: '0.82rem' }}>Home</MuiLink>
                        <MuiLink component={Link} href="/products" underline="hover" sx={{ color: '#9E9E9E', fontSize: '0.82rem' }}>Products</MuiLink>
                        {product.category && <Typography sx={{ color: '#212121', fontWeight: 500, fontSize: '0.82rem' }} noWrap>{product.category}</Typography>}
                    </Breadcrumbs>
                    <Box display="grid" gridTemplateColumns="3fr 2fr" gap={6}>
                        <Box>
                            <ProductImageGallery images={images} productName={product.name} />
                        </Box>
                        <Box>
                            <Box sx={{ position: 'sticky', top: '84px', alignSelf: 'start' }}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid #E8E8E8', bgcolor: '#fff', minWidth: 320 }}>
                                    <ProductInfo product={product} />
                                    <Divider sx={{ my: 2 }} />
                                    <ColorSelector colors={product.colors || []} selectedColor={selectedColor} onColorChange={setSelectedColor} getColorHex={getColorHex} isLightColor={isLightColor} />
                                    <SizeSelector sizes={product.sizes || []} selectedSize={selectedSize} onSizeChange={setSelectedSize} />
                                    <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} maxStock={product.stock} />
                                    <Box pt={2}>
                                        <ProductActionButtons onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} isOutOfStock={product.stock === 0} isMobile={false} />
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ===== MOBILE: Daraz-style single column ===== */}
            <Box display={{ xs: 'block', lg: 'none' }}>
                {/* Image Gallery — full bleed */}
                <ProductImageGallery images={images} productName={product.name} />

                {/* Price / Name / Rating card */}
                <Box px={2} py={2} sx={{ bgcolor: '#fff' }}>
                    <ProductInfo product={product} />
                </Box>

                <Divider />

                {/* Product Options row (Daraz style) */}
                {((product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0)) && (
                    <>
                        <Box
                            onClick={() => setOpenPurchaseModal(true)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 2, py: 1.5,
                                cursor: 'pointer',
                                '&:active': { bgcolor: 'grey.100' },
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', fontWeight: 500, flexShrink: 0 }}>Product Options</Typography>
                                {/* Color preview thumbnail */}
                                {selectedColor && (() => {
                                    const colorObj = product.colors?.find(
                                        (c) => (typeof c === 'string' ? c : c.name) === selectedColor
                                    );
                                    const colorImage = colorObj && typeof colorObj === 'object' ? colorObj.image : null;
                                    const colorHex = getColorHex(selectedColor);
                                    return (
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                border: '2px solid',
                                                borderColor: 'grey.300',
                                                overflow: 'hidden',
                                                bgcolor: colorHex || '#f3f4f6',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {colorImage && (
                                                <img src={colorImage} alt={selectedColor} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                        </Box>
                                    );
                                })()}
                                <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', fontWeight: 600 }} noWrap>
                                    {[selectedColor, selectedSize].filter(Boolean).join(', ') || 'Select'}
                                </Typography>
                            </Box>
                            <ChevronRightIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                        </Box>
                        <Divider />
                    </>
                )}

                {/* Specifications preview row (Daraz style) */}
                {specsPreview && (
                    <>
                        <Box
                            onClick={() => setActiveTab(1)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 2, py: 1.5,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'grey.50' },
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', fontWeight: 500 }}>Specifications</Typography>
                                <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled' }} noWrap>{specsPreview}</Typography>
                            </Box>
                            <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </Box>
                        <Divider />
                    </>
                )}

                {/* Quantity (inline on mobile) */}
                <Box px={2} py={1.5}>
                    <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} maxStock={product.stock} />
                </Box>
                <Divider />
            </Box>

            {/* Product Details Tabs */}
            <Box mt={{ xs: 2, sm: 6 }} px={{ xs: 0, lg: 2 }}>
                <Box className="container mx-auto" sx={{ maxWidth: '80rem' }}>
                    <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #E8E8E8', bgcolor: '#fff', overflow: 'hidden' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, newVal) => setActiveTab(newVal)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                borderBottom: '1px solid #E8E8E8',
                                '& .MuiTab-root': {
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: { xs: '0.82rem', sm: '0.9rem' },
                                    px: 3,
                                    py: 1.5,
                                    color: '#9E9E9E',
                                    '&.Mui-selected': { color: 'var(--color-primary)' },
                                },
                                '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' },
                            }}
                        >
                            <Tab label="Description" />
                            <Tab label="Specifications" />
                            <Tab
                                label={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <span>Customer Reviews</span>
                                        {product.numReviews > 0 && (
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <Chip
                                                    label={product.numReviews}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'var(--color-accent)',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.75rem',
                                                        height: 22,
                                                    }}
                                                />
                                                <Box display="flex" alignItems="center" gap={0.25} color="warning.main">
                                                    <StarIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {product.rating.toFixed(1)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                }
                            />
                        </Tabs>

                        <Box p={3}>
                            {activeTab === 0 && product.description && (
                                <Typography color="text.secondary" lineHeight={1.8}>
                                    {product.description}
                                </Typography>
                            )}

                            {activeTab === 1 && (
                                <Box>
                                    {[
                                        { label: 'Brand', value: product.brand },
                                        { label: 'Model', value: product.modelNumber },
                                        { label: 'Weight', value: product.weight },
                                        { label: 'Volume', value: product.volume },
                                        { label: 'Origin', value: product.placeOfOrigin },
                                    ]
                                        .filter((spec) => spec.value)
                                        .map((spec, idx) => (
                                            <Box key={idx}>
                                                <Box display="flex" gap={2} py={1.5}>
                                                    <Typography fontWeight={600} color="text.secondary" minWidth={120}>
                                                        {spec.label}:
                                                    </Typography>
                                                    <Typography color="text.secondary">{spec.value}</Typography>
                                                </Box>
                                                <Divider />
                                            </Box>
                                        ))}
                                    {!product.brand && !product.modelNumber && !product.weight && !product.volume && !product.placeOfOrigin && (
                                        <Typography color="text.secondary" textAlign="center" py={4}>
                                            No specifications available
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {activeTab === 2 && id && (
                                <Box>
                                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2} mb={2}>
                                        <Box flex={1}>
                                            {reviewMessage && (
                                                <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                                                    {reviewMessage}
                                                </Typography>
                                            )}
                                        </Box>
                                        {_canReview && (
                                            <Button
                                                onClick={() => setShowReviewForm(true)}
                                                variant="contained"
                                                sx={{ borderRadius: '6px', whiteSpace: 'nowrap', boxShadow: 'none', bgcolor: 'var(--color-primary)', fontSize: '0.82rem', textTransform: 'none', '&:hover': { boxShadow: 'none', bgcolor: 'var(--color-button-hover)' } }}
                                            >
                                                Write a Review
                                            </Button>
                                        )}
                                    </Box>
                                    <ReviewList productId={id} />
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    {/* Features Section */}
                    {product.features && product.features.length > 0 && (
                        <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #E8E8E8', bgcolor: '#fff', p: 3, mt: 3 }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                <Box width={4} height={24} borderRadius={1} bgcolor="var(--color-primary)" />
                                <Typography variant="h6" fontWeight="bold">Key Features</Typography>
                            </Box>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                {product.features.map((feature, idx) => (
                                    <Box
                                        key={idx}
                                        display="flex"
                                        alignItems="flex-start"
                                        gap={1.5}
                                        p={1.5}
                                        bgcolor="#FAFAFA"
                                        borderRadius="6px"
                                        border="1px solid #E8E8E8"
                                    >
                                        <CheckCircleIcon sx={{ color: 'var(--color-secondary)', fontSize: 20, mt: 0.25 }} />
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            {feature}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}
                </Box>

                {/* Related Products */}
                <Box mt={{ xs: 4, sm: 6 }} px={{ xs: 2, lg: 0 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={{ xs: 2, sm: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem' }, color: '#212121', fontFamily: 'var(--font-heading)' }}>
                            You May Also Like
                        </Typography>
                        <Button
                            component={Link}
                            href="/products"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.82rem', color: 'var(--color-primary)' }}
                        >
                            <Box component="span" display={{ xs: 'none', sm: 'inline' }}>View All</Box>
                            <Box component="span" display={{ xs: 'inline', sm: 'none' }}>All</Box>
                        </Button>
                    </Box>
                    <Box display="grid" gridTemplateColumns={{ xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={{ xs: 1.5, sm: 2 }}>
                        {[1, 2, 3, 4].map((item) => (
                            <Box
                                key={item}
                                sx={{
                                    borderRadius: '8px',
                                    border: '1px solid #E8E8E8',
                                    bgcolor: '#fff',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: '#D0D0D0' },
                                }}
                            >
                                <Box
                                    sx={{
                                        aspectRatio: '1',
                                        bgcolor: '#F0F0F0',
                                    }}
                                />
                                <Box p={{ xs: 1.5, sm: 2 }}>
                                    <Typography fontWeight={600} fontSize={{ xs: '0.82rem', sm: '0.9rem' }} noWrap mb={0.5} sx={{ color: '#212121' }}>
                                        Related Product {item}
                                    </Typography>
                                    <Typography fontWeight={700} fontSize={{ xs: '0.9rem', sm: '1rem' }} sx={{ color: 'var(--color-primary)' }}>
                                        ৳ {product.price?.toFixed(0)}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Sticky Mobile Bottom Bar - Daraz style */}
            <Paper
                elevation={0}
                sx={{
                    display: { xs: 'flex', lg: 'none' },
                    position: 'fixed',
                    bottom: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' },
                    left: 0,
                    right: 0,
                    borderTop: '1px solid #E8E8E8',
                    zIndex: 1400,
                    bgcolor: '#fff',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                }}
            >
                {/* Store icon */}
                <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 1.5, py: 0.75, borderRight: '1px solid #E8E8E8', cursor: 'pointer', '&:hover': { bgcolor: '#FAFAFA' } }}
                >
                    <StorefrontIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', mt: 0.25 }}>Store</Typography>
                </Box>
                {/* Chat icon */}
                <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 1.5, py: 0.75, borderRight: '1px solid #E8E8E8', cursor: 'pointer', '&:hover': { bgcolor: '#FAFAFA' } }}
                >
                    <ChatBubbleOutlineIcon sx={{ fontSize: 20, color: '#9E9E9E' }} />
                    <Typography sx={{ fontSize: '0.6rem', color: '#9E9E9E', mt: 0.25 }}>Chat</Typography>
                </Box>
                {/* Buy Now + Add to Cart */}
                <Box sx={{ flex: 1, display: 'flex' }}>
                    <ProductActionButtons
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        isOutOfStock={product.stock === 0}
                        isMobile={true}
                    />
                </Box>
            </Paper>

            {/* Product Options Bottom Drawer (Daraz style) */}
            <Drawer
                anchor="bottom"
                open={openPurchaseModal}
                onClose={() => setOpenPurchaseModal(false)}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        maxHeight: '85vh',
                        overflow: 'auto',
                    },
                }}
            >
                {/* Drag handle */}
                <Box display="flex" justifyContent="center" pt={1} pb={0.5}>
                    <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'grey.300' }} />
                </Box>

                {/* Header: product image + price + close */}
                <Box display="flex" alignItems="flex-start" gap={2} px={2} pb={2}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'grey.200',
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src={images[0]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Box>
                    <Box flex={1} minWidth={0}>
                        <Typography
                            fontWeight={800}
                            sx={{ color: 'var(--color-primary)', fontSize: '1.5rem', lineHeight: 1 }}
                        >
                            \u09f3 {product.price?.toFixed(0)}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Stock: {product.stock}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setOpenPurchaseModal(false)}
                        size="small"
                        sx={{ mt: -0.5 }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Divider />

                {/* Color selector */}
                {product.colors && product.colors.length > 0 && (
                    <Box px={2} py={2}>
                        <ColorSelector
                            colors={product.colors}
                            selectedColor={selectedColor}
                            onColorChange={setSelectedColor}
                            getColorHex={getColorHex}
                            isLightColor={isLightColor}
                        />
                    </Box>
                )}

                {/* Size selector */}
                {product.sizes && product.sizes.length > 0 && (
                    <Box px={2} pb={2}>
                        <SizeSelector
                            sizes={product.sizes}
                            selectedSize={selectedSize}
                            onSizeChange={setSelectedSize}
                        />
                    </Box>
                )}

                {/* Quantity */}
                <Box px={2} pb={2}>
                    <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} maxStock={product.stock} />
                </Box>

                {/* Confirm button */}
                <Box px={2} pb={3}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => setOpenPurchaseModal(false)}
                        sx={{
                            py: 1.5,
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            boxShadow: 'none',
                            bgcolor: 'var(--color-primary)',
                            '&:hover': { bgcolor: 'var(--color-button-hover)', boxShadow: 'none' },
                        }}
                    >
                        Confirm
                    </Button>
                </Box>
            </Drawer>

            {/* Review Form Modal */}
            {showReviewForm && eligibleOrder && (
                <ReviewForm
                    productId={id}
                    orderId={eligibleOrder}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setShowReviewForm(false)}
                />
            )}
        </Box>
    );
}
