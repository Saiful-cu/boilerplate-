'use client';

import React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';

interface PromoCard {
    title: string;
    subtitle: string;
    link: string;
    gradient: string;
    image?: string;
}

interface PromotionalCardsConfig {
    cards?: PromoCard[];
}

interface PromotionalCardsProps {
    title?: string;
    config?: PromotionalCardsConfig;
}

const PromotionalCards: React.FC<PromotionalCardsProps> = ({ title, config = {} }) => {
    const cards: PromoCard[] = config.cards || [
        {
            title: 'Best Deals',
            subtitle: 'Save up to 50% off',
            link: '/products?onSale=true',
            gradient: 'from-blue-400 to-blue-600',
        },
        {
            title: 'New Arrivals',
            subtitle: "Check out what's new",
            link: '/products?sort=-createdAt',
            gradient: 'from-green-400 to-blue-500',
        },
    ];

    return (
        <Box component="section" className="py-12">
            <Box className="container mx-auto px-4">
                {title && (
                    <Box className="text-center mb-8">
                        <Typography variant="h4" component="h2" className="!font-bold !mb-2">
                            {title}
                        </Typography>
                        <Box className="w-20 h-1 bg-accent mx-auto" />
                    </Box>
                )}

                <Grid container spacing={3}>
                    {cards.map((card, index) => (
                        <Grid size={{ xs: 12, md: 6 }} key={index}>
                            <Card
                                component={Link}
                                href={card.link}
                                className="group relative !h-96 !rounded-lg !overflow-hidden block !no-underline"
                                sx={{ textDecoration: 'none' }}
                            >
                                <Box
                                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90 group-hover:opacity-100 transition`}
                                />
                                {card.image && (
                                    <CardMedia
                                        component="img"
                                        image={card.image}
                                        alt={card.title}
                                        className="absolute inset-0 !w-full !h-full !object-cover mix-blend-overlay"
                                    />
                                )}
                                <Box className="relative h-full flex flex-col items-center justify-center text-white p-8 text-center">
                                    <Typography variant="h3" component="h3" className="!font-bold !mb-3 !text-4xl">
                                        {card.title}
                                    </Typography>
                                    <Typography variant="h6" className="!mb-6 !text-xl">
                                        {card.subtitle}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        className="!rounded-lg transition"
                                        sx={{
                                            bgcolor: '#fff',
                                            color: '#111827',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#f3f4f6' },
                                        }}
                                    >
                                        Shop Now
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default PromotionalCards;
