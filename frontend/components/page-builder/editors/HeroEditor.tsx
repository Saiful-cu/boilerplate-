'use client';

import {
    TextField,
    Switch,
    FormControlLabel,
    Box,
    Typography,
} from '@mui/material';
import { HeroConfig } from '@/lib/types/pageBuilder';

interface HeroEditorProps {
    config: HeroConfig;
    onChange: (config: Partial<HeroConfig>) => void;
}

export function HeroEditor({ config, onChange }: HeroEditorProps) {

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
                fullWidth
                label="Title"
                value={config.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Welcome to Our Store"
                size="small"
            />

            <TextField
                fullWidth
                label="Subtitle"
                value={config.subtitle ?? ''}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="Discover amazing products"
                multiline
                rows={2}
                size="small"
            />

            <TextField
                fullWidth
                label="Background Image URL"
                value={config.backgroundImage ?? ''}
                onChange={(e) => onChange({ backgroundImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
                size="small"
                helperText="Leave empty for gradient background"
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={config.showButton !== false}
                        onChange={(e) => onChange({ showButton: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Call-to-Action Button
                    </Typography>
                }
            />

            {config.showButton !== false && (
                <Box
                    sx={{
                        pl: 2,
                        borderLeft: 2,
                        borderColor: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <TextField
                        fullWidth
                        label="Button Text"
                        value={config.buttonText ?? ''}
                        onChange={(e) => onChange({ buttonText: e.target.value })}
                        placeholder="Shop Now"
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Button Link"
                        value={config.buttonLink ?? ''}
                        onChange={(e) => onChange({ buttonLink: e.target.value })}
                        placeholder="/products"
                        size="small"
                    />
                </Box>
            )}

            <Box sx={{ pt: 1 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                    sx={{ display: 'block', mb: 1.5 }}
                >
                    Overlay Settings (Optional)
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                        label="Overlay Color"
                        value={config.overlay?.color ?? '#000000'}
                        onChange={(e) =>
                            onChange({
                                overlay: {
                                    ...config.overlay,
                                    color: e.target.value,
                                    opacity: config.overlay?.opacity ?? 0.3,
                                },
                            })
                        }
                        type="color"
                        size="small"
                        InputProps={{ sx: { height: 40 } }}
                    />
                    <TextField
                        label="Opacity"
                        value={config.overlay?.opacity ?? 0.3}
                        onChange={(e) =>
                            onChange({
                                overlay: {
                                    ...config.overlay,
                                    color: config.overlay?.color ?? '#000000',
                                    opacity: parseFloat(e.target.value),
                                },
                            })
                        }
                        type="number"
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                        size="small"
                    />
                </Box>
            </Box>
        </Box>
    );
}
