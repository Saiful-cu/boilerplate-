'use client';

/**
 * Cart Page
 * Simple shopping cart for local sellers
 */
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { CartItem, OrderSummary, EmptyCart } from '@/components/cart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function CartPage() {
    const router = useRouter();
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

    if (cart.length === 0) {
        return <EmptyCart />;
    }

    const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }} data-testid="cart-page">
            {/* Brand stripe */}
            <Box sx={{ height: 3, bgcolor: 'var(--color-primary)' }} />

            <Box className="container mx-auto" sx={{ maxWidth: '80rem' }} px={{ xs: 1.5, sm: 2 }} py={{ xs: 2, sm: 3 }}>
                {/* Clean Header */}
                <Box
                    mb={{ xs: 2, sm: 3 }}
                    sx={{
                        bgcolor: '#fff',
                        border: '1px solid #E8E8E8',
                        borderRadius: '8px',
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1.5, sm: 2 },
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                bgcolor: 'rgba(var(--color-primary-rgb), 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ShoppingCartIcon sx={{ fontSize: 18, color: 'var(--color-primary)' }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1rem', sm: '1.15rem' },
                                    color: '#212121',
                                    fontFamily: 'var(--font-heading)',
                                }}
                                data-testid="cart-title"
                            >
                                Shopping Cart
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>
                                {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for checkout
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '2fr 1fr' }} gap={{ xs: 2, sm: 3 }} alignItems="start">
                    {/* Cart Items Section */}
                    <Box>
                        <Box component="section" aria-label="Cart items" data-testid="cart-items-section" display="flex" flexDirection="column" gap={{ xs: 1.5, sm: 2 }}>
                            {cart.map((item: any, index: number) => (
                                <CartItem
                                    key={item._id}
                                    item={item}
                                    index={index}
                                    updateQuantity={updateQuantity}
                                    removeFromCart={removeFromCart}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Order Summary Sidebar */}
                    <Box sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
                        <OrderSummary
                            cart={cart}
                            getCartTotal={getCartTotal}
                            onCheckout={(appliedPromo: any) => {
                                // Store promo code data in sessionStorage for checkout page
                                if (appliedPromo) {
                                    sessionStorage.setItem('appliedPromo', JSON.stringify(appliedPromo));
                                }
                                router.push('/checkout');
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
