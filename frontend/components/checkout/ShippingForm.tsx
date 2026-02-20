'use client';

import { Box, Grid, TextField, Typography, MenuItem, Chip } from '@mui/material';

// All 64 districts of Bangladesh, grouped
const DHAKA_DISTRICTS = [
    'Dhaka',
    'Gazipur',
    'Narayanganj',
    'Tangail',
    'Munshiganj',
    'Manikganj',
    'Narsingdi',
    'Kishoreganj',
    'Madaripur',
    'Gopalganj',
    'Faridpur',
    'Rajbari',
    'Shariatpur',
];

const OTHER_DISTRICTS = [
    // Chittagong Division
    'Chattogram', 'Comilla', "Cox's Bazar", 'Feni', 'Khagrachhari', 'Lakshmipur',
    'Noakhali', 'Rangamati', 'Brahmanbaria', 'Chandpur', 'Bandarban',
    // Rajshahi Division
    'Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Natore', 'Nawabganj', 'Naogaon', 'Joypurhat',
    // Khulna Division
    'Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Magura', 'Kushtia', 'Chuadanga',
    'Meherpur', 'Jhenaidah',
    // Barishal Division
    'Barishal', 'Patuakhali', 'Pirojpur', 'Bhola', 'Jhalokati', 'Barguna',
    // Sylhet Division
    'Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj',
    // Rangpur Division
    'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari',
    'Panchagarh', 'Thakurgaon',
    // Mymensingh Division
    'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur',
];

export const ALL_DISTRICTS = [...DHAKA_DISTRICTS, ...OTHER_DISTRICTS];

/** Returns true if a city string is considered inside Dhaka */
export function isDhakaCity(city: string): boolean {
    const normalized = city.trim().toLowerCase();
    return DHAKA_DISTRICTS.some((d) => d.toLowerCase() === normalized) || normalized.includes('dhaka') || normalized.includes('ঢাকা');
}

interface FormData {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    zipCode: string;
    [key: string]: string;
}

interface ShippingFormProps {
    formData: FormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => void;
    formErrors?: Record<string, string>;
}

const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '6px',
        bgcolor: '#FAFAFA',
        fontSize: '0.95rem',
        transition: 'all 0.15s ease',
        '&:hover': {
            bgcolor: '#F5F5F5',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#BDBDBD',
            },
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E0E0E0',
        },
        '&.Mui-focused': {
            bgcolor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary)',
            },
        },
    },
    '& .MuiInputLabel-root': {
        fontSize: '0.88rem',
        '&.Mui-focused': {
            color: 'var(--color-primary)',
        },
    },
};

export default function ShippingForm({ formData, handleChange, formErrors = {} }: ShippingFormProps) {
    return (
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <Box display="flex" flexDirection="column" gap={2.5}>
                {/* Full Name */}
                <Grid container spacing={2}>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            id="lastName"
                            name="lastName"
                            label="Full Name / Last Name"
                            placeholder="Enter your name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            fullWidth
                            size="medium"
                            error={!!formErrors.lastName}
                            helperText={formErrors.lastName || 'Required for delivery'}
                            sx={inputSx}
                        />
                    </Grid>
                </Grid>

                {/* Street Address */}
                <TextField
                    id="street"
                    name="street"
                    label="Full Address"
                    placeholder="House no, Road no, Area, Landmark"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={3}
                    size="medium"
                    error={!!formErrors.street}
                    helperText={formErrors.street || 'Include house number, road, and landmark for easy delivery'}
                    sx={inputSx}
                />

                {/* City (District dropdown) and Postal Code */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 7 }}>
                        <TextField
                            id="city"
                            name="city"
                            label="District / City"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            fullWidth
                            select
                            size="medium"
                            error={!!formErrors.city}
                            helperText={
                                formErrors.city ||
                                (formData.city
                                    ? isDhakaCity(formData.city)
                                        ? '📍 Inside Dhaka — Shipping ৳70'
                                        : '📍 Outside Dhaka — Shipping ৳130'
                                    : 'Select your district')
                            }
                            sx={inputSx}
                        >
                            <MenuItem disabled value="">
                                <em>Select District</em>
                            </MenuItem>
                            <MenuItem
                                disabled
                                sx={{
                                    opacity: 1,
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    color: 'var(--color-primary)',
                                    pointerEvents: 'none',
                                    mt: 1,
                                    letterSpacing: 1,
                                    textTransform: 'uppercase',
                                }}
                            >
                                Dhaka Division
                            </MenuItem>
                            {DHAKA_DISTRICTS.map((district) => (
                                <MenuItem key={district} value={district} sx={{ py: 1.25 }}>
                                    <Box display="flex" alignItems="center" gap={1} width="100%">
                                        <Typography variant="body2">{district}</Typography>
                                        <Chip
                                            label="৳70"
                                            size="small"
                                            sx={{
                                                ml: 'auto',
                                                fontSize: '0.65rem',
                                                height: 20,
                                                bgcolor: 'rgba(var(--color-primary-rgb), 0.1)',
                                                color: 'var(--color-primary)',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                </MenuItem>
                            ))}
                            <MenuItem
                                disabled
                                sx={{
                                    opacity: 1,
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    color: 'text.secondary',
                                    pointerEvents: 'none',
                                    mt: 1,
                                    letterSpacing: 1,
                                    textTransform: 'uppercase',
                                }}
                            >
                                Other Districts
                            </MenuItem>
                            {OTHER_DISTRICTS.map((district) => (
                                <MenuItem key={district} value={district} sx={{ py: 1.25 }}>
                                    <Box display="flex" alignItems="center" gap={1} width="100%">
                                        <Typography variant="body2">{district}</Typography>
                                        <Chip
                                            label="৳130"
                                            size="small"
                                            sx={{
                                                ml: 'auto',
                                                fontSize: '0.65rem',
                                                height: 20,
                                                bgcolor: 'grey.100',
                                                color: 'text.secondary',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                            id="zipCode"
                            name="zipCode"
                            label="Postal Code"
                            placeholder="e.g. 1205"
                            value={formData.zipCode}
                            onChange={handleChange}
                            fullWidth
                            size="medium"
                            helperText="(Optional)"
                            sx={inputSx}
                        />
                    </Grid>
                </Grid>
            </Box>
        </fieldset>
    );
}
