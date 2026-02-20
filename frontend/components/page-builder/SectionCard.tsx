'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Box,
    IconButton,
    Typography,
    Tooltip,
    Chip,
    alpha,
    useTheme,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useBuilderStore } from '@/lib/stores/builderStore';
import { Section, getSectionMeta } from '@/lib/types/pageBuilder';

interface SectionCardProps {
    section: Section;
}

export function SectionCard({ section }: SectionCardProps) {
    const theme = useTheme();
    const {
        selectSection,
        selectedSectionId,
        removeSection,
        duplicateSection,
        toggleSectionActive,
        moveSection,
        sections,
    } = useBuilderStore();

    const isSelected = selectedSectionId === section.id;
    const meta = getSectionMeta(section.type);
    const index = sections.findIndex((s) => s.id === section.id);
    const isFirst = index === 0;
    const isLast = index === sections.length - 1;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        selectSection(section.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this section? This action cannot be undone.')) {
            removeSection(section.id);
        }
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            onClick={handleClick}
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: 2,
                borderColor: isSelected
                    ? 'primary.main'
                    : 'transparent',
                boxShadow: isSelected ? 4 : 1,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                opacity: isDragging ? 0.5 : section.isActive ? 1 : 0.6,
                '&:hover': {
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    boxShadow: 2,
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Drag Handle */}
                    <Box
                        {...attributes}
                        {...listeners}
                        sx={{
                            cursor: 'grab',
                            p: 0.5,
                            borderRadius: 1,
                            display: 'flex',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                            '&:active': {
                                cursor: 'grabbing',
                            },
                        }}
                    >
                        <DragIndicatorIcon sx={{ color: 'text.disabled' }} />
                    </Box>

                    {/* Section Icon & Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    fontSize: '1.5rem',
                                    lineHeight: 1,
                                }}
                            >
                                {meta?.icon ?? '📄'}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    noWrap
                                    sx={{ color: 'text.primary' }}
                                >
                                    {section.title || meta?.label || section.type.replace('_', ' ')}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {section.type.replace('_', ' ')}
                                </Typography>
                            </Box>
                            {!section.isActive && (
                                <Chip
                                    label="Hidden"
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    sx={{ height: 22, fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Order Badge */}
                    <Chip
                        label={`#${index + 1}`}
                        size="small"
                        sx={{
                            height: 24,
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                        }}
                    />

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={isFirst ? 'Already at top' : 'Move up'}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveSection(section.id, 'up');
                                    }}
                                    disabled={isFirst}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <KeyboardArrowUpIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title={isLast ? 'Already at bottom' : 'Move down'}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveSection(section.id, 'down');
                                    }}
                                    disabled={isLast}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <KeyboardArrowDownIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title={section.isActive ? 'Hide section' : 'Show section'}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSectionActive(section.id);
                                }}
                                sx={{
                                    color: section.isActive ? 'success.main' : 'warning.main',
                                }}
                            >
                                {section.isActive ? (
                                    <VisibilityIcon fontSize="small" />
                                ) : (
                                    <VisibilityOffIcon fontSize="small" />
                                )}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Duplicate section">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateSection(section.id);
                                }}
                                sx={{ color: 'text.secondary' }}
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete section">
                            <IconButton
                                size="small"
                                onClick={handleDelete}
                                sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                    },
                                }}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
