'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

function BkashResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const trxID = searchParams.get('trxID');
    const amount = searchParams.get('amount');
    const message = searchParams.get('message');

    const isSuccess = status === 'success';
    const isCancelled = status === 'cancelled';
    const isFailed = status === 'failed';
    const isError = status === 'error';

    // Auto-redirect to orders page after success
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;

        if (isSuccess && countdown > 0) {
            timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        } else if (isSuccess && countdown === 0) {
            router.push('/orders');
        }

        // always return a cleanup function (avoids inconsistent return paths)
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isSuccess, countdown, router]);

    const getStatusConfig = () => {
        if (isSuccess) {
            return {
                icon: <CheckCircleIcon sx={{ fontSize: 64, color: '#16a34a' }} />,
                title: 'Payment Successful!',
                subtitle: 'Your bKash payment has been confirmed',
                bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderColor: '#86efac',
                chipColor: '#16a34a',
                chipBg: '#dcfce7',
                chipLabel: 'Paid',
            };
        }
        if (isCancelled) {
            return {
                icon: <CancelOutlinedIcon sx={{ fontSize: 64, color: '#d97706' }} />,
                title: 'Payment Cancelled',
                subtitle: 'You cancelled the bKash payment',
                bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                borderColor: '#fde68a',
                chipColor: '#d97706',
                chipBg: '#fef3c7',
                chipLabel: 'Cancelled',
            };
        }
        return {
            icon: <ErrorOutlineIcon sx={{ fontSize: 64, color: '#dc2626' }} />,
            title: isFailed ? 'Payment Failed' : 'Payment Error',
            subtitle: message || 'Something went wrong with your bKash payment',
            bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
            borderColor: '#fca5a5',
            chipColor: '#dc2626',
            chipBg: '#fee2e2',
            chipLabel: 'Failed',
        };
    };

    const config = getStatusConfig();

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            px={2}
            py={4}
            sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
        >
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 480,
                    width: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: config.borderColor,
                }}
            >
                {/* Status Header */}
                <Box
                    sx={{
                        background: config.bgGradient,
                        p: { xs: 4, sm: 5 },
                        textAlign: 'center',
                    }}
                >
                    {config.icon}
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 2, mb: 0.5 }}>
                        {config.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {config.subtitle}
                    </Typography>
                </Box>

                {/* Details */}
                <Box sx={{ p: { xs: 3, sm: 4 } }}>
                    {isSuccess && (
                        <>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    mb: 3,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                {trxID && (
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Transaction ID
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} sx={{ color: '#E2136E' }}>
                                            {trxID}
                                        </Typography>
                                    </Box>
                                )}
                                {orderId && (
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Order ID
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                                            {orderId.slice(-8).toUpperCase()}
                                        </Typography>
                                    </Box>
                                )}
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={config.chipLabel}
                                        size="small"
                                        sx={{
                                            bgcolor: config.chipBg,
                                            color: config.chipColor,
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                </Box>
                                {amount && (
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Amount Paid
                                        </Typography>
                                        <Typography variant="body1" fontWeight={800} sx={{ color: '#16a34a' }}>
                                            ৳{parseFloat(amount).toFixed(2)}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                textAlign="center"
                                display="block"
                                mb={2}
                            >
                                Redirecting to your orders in {countdown}s...
                            </Typography>
                        </>
                    )}

                    {(isFailed || isError) && orderId && (
                        <Box
                            sx={{
                                mb: 3,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: '#fef2f2',
                                border: '1px solid #fecaca',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                Your order has been created but payment was not completed.
                                You can retry payment from your orders page.
                            </Typography>
                        </Box>
                    )}

                    {isCancelled && (
                        <Box
                            sx={{
                                mb: 3,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: '#fffbeb',
                                border: '1px solid #fde68a',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary" display="block">
                                Your order is saved. You can retry bKash payment from your orders page,
                                or contact support for assistance.
                            </Typography>
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Box display="flex" flexDirection="column" gap={1.5}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<ShoppingBagOutlinedIcon />}
                            onClick={() => router.push('/orders')}
                            sx={{
                                borderRadius: 2.5,
                                fontWeight: 700,
                                textTransform: 'none',
                                py: 1.25,
                                bgcolor: isSuccess ? '#16a34a' : '#E2136E',
                                '&:hover': { bgcolor: isSuccess ? '#15803d' : '#c01162' },
                            }}
                        >
                            View My Orders
                        </Button>

                        {(isFailed || isCancelled || isError) && (
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                startIcon={<RefreshIcon />}
                                onClick={() => router.push('/checkout')}
                                sx={{
                                    borderRadius: 2.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    py: 1.25,
                                    borderColor: '#E2136E',
                                    color: '#E2136E',
                                    '&:hover': { borderColor: '#c01162', bgcolor: '#fdf2f8' },
                                }}
                            >
                                Try Again
                            </Button>
                        )}

                        <Button
                            variant="text"
                            size="small"
                            startIcon={<HomeIcon sx={{ fontSize: 16 }} />}
                            onClick={() => router.push('/')}
                            sx={{
                                color: 'text.secondary',
                                textTransform: 'none',
                                fontWeight: 500,
                            }}
                        >
                            Back to Home
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default function BkashResultPage() {
    return (
        <Suspense
            fallback={
                <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
                    <CircularProgress />
                </Box>
            }
        >
            <BkashResultContent />
        </Suspense>
    );
}
