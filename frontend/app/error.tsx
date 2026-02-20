'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { getUserFriendlyMessage, isAppError, type AppError } from '@/lib/errors';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Global error boundary for the application
 *
 * This component catches:
 * - Uncaught exceptions in child components
 * - Errors during Next.js rendering
 * - Errors during data fetching
 *
 * It displays user-friendly error messages and provides a reset button.
 * Internal error details are logged for debugging but not shown to users.
 */
export default function GlobalError({ error, reset }: ErrorProps): ReactNode {
    useEffect(() => {
        console.error('Application error:', {
            message: error.message,
            digest: error.digest,
            stack: error.stack,
        });
    }, [error]);

    let userMessage = 'Something went wrong. Please try again.';

    if (isAppError(error as unknown as AppError)) {
        const appError = error as unknown as AppError;
        userMessage = getUserFriendlyMessage(appError.code);
    }

    return (
        <html lang="en">
            <body>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        px: 3,
                        py: 4,
                        bgcolor: 'grey.50',
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            textAlign: 'center',
                            maxWidth: 480,
                            width: '100%',
                            p: 5,
                            borderRadius: 1,
                        }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '20%',
                                bgcolor: 'error.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Something Went Wrong
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 4, fontSize: '1rem' }}>
                            {userMessage}
                        </Typography>
                        <Button
                            onClick={reset}
                            variant="contained"
                            size="large"
                            startIcon={<RefreshIcon />}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                px: 4,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem',
                            }}
                        >
                            Try Again
                        </Button>
                    </Paper>
                </Box>
            </body>
        </html>
    );
}
