'use client';

import {
    Switch,
    FormControlLabel,
    Box,
    Slider,
    Typography,
} from '@mui/material';
import { CategoryGridConfig } from '@/lib/types/pageBuilder';

interface CategoryGridEditorProps {
    config: CategoryGridConfig;
    onChange: (config: Partial<CategoryGridConfig>) => void;
}

export function CategoryGridEditor({ config, onChange }: CategoryGridEditorProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Number of Categories: <strong>{config.limit ?? 6}</strong>
                </Typography>
                <Slider
                    value={config.limit ?? 6}
                    onChange={(_, value) => onChange({ limit: value as number })}
                    min={2}
                    max={12}
                    marks={[
                        { value: 2, label: '2' },
                        { value: 4, label: '4' },
                        { value: 6, label: '6' },
                        { value: 8, label: '8' },
                        { value: 12, label: '12' },
                    ]}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Box>

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Grid Columns: <strong>{config.columns ?? 4}</strong>
                </Typography>
                <Slider
                    value={config.columns ?? 4}
                    onChange={(_, value) => onChange({ columns: value as number })}
                    min={2}
                    max={6}
                    marks={[
                        { value: 2, label: '2' },
                        { value: 3, label: '3' },
                        { value: 4, label: '4' },
                        { value: 5, label: '5' },
                        { value: 6, label: '6' },
                    ]}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Box>

            <FormControlLabel
                control={
                    <Switch
                        checked={config.showImages !== false}
                        onChange={(e) => onChange({ showImages: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Category Images
                    </Typography>
                }
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={config.showCount === true}
                        onChange={(e) => onChange({ showCount: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Product Count
                    </Typography>
                }
            />
        </Box>
    );
}
