'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Card,
    CardContent,
    Grid,
    Chip,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Address {
    _id: string;
    label: string;
    firstName?: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    zipCode?: string;
    country: string;
    type: string;
    isDefault: boolean;
}

interface FormData {
    label: string;
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    zipCode: string;
    country: string;
    type: string;
    isDefault: boolean;
}

const defaultFormData: FormData = {
    label: '',
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
    country: 'Bangladesh',
    type: 'both',
    isDefault: false,
};

export default function AddressManager() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({ ...defaultFormData });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/auth/addresses');
            setAddresses(response.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await api.put(`/auth/addresses/${editingId}`, formData);
            } else {
                await api.post('/auth/addresses', formData);
            }

            await fetchAddresses();
            resetForm();
            toast.success(editingId ? 'Address updated successfully!' : 'Address added successfully!');
        } catch (error) {
            toast.error('Error saving address. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (address: Address) => {
        setFormData({
            label: address.label,
            firstName: address.firstName || '',
            lastName: address.lastName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            zipCode: address.zipCode || '',
            country: address.country,
            type: address.type,
            isDefault: address.isDefault,
        });
        setEditingId(address._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await api.delete(`/auth/addresses/${id}`);
            await fetchAddresses();
            toast.success('Address deleted successfully!');
        } catch (error) {
            toast.error('Error deleting address. Please try again.');
            console.error(error);
        }
    };

    const resetForm = () => {
        setFormData({ ...defaultFormData });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" fontWeight={700} fontSize={{ xs: '1.25rem', sm: '1.5rem' }}>📍 Saved Addresses</Typography>
                <Button
                    variant={showForm ? 'outlined' : 'contained'}
                    startIcon={showForm ? <CloseIcon /> : <AddIcon />}
                    onClick={() => setShowForm(!showForm)}
                    sx={{ textTransform: 'none' }}
                >
                    {showForm ? 'Cancel' : 'Add Address'}
                </Button>
            </Box>

            {showForm && (
                <Paper
                    variant="outlined"
                    sx={{ p: 3, borderWidth: 2, borderColor: 'var(--color-primary)', borderRadius: 3 }}
                >
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        {editingId ? 'Edit Address' : 'New Address'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Address Label"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g., Home, Office"
                                    required
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Type *</InputLabel>
                                    <Select
                                        value={formData.type}
                                        label="Type *"
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <MenuItem value="both">Shipping &amp; Billing</MenuItem>
                                        <MenuItem value="shipping">Shipping Only</MenuItem>
                                        <MenuItem value="billing">Billing Only</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="First name"
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Last name"
                                    required
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="01XXX-XXXXXX"
                                    required
                                    fullWidth
                                    size="small"
                                    type="tel"
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    label="Street Address"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    placeholder="House number, building, street name"
                                    required
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="City name"
                                    required
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Postal Code"
                                    value={formData.zipCode}
                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                    placeholder="Postal code"
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                            <Grid size={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.isDefault}
                                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        />
                                    }
                                    label="Set as default address"
                                />
                            </Grid>
                            <Grid size={12}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        startIcon={editingId ? <SaveIcon /> : <AddIcon />}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {loading ? 'Saving...' : editingId ? 'Update' : 'Add Address'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={resetForm}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            )}

            <Grid container spacing={2}>
                {addresses.length === 0 ? (
                    <Grid size={12}>
                        <Paper sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography color="text.secondary" variant="body1">No saved addresses yet</Typography>
                            <Typography color="text.disabled" variant="body2">Add an address to use during checkout</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    addresses.map((address) => (
                        <Grid size={{ xs: 12, md: 6 }} key={address._id}>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderWidth: 2,
                                    borderColor: address.isDefault ? 'success.main' : 'divider',
                                    borderRadius: 3,
                                    '&:hover': { boxShadow: 3 },
                                    transition: 'box-shadow 0.2s',
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={700}>{address.label}</Typography>
                                            {address.isDefault && (
                                                <Chip
                                                    label="✓ Default"
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                    sx={{ mt: 0.5, height: 24, fontSize: '0.7rem' }}
                                                />
                                            )}
                                        </Box>
                                        <Chip
                                            label={
                                                address.type === 'both'
                                                    ? '📦 Shipping & 💳 Billing'
                                                    : address.type === 'shipping'
                                                        ? '📦 Shipping'
                                                        : '💳 Billing'
                                            }
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography variant="body2" fontWeight={500} color="text.primary">
                                            {address.firstName && `${address.firstName} `}{address.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">📞 {address.phone}</Typography>
                                        <Typography variant="body2" color="text.secondary">📍 {address.street}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {address.city}{address.zipCode && `, ${address.zipCode}`}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">{address.country}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEdit(address)}
                                            sx={{ flex: 1, textTransform: 'none' }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDelete(address._id)}
                                            sx={{ flex: 1, textTransform: 'none' }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
}
