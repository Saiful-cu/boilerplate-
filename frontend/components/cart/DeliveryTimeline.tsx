'use client';

import {
    Paper,
    Box,
    Typography,
    Chip,
    Button,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as PendingIcon,
    Bolt as BoltIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const CustomConnector = styled(StepConnector)(() => ({
    '& .MuiStepConnector-line': {
        borderColor: '#e5e7eb',
        borderLeftWidth: 2,
        minHeight: 28,
    },
}));

export default function DeliveryTimeline() {
    const steps = [
        { label: 'Order Confirmed', status: 'pending', date: 'Today' },
        { label: 'Processing', status: 'pending', date: 'Dec 28' },
        { label: 'Shipped', status: 'pending', date: 'Dec 29' },
        { label: 'Out for Delivery', status: 'pending', date: 'Dec 30' },
        { label: 'Delivered', status: 'pending', date: 'Dec 31' },
    ];

    return (
        <Paper
            elevation={2}
            sx={{
                borderRadius: 4,
                border: '2px solid',
                borderColor: 'grey.100',
                p: 3,
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: 6 },
            }}
        >
            <Box className="flex items-center justify-between" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="grey.900">
                    Estimated Delivery
                </Typography>
                <Chip
                    label="3-5 Days"
                    size="small"
                    sx={{
                        fontWeight: 'bold',
                        color: 'white',
                        background: 'linear-gradient(to right, #22c55e, #059669)',
                        boxShadow: 2,
                    }}
                />
            </Box>

            <Stepper
                orientation="vertical"
                activeStep={-1}
                connector={<CustomConnector />}
            >
                {steps.map((step) => (
                    <Step key={step.label} completed={step.status === 'completed'}>
                        <StepLabel
                            icon={
                                step.status === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
                                ) : (
                                    <PendingIcon sx={{ color: 'grey.300', fontSize: 28 }} />
                                )
                            }
                            optional={
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    {step.date}
                                </Typography>
                            }
                        >
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ color: step.status === 'completed' ? 'grey.900' : 'grey.500' }}
                            >
                                {step.label}
                            </Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Express Delivery Option */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '2px solid', borderColor: 'grey.100' }}>
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to right, #eff6ff, #ecfeff)',
                        border: '2px solid',
                        borderColor: 'primary.200',
                        borderRadius: 3,
                        p: 2,
                    }}
                >
                    <Box className="flex items-center gap-3">
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 3,
                            }}
                        >
                            <BoltIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="body2" fontWeight="bold" color="grey.900">
                                Express Delivery
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Get it by tomorrow
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            background: 'linear-gradient(to right, var(--color-primary), var(--color-button-hover))',
                            fontWeight: 'bold',
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 2,
                            '&:hover': {
                                background: 'linear-gradient(to right, var(--color-button-hover), var(--color-primary))',
                                boxShadow: 4,
                                transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s',
                        }}
                    >
                        + BDT 50
                    </Button>
                </Paper>
            </Box>
        </Paper>
    );
}
