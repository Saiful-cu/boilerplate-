'use client';

import type { ReactNode } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

/**
 * Loading skeleton shown while page content is being prepared
 */
export default function Loading(): ReactNode {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <CircularProgress size={48} />
            <Typography color="text.secondary" fontWeight={500}>
                Loading...
            </Typography>
        </Box>
    );
}
