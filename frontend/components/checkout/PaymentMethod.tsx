'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface PaymentMethodProps {
    value: string;
    onChange: (method: string) => void;
    totalAmount?: number;
    bkashEnabled?: boolean; // frontend can hide/disable bKash when backend says it's unavailable
}

const paymentOptions = [
    {
        id: 'cash_on_delivery',
        label: 'Cash on Delivery',
        description: 'Pay when your order arrives',
        icon: '💵',
        color: '#f59e0b',
        bgLight: '#fefce8',
        borderLight: '#fef08a',
    },
    {
        id: 'bkash',
        label: 'bKash',
        description: 'Pay securely via bKash gateway',
        icon: '',
        color: '#E2136E',
        bgLight: '#fdf2f8',
        borderLight: '#fbcfe8',
        isBkash: true,
    },
];

export default function PaymentMethod({ value, onChange, totalAmount = 0, bkashEnabled = false }: PaymentMethodProps) {
    return (
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'rgba(var(--color-primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PaymentIcon sx={{ fontSize: 15, color: 'var(--color-primary)' }} />
                </Box>
                <Box flex={1}>
                    <Typography fontWeight={700} sx={{ fontSize: '0.9rem', color: '#212121' }} component="legend">
                        Payment Method
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.72rem' }}>
                        Choose how you want to pay
                    </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 20, color: '#4CAF50' }} />
            </Box>

            {/* Payment Options */}
            <Box display="flex" flexDirection="column" gap={1}>
                {paymentOptions.map((option) => {
                    const isSelected = value === option.id;
                    const isDisabled = !!(option.isBkash && !bkashEnabled);

                    const handleClick = () => {
                        if (!isDisabled) onChange(option.id);
                    };

                    return (
                        <Box key={option.id}>
                            <Box
                                onClick={handleClick}
                                sx={{
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: isSelected ? (option.isBkash ? '#E2136E' : 'var(--color-primary)') : '#E8E8E8',
                                    bgcolor: isSelected ? option.bgLight : '#FAFAFA',
                                    overflow: 'hidden',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isDisabled ? 0.6 : 1,
                                    transition: 'all 0.15s ease',
                                    pointerEvents: isDisabled ? 'none' : 'auto',
                                    '&:hover': {
                                        borderColor: isSelected
                                            ? (option.isBkash ? '#E2136E' : 'var(--color-primary)')
                                            : '#BDBDBD',
                                    },
                                }}
                            >
                                <Box sx={{ px: 2, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {/* Radio */}
                                    <Box sx={{
                                        width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                                        borderColor: isSelected ? (option.isBkash ? '#E2136E' : 'var(--color-primary)') : '#BDBDBD',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
                                    }}>
                                        {isSelected && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: option.isBkash ? '#E2136E' : 'var(--color-primary)' }} />}
                                    </Box>

                                    {/* Icon */}
                                    <Box sx={{
                                        width: 42, height: 42, borderRadius: '6px',
                                        bgcolor: option.isBkash ? (isSelected ? '#E2136E' : '#fce7f3') : (isSelected ? 'rgba(var(--color-primary-rgb), 0.08)' : '#F0F0F0'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: option.isBkash ? '0.8rem' : '1.35rem', flexShrink: 0, fontWeight: 800,
                                        color: option.isBkash ? (isSelected ? 'white' : '#E2136E') : 'inherit', transition: 'all 0.15s',
                                    }}>
                                        {option.isBkash ? 'b' : option.icon}
                                        {option.isBkash && (
                                            <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.8rem', color: option.isBkash ? (isSelected ? 'white' : '#E2136E') : 'inherit' }}>
                                                Kash
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Content */}
                                    <Box flex={1}>
                                        <Box display="flex" alignItems="center" gap={0.75} mb={0.25}>
                                            <Typography fontWeight={600} variant="body2" sx={{ color: isSelected ? (option.isBkash ? '#E2136E' : 'var(--color-primary)') : '#212121' }}>
                                                {option.label}
                                            </Typography>

                                            {/* Show "Unavailable" when bKash disabled */}
                                            {option.isBkash && !bkashEnabled && (
                                                <Chip label="Unavailable" size="small" sx={{ fontSize: '0.6rem', height: 18, ml: 1, bgcolor: '#fff2f6', color: '#C2185B', border: '1px solid rgba(226,19,110,0.12)' }} />
                                            )}

                                            {isSelected && (
                                                <Chip label="Selected" size="small" sx={{
                                                    fontSize: '0.58rem', height: 18,
                                                    bgcolor: option.isBkash ? 'rgba(226,19,110,0.12)' : 'rgba(var(--color-primary-rgb), 0.12)',
                                                    color: option.isBkash ? '#E2136E' : 'var(--color-primary)', fontWeight: 700,
                                                }} />
                                            )}
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#9E9E9E', lineHeight: 1.4, fontSize: '0.75rem' }}>
                                            {option.description}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* COD info bar */}
                                {option.id === 'cash_on_delivery' && isSelected && (
                                    <Box sx={{ px: 2, py: 1, bgcolor: '#fef9c3', borderTop: '1px solid #fef08a', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <SecurityIcon sx={{ fontSize: 13, color: '#ca8a04' }} />
                                        <Typography variant="caption" sx={{ color: '#854d0e', fontSize: '0.72rem' }}>
                                            No advance payment needed — pay when you receive
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* bKash Expanded */}
                            <Collapse in={option.id === 'bkash' && isSelected}>
                                {isDisabled ? (
                                    <Box sx={{ mt: -0.25, mx: 0.5, p: 2 }}>
                                        <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
                                            bKash payments are currently unavailable. Please choose another payment method or contact support.
                                        </Alert>
                                    </Box>
                                ) : (
                                    <Box sx={{ mt: -0.25, mx: 0.5, p: 2, bgcolor: '#fdf2f8', borderRadius: '0 0 6px 6px', border: '1px solid #E2136E', borderTop: 'none' }}>
                                        <Alert severity="info" variant="outlined"
                                            icon={<InfoOutlinedIcon sx={{ color: '#E2136E' }} />}
                                            sx={{ mb: 1.5, borderRadius: '6px', borderColor: 'rgba(226,19,110,0.25)', bgcolor: 'white', '& .MuiAlert-message': { width: '100%' } }}
                                        >
                                            <Typography variant="body2" fontWeight={600} sx={{ color: '#E2136E', mb: 0.25, fontSize: '0.82rem' }}>
                                                Secure bKash Payment
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#757575', display: 'block', lineHeight: 1.5 }}>
                                                You will be redirected to bKash&apos;s secure page to complete payment.
                                            </Typography>
                                        </Alert>

                                        {totalAmount > 0 && (
                                            <Box sx={{ p: 1.5, mb: 1.5, borderRadius: '6px', bgcolor: 'white', border: '1px dashed #E2136E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.82rem' }}>Amount:</Typography>
                                                <Typography variant="h6" fontWeight={800} sx={{ color: '#E2136E', letterSpacing: 0.3 }}>৳{totalAmount.toFixed(0)}</Typography>
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 1.25, borderRadius: '6px', bgcolor: 'rgba(226,19,110,0.04)' }}>
                                            <OpenInNewIcon sx={{ fontSize: 14, color: '#E2136E' }} />
                                            <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.72rem' }}>
                                                Place Order → Redirect to bKash → Enter PIN → Auto Return
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Collapse>
                        </Box>
                    );
                })}
            </Box>
        </fieldset>
    );
}
