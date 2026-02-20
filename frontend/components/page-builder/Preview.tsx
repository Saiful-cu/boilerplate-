'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    IconButton,
    Tooltip,
    alpha,
    useTheme,
} from '@mui/material';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useActiveSections } from '@/lib/stores/builderStore';

type ViewMode = 'desktop' | 'tablet' | 'mobile';

const VIEW_SIZES: Record<ViewMode, { width: string; label: string }> = {
    desktop: { width: '100%', label: 'Desktop' },
    tablet: { width: '768px', label: 'Tablet' },
    mobile: { width: '375px', label: 'Mobile' },
};

export function Preview() {
    const theme = useTheme();
    const sections = useActiveSections();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');
    const [isLoaded, setIsLoaded] = useState(false);

    // Send sections to preview iframe whenever they change
    useEffect(() => {
        if (iframeRef.current?.contentWindow && isLoaded) {
            iframeRef.current.contentWindow.postMessage(
                {
                    type: 'PREVIEW_UPDATE',
                    sections: sections,
                },
                '*'
            );
        }
    }, [sections, isLoaded]);

    const handleIframeLoad = () => {
        setIsLoaded(true);
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                {
                    type: 'PREVIEW_UPDATE',
                    sections: sections,
                },
                '*'
            );
        }
    };

    const handleRefresh = () => {
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
            setIsLoaded(false);
        }
    };

    const handleOpenInNewTab = () => {
        window.open('/preview/homepage', '_blank');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.default, 0.5)
                    : theme.palette.grey[100],
            }}
        >
            {/* Preview Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.5,
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Live Preview
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, value) => value && setViewMode(value)}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                px: 1.5,
                                py: 0.75,
                                borderColor: 'divider',
                                '&.Mui-selected': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="desktop">
                            <Tooltip title="Desktop">
                                <DesktopWindowsOutlinedIcon fontSize="small" />
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="tablet">
                            <Tooltip title="Tablet">
                                <TabletMacOutlinedIcon fontSize="small" />
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="mobile">
                            <Tooltip title="Mobile">
                                <PhoneIphoneOutlinedIcon fontSize="small" />
                            </Tooltip>
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Box
                        sx={{
                            width: 1,
                            height: 24,
                            bgcolor: 'divider',
                        }}
                    />

                    <Tooltip title="Refresh preview">
                        <IconButton size="small" onClick={handleRefresh}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Open in new tab">
                        <IconButton size="small" onClick={handleOpenInNewTab}>
                            <OpenInNewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Preview Content */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 3,
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 4,
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        width: VIEW_SIZES[viewMode].width,
                        maxWidth: '100%',
                        height: '100%',
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        src="/preview/homepage"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                        }}
                        onLoad={handleIframeLoad}
                        title="Homepage Preview"
                    />
                </Box>
            </Box>

            {/* View Mode Label */}
            <Box
                sx={{
                    textAlign: 'center',
                    py: 1.5,
                    bgcolor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    {VIEW_SIZES[viewMode].label} View
                    {viewMode !== 'desktop' && ` (${VIEW_SIZES[viewMode].width})`}
                </Typography>
            </Box>
        </Box>
    );
}
