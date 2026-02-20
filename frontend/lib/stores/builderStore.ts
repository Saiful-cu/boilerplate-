import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    Section,
    SectionType,
    SectionConfigMap,
    getDefaultConfig,
    generateSectionId,
} from '@/lib/types/pageBuilder';
import api from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface HistoryState {
    past: Section[][];
    future: Section[][];
}

interface BuilderState {
    // Data
    sections: Section[];
    selectedSectionId: string | null;
    isDirty: boolean;
    isLoading: boolean;
    isSaving: boolean;

    // History for undo/redo
    history: HistoryState;

    // Actions - Section Management
    addSection: (type: SectionType, position?: number) => void;
    removeSection: (id: string) => void;
    duplicateSection: (id: string) => void;
    reorderSections: (fromIndex: number, toIndex: number) => void;
    moveSection: (id: string, direction: 'up' | 'down') => void;
    toggleSectionActive: (id: string) => void;

    // Actions - Section Config
    updateSectionConfig: <T extends SectionType>(
        id: string,
        config: Partial<SectionConfigMap[T]>
    ) => void;
    updateSectionTitle: (id: string, title: string) => void;

    // Actions - Selection
    selectSection: (id: string | null) => void;

    // Actions - Persistence
    loadSections: () => Promise<void>;
    saveSections: () => Promise<void>;

    // Actions - History
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;

    // Actions - Reset
    resetDirty: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function pushToHistory(state: BuilderState) {
    state.history.past.push(JSON.parse(JSON.stringify(state.sections)));
    state.history.future = [];
    // Limit history to 50 items
    if (state.history.past.length > 50) {
        state.history.past.shift();
    }
}

function recalculateOrder(sections: Section[]) {
    sections.forEach((section, index) => {
        section.order = index;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useBuilderStore = create<BuilderState>()(
    immer((set, get) => ({
        // Initial State
        sections: [],
        selectedSectionId: null,
        isDirty: false,
        isLoading: false,
        isSaving: false,
        history: {
            past: [],
            future: [],
        },

        // ─────────────────────────────────────────────────────────────────────────
        // Section Management
        // ─────────────────────────────────────────────────────────────────────────

        addSection: (type, position) => {
            set((state) => {
                pushToHistory(state);

                const newSection: Section = {
                    id: generateSectionId(),
                    type,
                    order: position ?? state.sections.length,
                    isActive: true,
                    title: '',
                    config: getDefaultConfig(type),
                };

                if (position !== undefined) {
                    state.sections.splice(position, 0, newSection);
                } else {
                    state.sections.push(newSection);
                }

                recalculateOrder(state.sections);
                state.isDirty = true;
                state.selectedSectionId = newSection.id;
            });
        },

        removeSection: (id) => {
            set((state) => {
                pushToHistory(state);

                const index = state.sections.findIndex((s) => s.id === id);
                if (index !== -1) {
                    state.sections.splice(index, 1);
                    recalculateOrder(state.sections);
                    state.isDirty = true;

                    if (state.selectedSectionId === id) {
                        state.selectedSectionId = null;
                    }
                }
            });
        },

        duplicateSection: (id) => {
            set((state) => {
                pushToHistory(state);

                const index = state.sections.findIndex((s) => s.id === id);
                if (index !== -1) {
                    const original = state.sections[index];
                    if (!original) return;
                    const duplicate: Section = {
                        ...JSON.parse(JSON.stringify(original)),
                        id: generateSectionId(),
                        _id: undefined,
                        title: original.title ? `${original.title} (Copy)` : '',
                    };

                    state.sections.splice(index + 1, 0, duplicate);
                    recalculateOrder(state.sections);
                    state.isDirty = true;
                    state.selectedSectionId = duplicate.id;
                }
            });
        },

        reorderSections: (fromIndex, toIndex) => {
            set((state) => {
                if (fromIndex === toIndex) return;

                pushToHistory(state);

                const [moved] = state.sections.splice(fromIndex, 1);
                if (moved) state.sections.splice(toIndex, 0, moved);
                recalculateOrder(state.sections);
                state.isDirty = true;
            });
        },

        moveSection: (id, direction) => {
            set((state) => {
                const index = state.sections.findIndex((s) => s.id === id);
                if (index === -1) return;

                const newIndex = direction === 'up' ? index - 1 : index + 1;
                if (newIndex < 0 || newIndex >= state.sections.length) return;

                pushToHistory(state);

                const [moved] = state.sections.splice(index, 1);
                if (moved) state.sections.splice(newIndex, 0, moved);
                recalculateOrder(state.sections);
                state.isDirty = true;
            });
        },

        toggleSectionActive: (id) => {
            set((state) => {
                const section = state.sections.find((s) => s.id === id);
                if (section) {
                    pushToHistory(state);
                    section.isActive = !section.isActive;
                    state.isDirty = true;
                }
            });
        },

        // ─────────────────────────────────────────────────────────────────────────
        // Section Config
        // ─────────────────────────────────────────────────────────────────────────

        updateSectionConfig: (id, config) => {
            set((state) => {
                const section = state.sections.find((s) => s.id === id);
                if (section) {
                    pushToHistory(state);
                    section.config = { ...section.config, ...config };
                    state.isDirty = true;
                }
            });
        },

        updateSectionTitle: (id, title) => {
            set((state) => {
                const section = state.sections.find((s) => s.id === id);
                if (section) {
                    pushToHistory(state);
                    section.title = title;
                    state.isDirty = true;
                }
            });
        },

        // ─────────────────────────────────────────────────────────────────────────
        // Selection
        // ─────────────────────────────────────────────────────────────────────────

        selectSection: (id) => {
            set((state) => {
                state.selectedSectionId = id;
            });
        },

        // ─────────────────────────────────────────────────────────────────────────
        // Persistence
        // ─────────────────────────────────────────────────────────────────────────

        loadSections: async () => {
            set((state) => {
                state.isLoading = true;
            });

            try {
                const response = await api.get('/homepage');
                const data = response.data?.sections || response.data || [];
                const sections = Array.isArray(data)
                    ? data
                        .sort((a: Section, b: Section) => a.order - b.order)
                        .map((s: Section) => ({
                            ...s,
                            id: s._id || s.id || generateSectionId(),
                        }))
                    : [];

                set((state) => {
                    state.sections = sections;
                    state.isLoading = false;
                    state.isDirty = false;
                    state.history = { past: [], future: [] };
                });
            } catch (error) {
                console.error('Error loading sections:', error);
                set((state) => {
                    state.isLoading = false;
                });
                throw error;
            }
        },

        saveSections: async () => {
            const { sections, isDirty } = get();
            if (!isDirty) return;

            set((state) => {
                state.isSaving = true;
            });

            try {
                // Transform sections for backend - keep _id for existing sections
                const sectionsForBackend = sections.map((s, index) => ({
                    ...(s._id ? { _id: s._id } : {}),
                    type: s.type,
                    title: s.title || '',
                    order: index,
                    isActive: s.isActive,
                    config: s.config || {},
                }));

                const response = await api.put('/homepage', { sections: sectionsForBackend });

                // Update local sections with _ids from response
                if (response.data?.sections) {
                    set((state) => {
                        state.sections = response.data.sections.map((s: Section) => ({
                            ...s,
                            id: s._id || s.id || generateSectionId(),
                        }));
                    });
                }

                set((state) => {
                    state.isSaving = false;
                    state.isDirty = false;
                });
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error saving sections:', errorMessage);
                set((state) => {
                    state.isSaving = false;
                });
                throw error;
            }
        },

        // ─────────────────────────────────────────────────────────────────────────
        // History (Undo/Redo)
        // ─────────────────────────────────────────────────────────────────────────

        undo: () => {
            set((state) => {
                if (state.history.past.length === 0) return;

                const previous = state.history.past.pop()!;
                state.history.future.push(JSON.parse(JSON.stringify(state.sections)));
                state.sections = previous;
                state.isDirty = true;
            });
        },

        redo: () => {
            set((state) => {
                if (state.history.future.length === 0) return;

                const next = state.history.future.pop()!;
                state.history.past.push(JSON.parse(JSON.stringify(state.sections)));
                state.sections = next;
                state.isDirty = true;
            });
        },

        canUndo: () => {
            return get().history.past.length > 0;
        },

        canRedo: () => {
            return get().history.future.length > 0;
        },

        // ─────────────────────────────────────────────────────────────────────────
        // Reset
        // ─────────────────────────────────────────────────────────────────────────

        resetDirty: () => {
            set((state) => {
                state.isDirty = false;
            });
        },
    }))
);

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

export const useSelectedSection = () => {
    return useBuilderStore((state) => {
        if (!state.selectedSectionId) return null;
        return state.sections.find((s) => s.id === state.selectedSectionId) ?? null;
    });
};

export const useActiveSections = () => {
    return useBuilderStore((state) =>
        state.sections.filter((s) => s.isActive).sort((a, b) => a.order - b.order)
    );
};
