'use client';

import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Box,
    Slider,
    Typography,
} from '@mui/material';
import { ProductGridConfig } from '@/lib/types/pageBuilder';

interface ProductGridEditorProps {
    config: ProductGridConfig;
    onChange: (config: Partial<ProductGridConfig>) => void;
}

export function ProductGridEditor({ config, onChange }: ProductGridEditorProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth size="small">
                <InputLabel>Product Type</InputLabel>
                <Select
                    value={config.productType}
                    label="Product Type"
                    onChange={(e) =>
                        onChange({ productType: e.target.value as ProductGridConfig['productType'] })
                    }
                >
                    <MenuItem value="featured">Featured Products</MenuItem>
                    <MenuItem value="best_sellers">Best Sellers</MenuItem>
                    <MenuItem value="new_arrivals">New Arrivals</MenuItem>
                    <MenuItem value="sale">On Sale</MenuItem>
                </Select>
            </FormControl>

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Number of Products: <strong>{config.limit}</strong>
                </Typography>
                <Slider
                    value={config.limit}
                    onChange={(_, value) => onChange({ limit: value as number })}
                    min={1}
                    max={24}
                    marks={[
                        { value: 4, label: '4' },
                        { value: 8, label: '8' },
                        { value: 12, label: '12' },
                        { value: 16, label: '16' },
                        { value: 24, label: '24' },
                    ]}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Box>

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Grid Columns: <strong>{config.columns}</strong>
                </Typography>
                <Slider
                    value={config.columns}
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
                        checked={config.showPrices !== false}
                        onChange={(e) => onChange({ showPrices: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Prices
                    </Typography>
                }
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={config.showTabs === true}
                        onChange={(e) => onChange({ showTabs: e.target.checked })}
                        color="primary"
                    />
                }
                label={
                    <Typography variant="body2" color="text.primary">
                        Show Category Tabs
                    </Typography>
                }
            />
        </Box>
    );
}
