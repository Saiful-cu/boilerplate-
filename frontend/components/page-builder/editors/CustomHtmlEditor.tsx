'use client';

import {
    TextField,
    Box,
    Typography,
    Alert,
    Paper,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { CustomHtmlConfig } from '@/lib/types/pageBuilder';

interface CustomHtmlEditorProps {
    config: CustomHtmlConfig;
    onChange: (config: Partial<CustomHtmlConfig>) => void;
}

export function CustomHtmlEditor({ config, onChange }: CustomHtmlEditorProps) {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert
                severity="warning"
                icon={<WarningAmber />}
                sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    '& .MuiAlert-icon': {
                        color: theme.palette.warning.main,
                    },
                }}
            >
                <Typography variant="body2">
                    Custom HTML is rendered as-is. Be careful with scripts and ensure content is trusted.
                </Typography>
            </Alert>

            <TextField
                label="Section Name"
                value={config.name ?? ''}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="My Custom Section"
                fullWidth
                size="small"
                helperText="For identification in the editor only"
            />

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    HTML Content
                </Typography>
                <Paper
                    elevation={0}
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        overflow: 'hidden',
                    }}
                >
                    <TextField
                        value={config.html ?? ''}
                        onChange={(e) => onChange({ html: e.target.value })}
                        multiline
                        rows={12}
                        fullWidth
                        placeholder={`<div class="custom-section">
  <h2>Custom Content</h2>
  <p>Your HTML here...</p>
</div>`}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                            },
                        }}
                    />
                </Paper>
            </Box>

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Custom CSS (Optional)
                </Typography>
                <Paper
                    elevation={0}
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        overflow: 'hidden',
                    }}
                >
                    <TextField
                        value={config.css ?? ''}
                        onChange={(e) => onChange({ css: e.target.value })}
                        multiline
                        rows={6}
                        fullWidth
                        placeholder={`.custom-section {
  padding: 2rem;
  text-align: center;
}

.custom-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}`}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                            },
                        }}
                    />
                </Paper>
            </Box>

            <Box
                sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    <strong>Tips:</strong>
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, mt: 1 }}>
                    <Typography component="li" variant="body2" color="text.secondary">
                        Use unique class names to avoid CSS conflicts
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                        Avoid inline scripts for security
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                        Test in preview before publishing
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
