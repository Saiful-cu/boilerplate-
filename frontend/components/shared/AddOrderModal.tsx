'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api, { getAssetUrl } from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        phone?: string;
    };
    savedAddresses?: Array<{
        label?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        isDefault?: boolean;
    }>;
}

interface Product {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    stock?: number;
}

interface OrderItem {
    product: string;
    productName: string;
    productImage?: string;
    quantity: number;
    price: number;
}

interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface UserAddress extends ShippingAddress {
    label: string;
    isDefault?: boolean;
    isMain?: boolean;
}

interface OrderFormData {
    user: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    shippingMethod: string;
    shippingCost: number;
    createNewCustomer: boolean;
}

interface FormErrors {
    items?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
}

interface AddOrderModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: OrderFormData & { totalAmount: number }) => Promise<void>;
}

const INITIAL_ADDRESS: ShippingAddress = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
};

function formatMoney(value: number): string {
    return `৳${Number(value || 0).toLocaleString()}`;
}

export default function AddOrderModal({ open, onClose, onSave }: AddOrderModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchUser, setSearchUser] = useState('');
    const [searchProduct, setSearchProduct] = useState('');
    const [selectedUserAddresses, setSelectedUserAddresses] = useState<UserAddress[]>([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<OrderFormData>({
        user: '',
        items: [],
        shippingAddress: { ...INITIAL_ADDRESS },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        shippingMethod: 'inside_dhaka',
        shippingCost: 70,
        createNewCustomer: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (open) {
            fetchUsers();
            fetchProducts();
        }
    }, [open]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            const data = res.data?.data || res.data || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            const data = res.data?.products || res.data || [];
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    const handleChange = (field: string, value: string) => {
        if (field.startsWith('shippingAddress.')) {
            const addrField = field.split('.')[1] as keyof ShippingAddress;
            setFormData((prev) => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, [addrField]: value },
            }));
            // Clear error on change
            if (errors[addrField as keyof FormErrors]) {
                setErrors((prev) => ({ ...prev, [addrField]: undefined }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    const handleUserSelect = (userId: string) => {
        const selectedUser = users.find((u) => u._id === userId);
        if (!selectedUser) return;

        const addresses: UserAddress[] = [];

        // Add main address if exists
        if (selectedUser.address?.street) {
            addresses.push({
                label: 'Main Address',
                firstName: selectedUser.name?.split(' ')[0] || '',
                lastName: selectedUser.name?.split(' ').slice(1).join(' ') || '',
                email: selectedUser.email || '',
                phone: selectedUser.phone || selectedUser.address.phone || '',
                street: selectedUser.address.street || '',
                city: selectedUser.address.city || '',
                state: selectedUser.address.state || '',
                zipCode: selectedUser.address.zipCode || '',
                country: selectedUser.address.country || 'Bangladesh',
                isMain: true,
            });
        }

        // Add saved addresses
        if (selectedUser.savedAddresses?.length) {
            selectedUser.savedAddresses.forEach((addr) => {
                addresses.push({
                    label: addr.label || 'Saved Address',
                    firstName: addr.firstName || selectedUser.name?.split(' ')[0] || '',
                    lastName: addr.lastName || selectedUser.name?.split(' ').slice(1).join(' ') || '',
                    email: selectedUser.email || '',
                    phone: addr.phone || selectedUser.phone || '',
                    street: addr.street || '',
                    city: addr.city || '',
                    state: addr.state || '',
                    zipCode: addr.zipCode || '',
                    country: addr.country || 'Bangladesh',
                    isDefault: addr.isDefault,
                });
            });
        }

        setSelectedUserAddresses(addresses);

        let defaultIndex = addresses.findIndex((a) => a.isDefault);
        if (defaultIndex === -1) defaultIndex = 0;
        setSelectedAddressIndex(addresses.length > 0 ? defaultIndex : null);

        if (addresses.length > 0) {
            const addr = addresses[defaultIndex];
            if (addr) {
                setFormData((prev) => ({
                    ...prev,
                    user: userId,
                    createNewCustomer: false,
                    shippingAddress: {
                        firstName: addr.firstName,
                        lastName: addr.lastName,
                        email: addr.email,
                        phone: addr.phone,
                        street: addr.street,
                        city: addr.city,
                        state: addr.state,
                        zipCode: addr.zipCode,
                        country: addr.country,
                    },
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                user: userId,
                createNewCustomer: false,
                shippingAddress: {
                    firstName: selectedUser.name?.split(' ')[0] || '',
                    lastName: selectedUser.name?.split(' ').slice(1).join(' ') || '',
                    email: selectedUser.email || '',
                    phone: selectedUser.phone || '',
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'Bangladesh',
                },
            }));
        }
        setSearchUser('');
    };

    const handleAddressSelect = (index: number) => {
        setSelectedAddressIndex(index);
        const addr = selectedUserAddresses[index];
        if (addr) {
            setFormData((prev) => ({
                ...prev,
                shippingAddress: {
                    firstName: addr.firstName,
                    lastName: addr.lastName,
                    email: addr.email,
                    phone: addr.phone,
                    street: addr.street,
                    city: addr.city,
                    state: addr.state,
                    zipCode: addr.zipCode,
                    country: addr.country,
                },
            }));
        }
    };

    const handleCreateNewCustomer = () => {
        setSelectedUserAddresses([]);
        setSelectedAddressIndex(null);
        setFormData((prev) => ({
            ...prev,
            user: '',
            createNewCustomer: true,
            shippingAddress: { ...INITIAL_ADDRESS },
        }));
    };

    const handleAddItem = (product: Product) => {
        const existing = formData.items.find((i) => i.product === product._id);
        if (existing) {
            setFormData((prev) => ({
                ...prev,
                items: prev.items.map((i) =>
                    i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i
                ),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                items: [
                    ...prev.items,
                    {
                        product: product._id,
                        productName: product.name,
                        productImage: product.images?.[0],
                        quantity: 1,
                        price: product.price,
                    },
                ],
            }));
        }
        setSearchProduct('');
        if (errors.items) setErrors((prev) => ({ ...prev, items: undefined }));
    };

    const handleRemoveItem = (productId: string) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((i) => i.product !== productId),
        }));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((i) =>
                i.product === productId ? { ...i, quantity } : i
            ),
        }));
    };

    const calculateSubtotal = () =>
        formData.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const calculateTotal = () => calculateSubtotal() + formData.shippingCost;

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (formData.items.length === 0) {
            newErrors.items = 'Please add at least one product';
        }

        if (!formData.shippingAddress.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.shippingAddress.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (formData.createNewCustomer || !formData.user) {
            if (!formData.shippingAddress.email) {
                newErrors.email = 'Email is required for new customers';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shippingAddress.email)) {
                newErrors.email = 'Please enter a valid email';
            }
        }

        if (!formData.shippingAddress.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^01[0-9]{9}$/.test(formData.shippingAddress.phone.replace(/[^0-9]/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.shippingAddress.street.trim()) {
            newErrors.street = 'Street address is required';
        }

        if (!formData.shippingAddress.city.trim()) {
            newErrors.city = 'City is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            await onSave({
                ...formData,
                totalAmount: calculateTotal(),
            });
            // Reset form
            setFormData({
                user: '',
                items: [],
                shippingAddress: { ...INITIAL_ADDRESS },
                paymentMethod: 'cash_on_delivery',
                paymentStatus: 'pending',
                orderStatus: 'pending',
                shippingMethod: 'inside_dhaka',
                shippingCost: 70,
                createNewCustomer: false,
            });
            setSelectedUserAddresses([]);
            setSelectedAddressIndex(null);
            setErrors({});
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    const filteredProducts = products.filter((p) =>
        p.name?.toLowerCase().includes(searchProduct.toLowerCase())
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { maxHeight: '90vh' } }}
        >
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <ShoppingCartIcon />
                    <span>Create New Order</span>
                </Stack>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Left Column - Customer & Shipping */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Stack spacing={3}>
                            {/* Customer Selection */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    bgcolor: 'primary.50',
                                    borderColor: 'primary.200',
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ mb: 2 }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PersonIcon color="primary" />
                                        <Typography fontWeight={700}>Customer</Typography>
                                    </Stack>
                                    <Button
                                        size="small"
                                        variant={formData.createNewCustomer ? 'contained' : 'outlined'}
                                        color={formData.createNewCustomer ? 'success' : 'primary'}
                                        startIcon={<PersonAddIcon />}
                                        onClick={handleCreateNewCustomer}
                                    >
                                        {formData.createNewCustomer ? 'Creating New' : 'Create New'}
                                    </Button>
                                </Stack>

                                {!formData.createNewCustomer && (
                                    <>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Search customer by name or email..."
                                            value={searchUser}
                                            onChange={(e) => setSearchUser(e.target.value)}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                            sx={{ mb: 2, bgcolor: 'white' }}
                                        />

                                        {loading ? (
                                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                                <CircularProgress size={24} />
                                            </Box>
                                        ) : (
                                            <Collapse in={searchUser.length > 0}>
                                                <Box
                                                    sx={{
                                                        maxHeight: 180,
                                                        overflowY: 'auto',
                                                    }}
                                                >
                                                    {filteredUsers.slice(0, 5).map((user) => (
                                                        <Paper
                                                            key={user._id}
                                                            variant="outlined"
                                                            onClick={() => handleUserSelect(user._id)}
                                                            sx={{
                                                                p: 1.5,
                                                                mb: 1,
                                                                cursor: 'pointer',
                                                                bgcolor:
                                                                    formData.user === user._id
                                                                        ? 'primary.100'
                                                                        : 'white',
                                                                borderColor:
                                                                    formData.user === user._id
                                                                        ? 'primary.main'
                                                                        : 'divider',
                                                                borderWidth:
                                                                    formData.user === user._id ? 2 : 1,
                                                                '&:hover': { bgcolor: 'action.hover' },
                                                            }}
                                                        >
                                                            <Typography fontWeight={600}>
                                                                {user.name}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {user.email}
                                                            </Typography>
                                                        </Paper>
                                                    ))}
                                                    {filteredUsers.length === 0 && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ textAlign: 'center', py: 2 }}
                                                        >
                                                            No customers found
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Collapse>
                                        )}

                                        {formData.user && (
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    mt: 1,
                                                    bgcolor: 'success.50',
                                                    borderColor: 'success.main',
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="success.dark"
                                                    fontWeight={600}
                                                >
                                                    ✓ Customer Selected:{' '}
                                                    {users.find((u) => u._id === formData.user)?.name}
                                                </Typography>
                                            </Paper>
                                        )}
                                    </>
                                )}

                                {formData.createNewCustomer && (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            bgcolor: 'success.50',
                                            borderColor: 'success.main',
                                        }}
                                    >
                                        <Typography variant="body2" color="success.dark">
                                            ✓ A new customer will be created with the shipping
                                            address details below.
                                        </Typography>
                                    </Paper>
                                )}
                            </Paper>

                            {/* Shipping Address */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    bgcolor: 'secondary.50',
                                    borderColor: 'secondary.200',
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ mb: 2 }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LocationOnIcon color="secondary" />
                                        <Typography fontWeight={700}>Shipping Address</Typography>
                                    </Stack>
                                    {selectedUserAddresses.length > 1 && (
                                        <FormControl size="small" sx={{ minWidth: 160 }}>
                                            <Select
                                                value={selectedAddressIndex ?? 0}
                                                onChange={(e) =>
                                                    handleAddressSelect(Number(e.target.value))
                                                }
                                            >
                                                {selectedUserAddresses.map((addr, idx) => (
                                                    <MenuItem key={idx} value={idx}>
                                                        {addr.label}
                                                        {addr.isDefault ? ' (Default)' : ''}
                                                        {addr.isMain ? ' (Main)' : ''}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </Stack>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="First Name"
                                            required
                                            value={formData.shippingAddress.firstName}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.firstName', e.target.value)
                                            }
                                            error={!!errors.firstName}
                                            helperText={errors.firstName}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Last Name"
                                            required
                                            value={formData.shippingAddress.lastName}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.lastName', e.target.value)
                                            }
                                            error={!!errors.lastName}
                                            helperText={errors.lastName}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Email"
                                            type="email"
                                            required={formData.createNewCustomer || !formData.user}
                                            value={formData.shippingAddress.email}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.email', e.target.value)
                                            }
                                            error={!!errors.email}
                                            helperText={errors.email}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Phone"
                                            required
                                            placeholder="01XXXXXXXXX"
                                            value={formData.shippingAddress.phone}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.phone', e.target.value)
                                            }
                                            error={!!errors.phone}
                                            helperText={errors.phone}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Street Address"
                                            required
                                            multiline
                                            rows={2}
                                            value={formData.shippingAddress.street}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.street', e.target.value)
                                            }
                                            error={!!errors.street}
                                            helperText={errors.street}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="City"
                                            required
                                            value={formData.shippingAddress.city}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.city', e.target.value)
                                            }
                                            error={!!errors.city}
                                            helperText={errors.city}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="State/Division"
                                            value={formData.shippingAddress.state}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.state', e.target.value)
                                            }
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Zip Code"
                                            value={formData.shippingAddress.zipCode}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.zipCode', e.target.value)
                                            }
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Country"
                                            value={formData.shippingAddress.country}
                                            onChange={(e) =>
                                                handleChange('shippingAddress.country', e.target.value)
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Payment & Shipping Settings */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    bgcolor: 'success.50',
                                    borderColor: 'success.200',
                                }}
                            >
                                <Typography fontWeight={700} sx={{ mb: 2 }}>
                                    Payment & Shipping
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Payment Method</InputLabel>
                                            <Select
                                                value={formData.paymentMethod}
                                                label="Payment Method"
                                                onChange={(e) =>
                                                    handleChange('paymentMethod', e.target.value)
                                                }
                                            >
                                                <MenuItem value="cash_on_delivery">
                                                    Cash on Delivery
                                                </MenuItem>
                                                <MenuItem value="credit_card">Credit Card</MenuItem>
                                                <MenuItem value="bkash">bKash</MenuItem>
                                                <MenuItem value="nagad">Nagad</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Shipping Method</InputLabel>
                                            <Select
                                                value={formData.shippingMethod}
                                                label="Shipping Method"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleChange('shippingMethod', val);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        shippingCost:
                                                            val === 'inside_dhaka' ? 70 : 150,
                                                    }));
                                                }}
                                            >
                                                <MenuItem value="inside_dhaka">
                                                    Inside Dhaka - ৳70
                                                </MenuItem>
                                                <MenuItem value="outside_dhaka">
                                                    Outside Dhaka - ৳150
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Right Column - Products */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Stack spacing={3}>
                            {/* Add Products */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    bgcolor: 'warning.50',
                                    borderColor: 'warning.200',
                                }}
                            >
                                <Typography fontWeight={700} sx={{ mb: 2 }}>
                                    Add Products
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search products..."
                                    value={searchProduct}
                                    onChange={(e) => setSearchProduct(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    sx={{ mb: 2, bgcolor: 'white' }}
                                />

                                <Collapse in={searchProduct.length > 0}>
                                    <Box sx={{ maxHeight: 220, overflowY: 'auto', mb: 2 }}>
                                        {filteredProducts.slice(0, 8).map((product) => (
                                            <Paper
                                                key={product._id}
                                                variant="outlined"
                                                onClick={() => handleAddItem(product)}
                                                sx={{
                                                    p: 1.5,
                                                    mb: 1,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    '&:hover': { bgcolor: 'warning.100' },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 1,
                                                        overflow: 'hidden',
                                                        bgcolor: 'grey.200',
                                                    }}
                                                >
                                                    {product.images?.[0] && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={getAssetUrl(product.images[0])}
                                                            alt={product.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography fontWeight={600}>
                                                        {product.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {formatMoney(product.price)}
                                                    </Typography>
                                                </Box>
                                                <AddIcon color="warning" />
                                            </Paper>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ textAlign: 'center', py: 2 }}
                                            >
                                                No products found
                                            </Typography>
                                        )}
                                    </Box>
                                </Collapse>

                                {errors.items && (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            bgcolor: 'error.50',
                                            borderColor: 'error.main',
                                        }}
                                    >
                                        <Typography variant="body2" color="error">
                                            {errors.items}
                                        </Typography>
                                    </Paper>
                                )}
                            </Paper>

                            {/* Selected Products */}
                            <Paper variant="outlined" sx={{ p: 2.5 }}>
                                <Typography fontWeight={700} sx={{ mb: 2 }}>
                                    Order Items
                                </Typography>
                                {formData.items.length === 0 ? (
                                    <Typography
                                        color="text.secondary"
                                        sx={{ textAlign: 'center', py: 4 }}
                                    >
                                        No products added yet
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {formData.items.map((item) => (
                                            <Paper
                                                key={item.product}
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    bgcolor: 'grey.50',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: 1,
                                                        overflow: 'hidden',
                                                        bgcolor: 'grey.200',
                                                    }}
                                                >
                                                    {item.productImage && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={getAssetUrl(item.productImage)}
                                                            alt={item.productName}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography fontWeight={600} noWrap>
                                                        {item.productName}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {formatMoney(item.price)} each
                                                    </Typography>
                                                </Box>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleQuantityChange(
                                                            item.product,
                                                            parseInt(e.target.value) || 1
                                                        )
                                                    }
                                                    slotProps={{
                                                        htmlInput: { min: 1, style: { textAlign: 'center' } },
                                                    }}
                                                    sx={{ width: 70 }}
                                                />
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleRemoveItem(item.product)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                                <Typography fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>
                                                    {formatMoney(item.price * item.quantity)}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>

                            {/* Order Summary */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    background:
                                        'linear-gradient(135deg, #EBF8FF 0%, #E0E7FF 100%)',
                                    borderColor: 'primary.200',
                                }}
                            >
                                <Typography fontWeight={700} sx={{ mb: 2 }}>
                                    Order Summary
                                </Typography>
                                <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Subtotal</Typography>
                                        <Typography>{formatMoney(calculateSubtotal())}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Shipping</Typography>
                                        <Typography>
                                            {formatMoney(formData.shippingCost)}
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ my: 1 }} />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography fontWeight={700} variant="h6">
                                            Total
                                        </Typography>
                                        <Typography fontWeight={700} variant="h6" color="primary">
                                            {formatMoney(calculateTotal())}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? 'Creating...' : 'Create Order'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
