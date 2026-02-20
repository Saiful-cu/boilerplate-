'use client';

import { Box, Typography, Button, Tooltip, alpha, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useBuilderStore } from '@/lib/stores/builderStore';
import { SECTION_TYPES, SectionType } from '@/lib/types/pageBuilder';

export function SectionToolbox() {
    const theme = useTheme();
    const addSection = useBuilderStore((state) => state.addSection);

    const handleAddSection = (type: SectionType) => {
        addSection(type);
    };

    return (
        <Box
            sx={{
                width: 280,
                bgcolor: 'background.paper',
                borderRight: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h6" fontWeight={700} color="text.primary">
                    Sections
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Click to add a section to your page
                </Typography>
            </Box>

            {/* Section Types */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {SECTION_TYPES.map((sectionType) => (
                        <Tooltip
                            key={sectionType.type}
                            title={sectionType.description}
                            placement="right"
                            arrow
                        >
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleAddSection(sectionType.type)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    py: 1.5,
                                    px: 2,
                                    textAlign: 'left',
                                    textTransform: 'none',
                                    borderColor: 'divider',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        width: '100%',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            fontSize: '1.5rem',
                                            lineHeight: 1,
                                            width: 32,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {sectionType.icon}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            noWrap
                                            sx={{ color: 'text.primary' }}
                                        >
                                            {sectionType.label}
                                        </Typography>
                                    </Box>
                                    <AddIcon
                                        fontSize="small"
                                        sx={{ color: 'text.disabled' }}
                                    />
                                </Box>
                            </Button>
                        </Tooltip>
                    ))}
                </Box>
            </Box>

            {/* Footer Tips */}
            <Box
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: alpha(
                        theme.palette.mode === 'dark'
                            ? theme.palette.primary.main
                            : theme.palette.info.main,
                        0.08
                    ),
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LightbulbOutlinedIcon
                        fontSize="small"
                        sx={{ color: 'info.main', mt: 0.25 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        Drag sections in the canvas to reorder them. Changes are auto-saved.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
