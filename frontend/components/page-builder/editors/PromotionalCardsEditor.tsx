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
import { PromotionalCardsConfig, PromoCardItem } from '@/lib/types/pageBuilder';

interface PromotionalCardsEditorProps {
    config: PromotionalCardsConfig;
    onChange: (config: Partial<PromotionalCardsConfig>) => void;
}

const DEFAULT_PROMO_CARD: PromoCardItem = {
    title: 'New Promotion',
    subtitle: 'Limited time offer',
    imageUrl: '',
    linkUrl: '',
};

export function PromotionalCardsEditor({ config, onChange }: PromotionalCardsEditorProps) {
    const theme = useTheme();
    const cards = config.cards ?? [];

    const addCard = () => {
        const newCard: PromoCardItem = { ...DEFAULT_PROMO_CARD };
        onChange({ cards: [...cards, newCard] });
    };

    const updateCard = (index: number, updates: Partial<PromoCardItem>) => {
        const newCards = cards.map((c, i) =>
            i === index ? { ...c, ...updates } : c
        );
        onChange({ cards: newCards });
    };

    const removeCard = (index: number) => {
        onChange({ cards: cards.filter((_, i) => i !== index) });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
                label="Section Title"
                value={config.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Special Offers"
                fullWidth
                size="small"
                helperText="Leave empty to hide title"
            />

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Columns: <strong>{config.columns ?? 2}</strong>
                </Typography>
                <Slider
                    value={config.columns ?? 2}
                    onChange={(_, value) => onChange({ columns: value as number })}
                    min={1}
                    max={4}
                    marks={[
                        { value: 1, label: '1' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3' },
                        { value: 4, label: '4' },
                    ]}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Box>

            <FormControlLabel
                control={
                    <Switch
                        checked={config.fullWidth === true}
                        onChange={(e) => onChange({ fullWidth: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Full Width Cards
                    </Typography>
                }
            />

            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.primary">
                        Promotional Cards ({cards.length})
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={addCard}
                        variant="outlined"
                    >
                        Add Card
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cards.map((card, index) => (
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
                                    Card {index + 1}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => removeCard(index)}
                                    sx={{ color: theme.palette.error.main }}
                                >
                                    <DeleteOutline fontSize="small" />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Title"
                                    value={card.title}
                                    onChange={(e) => updateCard(index, { title: e.target.value })}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Subtitle"
                                    value={card.subtitle ?? ''}
                                    onChange={(e) => updateCard(index, { subtitle: e.target.value })}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Description"
                                    value={card.description ?? ''}
                                    onChange={(e) => updateCard(index, { description: e.target.value })}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Image URL"
                                    value={card.imageUrl ?? ''}
                                    onChange={(e) => updateCard(index, { imageUrl: e.target.value })}
                                    placeholder="https://example.com/promo.jpg"
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Link URL"
                                    value={card.linkUrl ?? ''}
                                    onChange={(e) => updateCard(index, { linkUrl: e.target.value })}
                                    placeholder="/shop/collection-name"
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Button Text"
                                    value={card.buttonText ?? ''}
                                    onChange={(e) => updateCard(index, { buttonText: e.target.value })}
                                    placeholder="Shop Now"
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Background Color"
                                    value={card.backgroundColor ?? ''}
                                    onChange={(e) => updateCard(index, { backgroundColor: e.target.value })}
                                    placeholder="#ffffff"
                                    fullWidth
                                    size="small"
                                    helperText="Hex color code"
                                />
                            </Box>
                        </Paper>
                    ))}

                    {cards.length === 0 && (
                        <Box
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                border: `2px dashed ${theme.palette.divider}`,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                No promotional cards yet. Click &quot;Add Card&quot; to create one.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
