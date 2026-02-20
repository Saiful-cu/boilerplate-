'use client';

import {
    TextField,
    Switch,
    FormControlLabel,
    Box,
    Typography,
    Slider,
    IconButton,
    Paper,
    Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Add from '@mui/icons-material/Add';
import { FeaturesConfig, FeatureItem } from '@/lib/types/pageBuilder';

interface FeaturesEditorProps {
    config: FeaturesConfig;
    onChange: (config: Partial<FeaturesConfig>) => void;
}

const DEFAULT_FEATURE: FeatureItem = {
    icon: 'LocalShipping',
    title: 'New Feature',
    description: 'Feature description here',
};

export function FeaturesEditor({ config, onChange }: FeaturesEditorProps) {
    const theme = useTheme();
    const features = config.features ?? [];

    const addFeature = () => {
        const newFeature: FeatureItem = { ...DEFAULT_FEATURE };
        onChange({ features: [...features, newFeature] });
    };

    const updateFeature = (index: number, updates: Partial<FeatureItem>) => {
        const newFeatures = features.map((f, i) =>
            i === index ? { ...f, ...updates } : f
        );
        onChange({ features: newFeatures });
    };

    const removeFeature = (index: number) => {
        onChange({ features: features.filter((_, i) => i !== index) });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
                label="Section Title"
                value={config.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Why Shop With Us"
                fullWidth
                size="small"
            />

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Columns: <strong>{config.columns ?? 4}</strong>
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
                        checked={config.showIcons !== false}
                        onChange={(e) => onChange({ showIcons: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Icons
                    </Typography>
                }
            />

            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.primary">
                        Features ({features.length})
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={addFeature}
                        variant="outlined"
                    >
                        Add
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {features.map((feature, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            sx={{
                                p: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.background.paper, 0.5),
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Feature {index + 1}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => removeFeature(index)}
                                    sx={{ color: theme.palette.error.main }}
                                >
                                    <DeleteOutline fontSize="small" />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Icon Name"
                                    value={feature.icon}
                                    onChange={(e) => updateFeature(index, { icon: e.target.value })}
                                    placeholder="e.g., LocalShipping"
                                    fullWidth
                                    size="small"
                                    helperText="MUI Icon name"
                                />

                                <TextField
                                    label="Title"
                                    value={feature.title}
                                    onChange={(e) => updateFeature(index, { title: e.target.value })}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Description"
                                    value={feature.description}
                                    onChange={(e) => updateFeature(index, { description: e.target.value })}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
