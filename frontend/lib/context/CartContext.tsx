'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    images?: string[];
    stock?: number;
    [key: string]: any;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: any, quantity: number = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item._id === product._id);
            if (existingItem) {
                // use a stable id so duplicate calls won't show the same toast twice
                toast.success(`Updated ${product.name} quantity in cart!`, { id: `cart-update-${product._id}` });
                return prevCart.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // prevent duplicate 'added' toasts by reusing an id per product
            toast.success(`${product.name} added to cart!`, { id: `cart-add-${product._id}` });
            return [...prevCart, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => {
            const item = prevCart.find((item) => item._id === productId);
            if (item) {
                toast.success(`${item.name} removed from cart`);
            }
            return prevCart.filter((item) => item._id !== productId);
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item._id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        toast.success('Cart cleared');
    };

    const getCartTotal = (): number => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = (): number => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
