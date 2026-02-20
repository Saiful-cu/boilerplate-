'use client';

import { useMemo, useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import { useBuilderStore } from '@/lib/stores/builderStore';
import { SectionCard } from './SectionCard';
import { Section } from '@/lib/types/pageBuilder';

export function Canvas() {
    const theme = useTheme();
    const sections = useBuilderStore((state) => state.sections);
    const reorderSections = useBuilderStore((state) => state.reorderSections);
    const [activeSection, setActiveSection] = useState<Section | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const sectionIds = useMemo(
        () => sections.map((section) => section.id),
        [sections]
    );

    const handleDragStart = (event: DragStartEvent) => {
        const section = sections.find((s) => s.id === event.active.id);
        setActiveSection(section ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveSection(null);

        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);
            reorderSections(oldIndex, newIndex);
        }
    };

    return (
        <Box
            sx={{
                flex: 1,
                overflow: 'auto',
                p: 3,
                bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.default, 0.5)
                    : theme.palette.grey[100],
            }}
        >
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sectionIds}
                    strategy={verticalListSortingStrategy}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            maxWidth: 900,
                            mx: 'auto',
                        }}
                    >
                        {sections.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 10,
                                    px: 4,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                }}
                            >
                                <ViewQuiltIcon
                                    sx={{
                                        fontSize: 64,
                                        color: 'text.disabled',
                                        mb: 2,
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    No sections yet
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    Click on section types in the left panel to add them to your page
                                </Typography>
                            </Box>
                        ) : (
                            sections.map((section) => (
                                <SectionCard key={section.id} section={section} />
                            ))
                        )}
                    </Box>
                </SortableContext>

                <DragOverlay>
                    {activeSection ? (
                        <Box
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                boxShadow: 8,
                                border: 2,
                                borderColor: 'primary.main',
                                p: 2,
                                opacity: 0.95,
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={600}>
                                {activeSection.title || activeSection.type.replace('_', ' ')}
                            </Typography>
                        </Box>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </Box>
    );
}
