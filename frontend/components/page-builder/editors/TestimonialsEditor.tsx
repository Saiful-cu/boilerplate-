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
    Rating,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Add from '@mui/icons-material/Add';
import { TestimonialsConfig, TestimonialItem } from '@/lib/types/pageBuilder';

interface TestimonialsEditorProps {
    config: TestimonialsConfig;
    onChange: (config: Partial<TestimonialsConfig>) => void;
}

const DEFAULT_TESTIMONIAL: TestimonialItem = {
    name: 'Customer Name',
    text: 'Great product and excellent service!',
    rating: 5,
};

export function TestimonialsEditor({ config, onChange }: TestimonialsEditorProps) {
    const theme = useTheme();
    const testimonials = config.testimonials ?? [];

    const addTestimonial = () => {
        const newTestimonial: TestimonialItem = { ...DEFAULT_TESTIMONIAL };
        onChange({ testimonials: [...testimonials, newTestimonial] });
    };

    const updateTestimonial = (index: number, updates: Partial<TestimonialItem>) => {
        const newTestimonials = testimonials.map((t, i) =>
            i === index ? { ...t, ...updates } : t
        );
        onChange({ testimonials: newTestimonials });
    };

    const removeTestimonial = (index: number) => {
        onChange({ testimonials: testimonials.filter((_, i) => i !== index) });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
                label="Section Title"
                value={config.title ?? ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="What Our Customers Say"
                fullWidth
                size="small"
            />

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Visible Testimonials: <strong>{config.visibleCount ?? 3}</strong>
                </Typography>
                <Slider
                    value={config.visibleCount ?? 3}
                    onChange={(_, value) => onChange({ visibleCount: value as number })}
                    min={1}
                    max={6}
                    marks={[
                        { value: 1, label: '1' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3' },
                        { value: 4, label: '4' },
                        { value: 6, label: '6' },
                    ]}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Box>

            <FormControlLabel
                control={
                    <Switch
                        checked={config.autoPlay !== false}
                        onChange={(e) => onChange({ autoPlay: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Auto-play Carousel
                    </Typography>
                }
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={config.showRating !== false}
                        onChange={(e) => onChange({ showRating: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Star Ratings
                    </Typography>
                }
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={config.showAvatar === true}
                        onChange={(e) => onChange({ showAvatar: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Customer Avatars
                    </Typography>
                }
            />

            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.primary">
                        Testimonials ({testimonials.length})
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={addTestimonial}
                        variant="outlined"
                    >
                        Add
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {testimonials.map((testimonial, index) => (
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
                                    Testimonial {index + 1}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => removeTestimonial(index)}
                                    sx={{ color: theme.palette.error.main }}
                                >
                                    <DeleteOutline fontSize="small" />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Customer Name"
                                    value={testimonial.name}
                                    onChange={(e) => updateTestimonial(index, { name: e.target.value })}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Review Text"
                                    value={testimonial.text}
                                    onChange={(e) => updateTestimonial(index, { text: e.target.value })}
                                    multiline
                                    rows={3}
                                    fullWidth
                                    size="small"
                                />

                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Rating
                                    </Typography>
                                    <Rating
                                        value={testimonial.rating ?? 5}
                                        onChange={(_, value) => updateTestimonial(index, { rating: value ?? 5 })}
                                        size="large"
                                    />
                                </Box>

                                <TextField
                                    label="Avatar URL (optional)"
                                    value={testimonial.avatar ?? ''}
                                    onChange={(e) => updateTestimonial(index, { avatar: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Role/Title (optional)"
                                    value={testimonial.role ?? ''}
                                    onChange={(e) => updateTestimonial(index, { role: e.target.value })}
                                    placeholder="Verified Customer"
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
