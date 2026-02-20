'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import StarIcon from '@mui/icons-material/Star';

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    rating?: number;
    reviews?: unknown[];
    stock?: number;
}

interface ProductCardProps {
    product: Product;
}

/**
 * ProductCard component for displaying product information.
 */
export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Card
            component={Link}
            href={`/products/${product._id}`}
            className="!overflow-hidden hover:!shadow-xl transition transform hover:-translate-y-1 block !no-underline"
            sx={{ borderRadius: 1, border: '1px solid #e5e7eb', textDecoration: 'none' }}
        >
            <Box className="relative">
                <CardMedia
                    component="img"
                    image={product.images[0] || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="!w-full !object-cover"
                    sx={{ aspectRatio: '1' }}
                />
                <Chip
                    label="FEATURED"
                    size="small"
                    className="!absolute !top-2 !left-2"
                    sx={{
                        bgcolor: 'var(--color-accent)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                    }}
                />
            </Box>
            <CardContent>
                <Typography variant="body2" className="!font-semibold !mb-2 line-clamp-2">
                    {product.name}
                </Typography>
                <Box className="flex items-center mb-2">
                    <StarIcon sx={{ fontSize: 16, color: '#eab308', mr: 0.5 }} />
                    <Typography variant="body2" className="text-yellow-500 !text-sm">
                        {product.rating}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500 !ml-2">
                        ({product.reviews?.length || 0})
                    </Typography>
                </Box>
                <Box className="flex items-center justify-between">
                    <Typography variant="body1" className="!font-bold !text-lg" sx={{ color: 'var(--color-primary)' }}>
                        ৳{product.price}
                    </Typography>
                </Box>
                <Typography variant="caption" className="text-gray-500 !mt-1 block">
                    {product.stock && product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </Typography>
            </CardContent>
        </Card>
    );
}
