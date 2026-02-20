'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    Card,
    Box,
    Typography,
    IconButton,
    Chip,
    CardContent,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';

interface CartItemData {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    stock: number;
    images?: string[];
    color?: string;
    size?: string;
}

interface CartItemProps {
    item: CartItemData;
    index: number;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
}

export default function CartItem({ item, index: _index, updateQuantity, removeFromCart }: CartItemProps) {
    const [isRemoving, setIsRemoving] = useState(false);
    const savings = item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0;

    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(() => removeFromCart(item._id), 300);
    };

    return (
        <Card
            component="article"
            elevation={0}
            sx={{
                borderRadius: '8px',
                border: '1px solid #E8E8E8',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                '&:hover': {
                    borderColor: '#D0D0D0',
                },
                opacity: isRemoving ? 0 : 1,
                transform: isRemoving ? 'scale(0.98)' : 'scale(1)',
                bgcolor: '#fff',
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box className="flex gap-3 sm:gap-4 md:gap-6">
                    {/* Product Image */}
                    <Link href={`/products/${item._id}`} className="flex-shrink-0 group relative">
                        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '6px', border: '1px solid #E8E8E8' }}>
                            <img
                                src={item.images?.[0] || 'https://via.placeholder.com/150'}
                                alt={item.name}
                                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-cover"
                            />
                        </Box>
                    </Link>

                    {/* Product Details */}
                    <Box className="flex-1 min-w-0" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.75, sm: 1, md: 1.5 } }}>
                        <Link href={`/products/${item._id}`}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' },
                                    color: 'grey.900',
                                    transition: 'color 0.2s',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    '&:hover': { color: 'var(--color-primary)' },
                                }}
                            >
                                {item.name}
                            </Typography>
                        </Link>

                        {/* Variations */}
                        {(item.color || item.size) && (
                            <Box className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                {item.color && (
                                    <Chip
                                        label={`Color: ${item.color}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                                    />
                                )}
                                {item.size && (
                                    <Chip
                                        label={`Size: ${item.size}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                                    />
                                )}
                            </Box>
                        )}

                        {/* Stock warning */}
                        {item.stock < 10 && item.stock > 0 && (
                            <Chip
                                icon={<WarningIcon sx={{ fontSize: 14 }} />}
                                label={
                                    <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>
                                        Only <strong>{item.stock}</strong> left
                                    </Typography>
                                }
                                sx={{
                                    bgcolor: 'rgba(var(--color-primary-rgb), 0.06)',
                                    border: '1px solid #E8E8E8',
                                    color: 'var(--color-primary)',
                                    borderRadius: '6px',
                                    py: 0.5,
                                    height: 'auto',
                                    '& .MuiChip-label': { whiteSpace: 'normal' },
                                }}
                            />
                        )}

                        {/* Item Total - Mobile */}
                        <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Item Total
                            </Typography>
                            <Box className="flex items-center justify-between mt-1">
                                <Typography variant="h6" fontWeight="bold" color="grey.900">
                                    ৳{(item.price * item.quantity).toFixed(2)}
                                </Typography>
                                {savings > 0 && (
                                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500 }}>
                                        You save ৳{savings.toFixed(2)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Quantity Controls & Actions */}
                        <Box className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 lg:gap-6">
                            <Box className="flex items-center gap-2 md:gap-4 flex-wrap">
                                {/* Quantity Stepper */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: '1px solid #E8E8E8',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        transition: 'border-color 0.2s',
                                        '&:hover': { borderColor: '#D0D0D0' },
                                    }}
                                >
                                    <IconButton
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        aria-label="Decrease quantity"
                                        sx={{
                                            borderRadius: 0,
                                            px: { xs: 1.25, sm: 1.5, md: 2 },
                                            py: { xs: 1, md: 1.25 },
                                            minHeight: 40,
                                            '&:hover': { bgcolor: '#FAFAFA' },
                                        }}
                                    >
                                        <RemoveIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                                    </IconButton>
                                    <Box
                                        sx={{
                                            px: { xs: 2, sm: 2.5, md: 3 },
                                            py: { xs: 0.75, md: 1 },
                                            bgcolor: '#FAFAFA',
                                            borderLeft: '1px solid #E8E8E8',
                                            borderRight: '1px solid #E8E8E8',
                                            minWidth: { xs: 44, sm: 52, md: 60 },
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            fontWeight={700}
                                            sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, color: '#212121' }}
                                        >
                                            {item.quantity}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                        aria-label="Increase quantity"
                                        sx={{
                                            borderRadius: 0,
                                            px: { xs: 1.25, sm: 1.5, md: 2 },
                                            py: { xs: 0.75, md: 1 },
                                            '&:hover': { bgcolor: '#FAFAFA' },
                                        }}
                                    >
                                        <AddIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                                    </IconButton>
                                </Box>

                                {/* Remove Button */}
                                <IconButton
                                    onClick={handleRemove}
                                    aria-label={`Remove ${item.name} from cart`}
                                    sx={{
                                        color: 'error.main',
                                        borderRadius: 2,
                                        px: { xs: 1, sm: 1.5, md: 2 },
                                        py: 1,
                                        '&:hover': { bgcolor: 'error.50', color: 'error.dark' },
                                    }}
                                >
                                    <DeleteIcon sx={{ fontSize: { xs: 18, md: 22 } }} />
                                    <Typography
                                        variant="body2"
                                        fontWeight={500}
                                        sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.5, fontSize: { sm: '0.8rem', md: '0.9rem' } }}
                                    >
                                        Remove
                                    </Typography>
                                </IconButton>
                            </Box>

                            {/* Item Total - Desktop */}
                            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: { md: 0.5 }, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                                    Item Total
                                </Typography>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    sx={{
                                        color: 'grey.900',
                                        fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem', lg: '1.875rem' },
                                    }}
                                >
                                    ৳{(item.price * item.quantity).toFixed(2)}
                                </Typography>
                                {savings > 0 && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'success.main',
                                            fontWeight: 500,
                                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' },
                                        }}
                                    >
                                        You save ৳{savings.toFixed(2)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
