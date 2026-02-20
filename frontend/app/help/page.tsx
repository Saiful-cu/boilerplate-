'use client';

import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const faqs = [
    {
        category: 'Orders & Shipping',
        icon: <LocalShippingIcon />,
        questions: [
            {
                q: 'How can I track my order?',
                a: 'You can track your order by visiting the "Track Order" page and entering your order ID. You can find your order ID in the order confirmation email or in your "My Orders" section.',
            },
            {
                q: 'How long does shipping take?',
                a: 'Standard shipping typically takes 3-7 business days depending on your location. Express shipping options may be available at checkout for faster delivery.',
            },
            {
                q: 'What are the shipping charges?',
                a: 'We offer free shipping on orders above a certain threshold. For orders below that amount, a flat shipping fee will be applied at checkout.',
            },
            {
                q: 'Can I change my shipping address after placing an order?',
                a: 'If your order has not been shipped yet, please contact our support team immediately and we will try to update your shipping address.',
            },
        ],
    },
    {
        category: 'Payment',
        icon: <PaymentIcon />,
        questions: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept Cash on Delivery (COD). Additional payment methods like mobile banking and card payments may be available depending on your location.',
            },
            {
                q: 'Is my payment information secure?',
                a: 'Yes, we use industry-standard encryption to protect your payment information. Your data is always transmitted securely.',
            },
        ],
    },
    {
        category: 'Returns & Refunds',
        icon: <AssignmentReturnIcon />,
        questions: [
            {
                q: 'What is your return policy?',
                a: 'We accept returns within 7 days of delivery for most products. Items must be in their original condition with tags attached. Please check individual product pages for specific return policies.',
            },
            {
                q: 'How do I request a refund?',
                a: 'To request a refund, go to "My Orders", find the relevant order, and contact our support team. Refunds are typically processed within 5-10 business days after the returned item is received.',
            },
            {
                q: 'Can I exchange a product?',
                a: 'Yes, you can exchange products for a different size or color, subject to availability. Please contact our support team to arrange an exchange.',
            },
        ],
    },
    {
        category: 'Account & General',
        icon: <HelpOutlineIcon />,
        questions: [
            {
                q: 'How do I create an account?',
                a: 'Click the "Sign Up" button in the top right corner of the page. Fill in your name, email, and password to create your account.',
            },
            {
                q: 'How do I reset my password?',
                a: 'Click "Login" and then "Forgot Password". Enter your registered email address and we will send you a password reset link.',
            },
            {
                q: 'How can I contact customer support?',
                a: 'You can reach us through the WhatsApp button on our website, or email us at the address listed in the footer. Our support team typically responds within 24 hours.',
            },
        ],
    },
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = faqs
        .map((cat) => ({
            ...cat,
            questions: cat.questions.filter(
                (q) =>
                    q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.a.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((cat) => cat.questions.length > 0);

    return (
        <Box className="bg-gray-50" minHeight="100vh" py={{ xs: 4, sm: 6 }}>
            <Box className="container mx-auto" px={2} maxWidth="md" sx={{ maxWidth: '48rem' }}>
                {/* Header */}
                <Box textAlign="center" mb={{ xs: 3, sm: 5 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            p: 2,
                            borderRadius: '50%',
                            bgcolor: 'var(--color-primary)',
                            color: 'white',
                            mb: 2,
                        }}
                    >
                        <SupportAgentIcon sx={{ fontSize: { xs: 36, sm: 48 } }} />
                    </Box>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        mb={1}
                        sx={{ color: 'var(--color-primary)', fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}
                    >
                        Help Center
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        Find answers to common questions or reach out to our support team
                    </Typography>
                </Box>

                {/* Search */}
                <Paper elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3, py: 0.5 },
                            },
                        }}
                    />
                </Paper>

                {/* FAQ Categories */}
                {filteredFaqs.length === 0 ? (
                    <Paper elevation={1} sx={{ textAlign: 'center', py: 6, borderRadius: 3 }}>
                        <Typography fontSize="3rem" mb={2}>🔍</Typography>
                        <Typography variant="h6" fontWeight={600} mb={1}>No results found</Typography>
                        <Typography color="text.secondary" mb={2}>
                            Try different keywords or contact our support team
                        </Typography>
                    </Paper>
                ) : (
                    filteredFaqs.map((category) => (
                        <Box key={category.category} mb={3}>
                            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                <Box sx={{ color: 'var(--color-primary)' }}>{category.icon}</Box>
                                <Typography variant="h6" fontWeight={700} fontSize={{ xs: '1rem', sm: '1.25rem' }}>
                                    {category.category}
                                </Typography>
                            </Box>
                            {category.questions.map((faq, idx) => (
                                <Accordion
                                    key={idx}
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'grey.200',
                                        borderRadius: '12px !important',
                                        mb: 1.5,
                                        '&:before': { display: 'none' },
                                        overflow: 'hidden',
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            minHeight: 56,
                                            '&:hover': { bgcolor: 'grey.50' },
                                            px: { xs: 2, sm: 3 },
                                        }}
                                    >
                                        <Typography fontWeight={600} fontSize={{ xs: '0.875rem', sm: '1rem' }}>
                                            {faq.q}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 2.5, pt: 0 }}>
                                        <Typography color="text.secondary" fontSize={{ xs: '0.85rem', sm: '0.95rem' }} lineHeight={1.7}>
                                            {faq.a}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    ))
                )}

                {/* Contact Section */}
                <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, mt: 4, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700} mb={1} fontSize={{ xs: '1rem', sm: '1.25rem' }}>
                        Still need help?
                    </Typography>
                    <Typography color="text.secondary" mb={3} fontSize={{ xs: '0.85rem', sm: '0.95rem' }}>
                        Our support team is ready to assist you
                    </Typography>
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center">
                        <Button
                            component={Link}
                            href="/track-order"
                            variant="outlined"
                            startIcon={<LocalShippingIcon />}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minHeight: 48 }}
                        >
                            Track Order
                        </Button>
                        <Button
                            component={Link}
                            href="/orders"
                            variant="contained"
                            startIcon={<SupportAgentIcon />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                fontWeight: 600,
                                minHeight: 48,
                                bgcolor: 'var(--color-primary)',
                                '&:hover': { bgcolor: 'var(--color-primary)', filter: 'brightness(0.9)' },
                            }}
                        >
                            My Orders
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
