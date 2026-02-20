'use client';

import {
    TextField,
    Switch,
    FormControlLabel,
    Box,
    Typography,
    ButtonGroup,
    Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { CollectionBannersConfig } from '@/lib/types/pageBuilder';

interface CollectionBannersEditorProps {
    config: CollectionBannersConfig;
    onChange: (config: Partial<CollectionBannersConfig>) => void;
}

const LAYOUT_OPTIONS = [
    { value: 'grid', label: 'Grid' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'masonry', label: 'Masonry' },
] as const;

export function CollectionBannersEditor({ config, onChange }: CollectionBannersEditorProps) {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
                label="Section Title"
                value={config.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Our Collections"
                fullWidth
                size="small"
                helperText="Leave empty to hide title"
            />

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Layout Style
                </Typography>
                <ButtonGroup fullWidth size="small">
                    {LAYOUT_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant={(config.layout ?? 'grid') === option.value ? 'contained' : 'outlined'}
                            onClick={() => onChange({ layout: option.value })}
                            sx={{
                                bgcolor: (config.layout ?? 'grid') === option.value
                                    ? theme.palette.primary.main
                                    : 'transparent',
                                color: (config.layout ?? 'grid') === option.value
                                    ? theme.palette.primary.contrastText
                                    : theme.palette.text.primary,
                                borderColor: alpha(theme.palette.divider, 0.5),
                                '&:hover': {
                                    bgcolor: (config.layout ?? 'grid') === option.value
                                        ? theme.palette.primary.dark
                                        : alpha(theme.palette.primary.main, 0.08),
                                    borderColor: theme.palette.primary.main,
                                },
                            }}
                        >
                            {option.label}
                        </Button>
                    ))}
                </ButtonGroup>
            </Box>

            <FormControlLabel
                control={
                    <Switch
                        checked={config.showOverlay !== false}
                        onChange={(e) => onChange({ showOverlay: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Dark Overlay on Images
                    </Typography>
                }
            />

            <Box
                sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Collection banners are fetched from your featured collections. Add or edit collections in the Collections section.
                </Typography>
            </Box>
        </Box>
    );
}
