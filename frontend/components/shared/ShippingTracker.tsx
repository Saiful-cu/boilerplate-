'use client';

import {
    Box,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    stepConnectorClasses,
    styled,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';

interface StatusHistoryItem {
    status: string;
    timestamp: string;
    note?: string;
}

interface Order {
    _id: string;
    orderStatus: string;
    statusHistory?: StatusHistoryItem[];
    trackingNumber?: string;
}

interface ShippingTrackerProps {
    order: Order;
}

const STATUSES = [
    { key: 'pending', label: 'Order Placed', icon: PendingIcon },
    { key: 'processing', label: 'Processing', icon: InventoryIcon },
    { key: 'shipped', label: 'Shipped', icon: LocalShippingIcon },
    { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

const ColorConnector = styled(StepConnector)<{ ownerState: { completed: boolean; cancelled: boolean } }>(
    ({ theme, ownerState }) => ({
        [`&.${stepConnectorClasses.alternativeLabel}`]: {
            top: 22,
        },
        [`&.${stepConnectorClasses.active}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundColor: ownerState.cancelled
                    ? theme.palette.error.main
                    : theme.palette.success.main,
            },
        },
        [`&.${stepConnectorClasses.completed}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundColor: ownerState.cancelled
                    ? theme.palette.error.main
                    : theme.palette.success.main,
            },
        },
        [`& .${stepConnectorClasses.line}`]: {
            height: 3,
            border: 0,
            backgroundColor: theme.palette.grey[300],
            borderRadius: 1,
        },
    })
);

function StepIcon({
    Icon,
    active,
    completed,
    cancelled,
}: {
    Icon: typeof LocalShippingIcon;
    active: boolean;
    completed: boolean;
    cancelled: boolean;
}) {
    const bgColor = cancelled
        ? 'error.main'
        : completed || active
            ? 'success.main'
            : 'grey.300';

    const iconColor = cancelled || completed || active ? '#fff' : 'grey.500';

    return (
        <Box
            sx={{
                bgcolor: bgColor,
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: active ? 3 : 0,
                transition: 'all 0.3s',
            }}
        >
            <Icon sx={{ color: iconColor, fontSize: 24 }} />
        </Box>
    );
}

export default function ShippingTracker({ order }: ShippingTrackerProps) {
    const currentStatusIndex = STATUS_ORDER.indexOf(order.orderStatus);
    const isCancelled = order.orderStatus === 'cancelled';

    if (isCancelled) {
        return (
            <Paper
                sx={{
                    p: 3,
                    bgcolor: 'error.50',
                    border: '1px solid',
                    borderColor: 'error.200',
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
                    <Box>
                        <Typography variant="h6" color="error.dark" fontWeight={700}>
                            Order Cancelled
                        </Typography>
                        <Typography variant="body2" color="error.main">
                            This order has been cancelled
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                p: 3,
                background: 'linear-gradient(135deg, #EBF8FF 0%, #E0E7FF 100%)',
                border: '1px solid',
                borderColor: 'primary.100',
                borderRadius: 2,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocalShippingIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={700}>
                    Shipping Status
                </Typography>
            </Box>

            <Stepper
                alternativeLabel
                activeStep={currentStatusIndex}
                connector={<ColorConnector ownerState={{ completed: false, cancelled: isCancelled }} />}
            >
                {STATUSES.map((status, index) => {
                    const Icon = status.icon;
                    const isActive = index === currentStatusIndex;
                    const isCompleted = index < currentStatusIndex;
                    const historyItem = order.statusHistory?.find((h) => h.status === status.key);

                    return (
                        <Step key={status.key}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <StepIcon
                                        Icon={Icon}
                                        active={isActive}
                                        completed={isCompleted}
                                        cancelled={isCancelled}
                                    />
                                )}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight={isActive || isCompleted ? 600 : 400}
                                    color={isActive || isCompleted ? 'text.primary' : 'text.secondary'}
                                >
                                    {status.label}
                                </Typography>
                                {historyItem && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {new Date(historyItem.timestamp).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Typography>
                                )}
                                {historyItem?.note && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontStyle="italic"
                                        display="block"
                                    >
                                        {historyItem.note}
                                    </Typography>
                                )}
                            </StepLabel>
                        </Step>
                    );
                })}
            </Stepper>

            {order.trackingNumber && (
                <Paper
                    variant="outlined"
                    sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: 'white',
                        borderColor: 'primary.200',
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        Tracking Number
                    </Typography>
                    <Typography variant="body1" fontWeight={700} fontFamily="monospace">
                        {order.trackingNumber}
                    </Typography>
                </Paper>
            )}
        </Paper>
    );
}
