'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    IconButton,
    Tooltip,
    Chip,
    Snackbar,
    Alert,
    Tab,
    Tabs,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import PreviewIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useBuilderStore } from '@/lib/stores/builderStore';
import {
    Canvas,
    SectionToolbox,
    PropertiesPanel,
    Preview,
} from '@/components/page-builder';
import toast from 'react-hot-toast';

type ViewTab = 'editor' | 'preview';

export default function PageBuilderPage() {
    const theme = useTheme();
    const {
        loadSections,
        saveSections,
        isLoading,
        isSaving,
        isDirty,
        sections,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useBuilderStore();

    const [activeTab, setActiveTab] = useState<ViewTab>('editor');
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

    // Load sections on mount
    useEffect(() => {
        loadSections().catch((error) => {
            console.error('Failed to load sections:', error);
            toast.error('Failed to load homepage sections');
        });
    }, [loadSections]);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Auto-save with debounce
    useEffect(() => {
        if (!isDirty) return;

        const timer = setTimeout(() => {
            saveSections()
                .then(() => {
                    toast.success('Changes auto-saved', {
                        duration: 2000,
                        icon: '💾',
                    });
                })
                .catch((error: unknown) => {
                    console.error('Auto-save failed:', error);
                    const errorObj = error as { response?: { status?: number } };
                    if (errorObj.response?.status === 401 || errorObj.response?.status === 403) {
                        setShowUnsavedWarning(true);
                    }
                });
        }, 3000);

        return () => clearTimeout(timer);
    }, [isDirty, sections, saveSections]);

    const handleSave = useCallback(async () => {
        if (!isDirty) {
            toast.success('All changes already saved', { icon: '✓' });
            return;
        }
        try {
            await saveSections();
            toast.success('Homepage saved successfully');
        } catch (error: unknown) {
            console.error('Save failed:', error);
            const errorObj = error as { response?: { status?: number } };
            if (errorObj.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
            } else if (errorObj.response?.status === 403) {
                toast.error('You do not have permission to edit the homepage.');
            } else {
                toast.error('Failed to save homepage. Please try again.');
            }
        }
    }, [saveSections, isDirty]);

    const handleUndo = useCallback(() => {
        if (canUndo()) {
            undo();
        }
    }, [canUndo, undo]);

    const handleRedo = useCallback(() => {
        if (canRedo()) {
            redo();
        }
    }, [canRedo, redo]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, handleUndo, handleRedo]);

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: theme.palette.background.default,
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography color="text.secondary">Loading homepage builder...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                bgcolor: theme.palette.background.default,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    px: 3,
                    py: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" component="h1" fontWeight={700} color="text.primary">
                            Homepage Builder
                        </Typography>
                        {isDirty && (
                            <Chip
                                label="Unsaved changes"
                                size="small"
                                color="warning"
                                variant="outlined"
                            />
                        )}
                        <Typography variant="body2" color="text.secondary">
                            {sections.length} section{sections.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Undo/Redo */}
                        <Tooltip title="Undo (Ctrl+Z)">
                            <span>
                                <IconButton
                                    onClick={handleUndo}
                                    disabled={!canUndo()}
                                    size="small"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    <UndoIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Redo (Ctrl+Shift+Z)">
                            <span>
                                <IconButton
                                    onClick={handleRedo}
                                    disabled={!canRedo()}
                                    size="small"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    <RedoIcon />
                                </IconButton>
                            </span>
                        </Tooltip>



                        {/* View Toggle */}
                        <Tabs
                            value={activeTab}
                            onChange={(_, value) => setActiveTab(value)} sx={{
                                minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0, textTransform: 'none', },
                            }}
                        >
                            <Tab
                                value="editor"
                                label="Editor"
                                icon={<EditIcon fontSize="small" />}
                                iconPosition="start"
                            />
                            <Tab
                                value="preview"
                                label="Preview"
                                icon={<PreviewIcon fontSize="small" />}
                                iconPosition="start"
                            />
                        </Tabs>

                        

                        {/* Save Button */}
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isSaving}
                            startIcon={
                                isSaving ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    <SaveIcon />
                                )
                            }
                            sx={{
                                textTransform: 'none',
                                minWidth: 100,
                                bgcolor: isDirty
                                    ? theme.palette.primary.main
                                    : theme.palette.success.main,
                                '&:hover': {
                                    bgcolor: isDirty
                                        ? theme.palette.primary.dark
                                        : theme.palette.success.dark,
                                },
                            }}
                        >
                            {isSaving ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {activeTab === 'editor' ? (
                    <>
                        {/* Left: Section Toolbox */}
                        <SectionToolbox />

                        {/* Center: Canvas */}
                        <Canvas />

                        {/* Right: Properties Panel */}
                        <PropertiesPanel />
                    </>
                ) : (
                    /* Preview Mode */
                    <Preview />
                )}
            </Box>

            {/* Unsaved Changes Warning */}
            <Snackbar
                open={showUnsavedWarning}
                autoHideDuration={5000}
                onClose={() => setShowUnsavedWarning(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowUnsavedWarning(false)}
                    severity="warning"
                    variant="filled"
                    sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.9),
                    }}
                >
                    You have unsaved changes. Don&apos;t forget to save!
                </Alert>
            </Snackbar>
        </Box>
    );
}
