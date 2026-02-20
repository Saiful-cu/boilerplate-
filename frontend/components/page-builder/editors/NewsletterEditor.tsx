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
import { NewsletterConfig } from '@/lib/types/pageBuilder';

interface NewsletterEditorProps {
    config: NewsletterConfig;
    onChange: (config: Partial<NewsletterConfig>) => void;
}

const STYLE_OPTIONS = [
    { value: 'minimal', label: 'Minimal' },
    { value: 'card', label: 'Card' },
    { value: 'full-width', label: 'Full Width' },
] as const;

export function NewsletterEditor({ config, onChange }: NewsletterEditorProps) {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
                label="Title"
                value={config.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Subscribe to Our Newsletter"
                fullWidth
                size="small"
            />

            <TextField
                label="Subtitle"
                value={config.subtitle ?? ''}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="Get the latest updates and offers"
                fullWidth
                size="small"
                multiline
                rows={2}
            />

            <TextField
                label="Button Text"
                value={config.buttonText ?? ''}
                onChange={(e) => onChange({ buttonText: e.target.value })}
                placeholder="Subscribe"
                fullWidth
                size="small"
            />

            <TextField
                label="Placeholder Text"
                value={config.placeholder ?? ''}
                onChange={(e) => onChange({ placeholder: e.target.value })}
                placeholder="Enter your email"
                fullWidth
                size="small"
            />

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Style
                </Typography>
                <ButtonGroup fullWidth size="small">
                    {STYLE_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant={(config.style ?? 'card') === option.value ? 'contained' : 'outlined'}
                            onClick={() => onChange({ style: option.value })}
                            sx={{
                                bgcolor: (config.style ?? 'card') === option.value
                                    ? theme.palette.primary.main
                                    : 'transparent',
                                color: (config.style ?? 'card') === option.value
                                    ? theme.palette.primary.contrastText
                                    : theme.palette.text.primary,
                                borderColor: alpha(theme.palette.divider, 0.5),
                                '&:hover': {
                                    bgcolor: (config.style ?? 'card') === option.value
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

            <TextField
                label="Background Color"
                value={config.backgroundColor ?? ''}
                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                placeholder="#f5f5f5"
                fullWidth
                size="small"
                helperText="Hex color code or CSS color name"
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={config.showDisclaimer === true}
                        onChange={(e) => onChange({ showDisclaimer: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Privacy Disclaimer
                    </Typography>
                }
            />
        </Box>
    );
}
