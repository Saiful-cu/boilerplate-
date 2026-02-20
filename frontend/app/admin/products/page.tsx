'use client';

import { ChangeEvent, useEffect, useMemo, useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UploadIcon from '@mui/icons-material/Upload';
import RefreshIcon from '@mui/icons-material/Refresh';
import api, { getAssetUrl } from '@/lib/api';
import toast from 'react-hot-toast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

type ProductColor = { name: string; image?: string };
type Category = { _id: string; name: string; icon?: string };
type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  cost?: number;
  externalCost?: number;
  stock: number;
  images: string[];
  video?: string;
  featured?: boolean;
  rating?: number;
  brand?: string;
  modelNumber?: string;
  features?: string[];
  tags?: string[];
  colors?: ProductColor[];
  moq?: number;
  unitsSold?: number;
  reviewCount?: number;
  placeOfOrigin?: string;
  packaging?: string;
  leadTime?: string;
  customization?: boolean;
  weight?: string;
  volume?: string;
  certifications?: string[];
};

type ProductForm = {
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  cost: number;
  externalCost: number;
  stock: number;
  images: string[];
  video: string;
  featured: boolean;
  rating: number;
  brand: string;
  modelNumber: string;
  features: string[];
  tags: string[];
  colors: ProductColor[];
  moq: number;
  unitsSold: number;
  reviewCount: number;
  placeOfOrigin: string;
  packaging: string;
  leadTime: string;
  customization: boolean;
  weight: string;
  volume: string;
  certifications: string[];
};

type ValidationErrors = Partial<Record<keyof ProductForm, string>> & { profitLogic?: string };

const EMPTY_FORM: ProductForm = {
  name: '',
  description: '',
  category: '',
  price: 0,
  originalPrice: 0,
  cost: 0,
  externalCost: 0,
  stock: 0,
  images: [],
  video: '',
  featured: false,
  rating: 0,
  brand: '',
  modelNumber: '',
  features: [],
  tags: [],
  colors: [],
  moq: 0,
  unitsSold: 0,
  reviewCount: 0,
  placeOfOrigin: '',
  packaging: '',
  leadTime: '',
  customization: false,
  weight: '',
  volume: '',
  certifications: [],
};

const money = (value: number) => `৳${Number(value || 0).toFixed(2)}`;
const splitCSV = (value: string) => value.split(',').map((x) => x.trim()).filter(Boolean);

function validateForm(data: ProductForm): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.name.trim()) errors.name = 'Product name is required';
  if (data.name.trim().length > 200) errors.name = 'Name must be 200 characters or less';
  if (!data.description.trim()) errors.description = 'Description is required';
  if (!data.category.trim()) errors.category = 'Category is required';
  if (data.price < 0) errors.price = 'Price cannot be negative';
  if (data.originalPrice < 0) errors.originalPrice = 'Original price cannot be negative';
  if (data.cost < 0) errors.cost = 'Cost cannot be negative';
  if (data.externalCost < 0) errors.externalCost = 'External cost cannot be negative';
  if (data.stock < 0) errors.stock = 'Stock cannot be negative';
  if (data.rating < 0 || data.rating > 5) errors.rating = 'Rating must be between 0 and 5';

  const totalCost = (data.cost || 0) + (data.externalCost || 0);
  if (data.price < totalCost) {
    errors.profitLogic = `Selling price ${money(data.price)} cannot be lower than total cost ${money(totalCost)}`;
  }
  return errors;
}

function toForm(product: Product): ProductForm {
  return {
    ...EMPTY_FORM,
    ...product,
    originalPrice: product.originalPrice || 0,
    cost: product.cost || 0,
    externalCost: product.externalCost || 0,
    features: product.features || [],
    tags: product.tags || [],
    colors: product.colors || [],
    certifications: product.certifications || [],
  };
}

export default function AdminProducts() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const loadData = useCallback(async (retry = 0) => {
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories?active=true'),
      ]);
      const pData = productsRes.data?.data || productsRes.data;
      const cData = categoriesRes.data?.data || categoriesRes.data;
      setProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cData) ? cData : []);
      setRetryCount(0);
    } catch (err) {
      console.error('Error loading products:', err);
      if (retry < MAX_RETRIES) {
        setRetryCount(retry + 1);
        setTimeout(() => loadData(retry + 1), RETRY_DELAY * Math.pow(2, retry));
        return;
      }
      setError('Failed to load products data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setImgUrl('');
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(toForm(product));
    setErrors({});
    setImgUrl('');
    setDialogOpen(true);
  };

  const handleField = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'number' ? Number(value || 0) :
        type === 'checkbox' ? (e.target as HTMLInputElement).checked :
        value,
    }));
  };

  const setArrayField = (field: 'features' | 'tags' | 'certifications', value: string) => {
    setForm((prev) => ({ ...prev, [field]: splitCSV(value) }));
  };

  const addColor = () => setForm((s) => ({ ...s, colors: [...s.colors, { name: '', image: '' }] }));
  const removeColor = (idx: number) => setForm((s) => ({ ...s, colors: s.colors.filter((_, i) => i !== idx) }));
  const updateColor = (idx: number, key: keyof ProductColor, value: string) => {
    setForm((s) => {
      const next = [...s.colors];
      const existing = next[idx] ?? { name: '', image: '' };
      next[idx] = { ...existing, [key]: value };
      return { ...s, colors: next };
    });
  };

  const addImageUrl = () => {
    const value = imgUrl.trim();
    if (!value) return;
    setForm((s) => ({ ...s, images: [...s.images, value] }));
    setImgUrl('');
  };

  const removeImage = (idx: number) => setForm((s) => ({ ...s, images: s.images.filter((_, i) => i !== idx) }));

  const uploadImages = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    // Validate files
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPEG, PNG, GIF, and WebP are allowed.`);
        e.target.value = '';
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
        e.target.value = '';
        return;
      }
    }
    
    setUploadingImages(true);
    const fd = new FormData();
    for (const file of files) fd.append('images', file);
    try {
      const res = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((s) => ({ ...s, images: [...s.images, ...(res.data?.urls || [])] }));
      toast.success('Images uploaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const uploadVideo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Invalid video type. Only MP4, WebM, and OGG are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error('Video too large. Maximum size is 50MB.');
      e.target.value = '';
      return;
    }
    
    setUploadingVideo(true);
    const fd = new FormData();
    fd.append('video', file);
    try {
      const res = await api.post('/upload/video', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((s) => ({ ...s, video: res.data?.url || '' }));
      toast.success('Video uploaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Video upload failed');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const saveProduct = async () => {
    const validation = validateForm(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const payload = { ...form, colors: form.colors.filter((c) => c.name.trim()) };
      if (editing) await api.put(`/products/${editing._id}`, payload);
      else await api.post('/products', payload);
      toast.success(editing ? 'Product updated' : 'Product created');
      setDialogOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.category, p.brand, p.modelNumber].filter(Boolean).some((x) => String(x).toLowerCase().includes(q))
    );
  }, [products, search]);

  if (loading) {
    return (
      <Stack spacing={2.5}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h5" fontWeight={700}>Products</Typography>
          <Typography variant="body2" color="text.secondary">
            {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading products...'}
          </Typography>
        </Paper>
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={400} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2.5}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h5" fontWeight={700}>Products</Typography>
          <Typography variant="body2" color="text.secondary">Manage your product catalog</Typography>
        </Paper>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => { setLoading(true); loadData(0); }} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 2.5, bgcolor: 'background.paper' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={700}>Products</Typography>
            <Typography variant="body2" color="text.secondary">{products.length} products</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={() => loadData(0)}>Refresh</Button>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>Add Product</Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, category, brand, model"
        />
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Product', 'Brand/Model', 'Category', 'Price', 'Cost', 'Profit', 'Stock', 'Rating', 'Sales', 'Featured', 'Actions'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((p) => {
                const cost = (p.cost || 0) + (p.externalCost || 0);
                const profit = p.price - cost;
                return (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getAssetUrl(p.images[0])} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                        ) : null}
                        <Box>
                          <Typography fontSize={14} fontWeight={600}>{p.name}</Typography>
                          <Typography fontSize={12} color="text.secondary" sx={{ maxWidth: 220 }} noWrap>{p.description}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={13}>{p.brand || '-'}</Typography>
                      <Typography fontSize={12} color="text.secondary">{p.modelNumber || '-'}</Typography>
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <Typography fontSize={13}>{money(p.price)}</Typography>
                      {p.originalPrice && p.originalPrice > p.price ? (
                        <Typography fontSize={11} color="text.secondary" sx={{ textDecoration: 'line-through' }}>{money(p.originalPrice)}</Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{money(cost)}</TableCell>
                    <TableCell sx={{ color: profit >= 0 ? 'success.main' : 'error.main', fontWeight: 700 }}>{money(profit)}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{p.rating || 0}</TableCell>
                    <TableCell>{p.unitsSold || 0}</TableCell>
                    <TableCell><Chip size="small" label={p.featured ? 'Yes' : 'No'} color={p.featured ? 'success' : 'default'} /></TableCell>
                    <TableCell>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteProduct(p._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xl">
        <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.2}>
            {errors.profitLogic ? <Alert severity="error">{errors.profitLogic}</Alert> : null}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField name="name" label="Product Name" value={form.name} onChange={handleField} fullWidth error={!!errors.name} helperText={errors.name} />
              <TextField
                select
                name="category"
                label="Category"
                value={form.category}
                onChange={handleField}
                fullWidth
                error={!!errors.category}
                helperText={errors.category}
              >
                <MenuItem value="">Select category</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c.name}>{c.icon ? `${c.icon} ` : ''}{c.name}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField name="description" label="Description" value={form.description} onChange={handleField} fullWidth multiline minRows={2} error={!!errors.description} helperText={errors.description} />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField type="number" name="price" label="Selling Price" value={form.price} onChange={handleField} fullWidth error={!!errors.price} helperText={errors.price} />
              <TextField type="number" name="originalPrice" label="Original Price" value={form.originalPrice} onChange={handleField} fullWidth error={!!errors.originalPrice} helperText={errors.originalPrice} />
              <TextField type="number" name="cost" label="Product Cost" value={form.cost} onChange={handleField} fullWidth error={!!errors.cost} helperText={errors.cost} />
              <TextField type="number" name="externalCost" label="External Cost" value={form.externalCost} onChange={handleField} fullWidth error={!!errors.externalCost} helperText={errors.externalCost} />
              <TextField type="number" name="stock" label="Stock" value={form.stock} onChange={handleField} fullWidth error={!!errors.stock} helperText={errors.stock} />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField name="brand" label="Brand" value={form.brand} onChange={handleField} fullWidth />
              <TextField name="modelNumber" label="Model Number" value={form.modelNumber} onChange={handleField} fullWidth />
              <TextField type="number" name="rating" label="Rating (0-5)" value={form.rating} onChange={handleField} fullWidth error={!!errors.rating} helperText={errors.rating} />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField value={form.features.join(', ')} onChange={(e) => setArrayField('features', e.target.value)} label="Features (comma-separated)" fullWidth />
              <TextField value={form.tags.join(', ')} onChange={(e) => setArrayField('tags', e.target.value)} label="Tags (comma-separated)" fullWidth />
            </Stack>
            <TextField value={form.certifications.join(', ')} onChange={(e) => setArrayField('certifications', e.target.value)} label="Certifications (comma-separated)" fullWidth />

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={600}>Color Variants</Typography>
                <Button size="small" onClick={addColor}>Add Color</Button>
              </Stack>
              {form.colors.map((c, idx) => (
                <Stack key={idx} direction={{ xs: 'column', md: 'row' }} spacing={1}>
                  <TextField label="Color Name" value={c.name || ''} onChange={(e) => updateColor(idx, 'name', e.target.value)} fullWidth />
                  <TextField label="Color Image URL" value={c.image || ''} onChange={(e) => updateColor(idx, 'image', e.target.value)} fullWidth />
                  <IconButton color="error" onClick={() => removeColor(idx)}><DeleteIcon /></IconButton>
                </Stack>
              ))}
            </Stack>

            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ md: 'center' }}>
                <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
                  Upload Images
                  <input hidden type="file" accept="image/*" multiple onChange={uploadImages} />
                </Button>
                <TextField label="Image URL" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} fullWidth />
                <Button variant="contained" onClick={addImageUrl}>Add</Button>
              </Stack>
              {uploadingImages ? <Typography fontSize={12} color="text.secondary" mt={1}>Uploading images...</Typography> : null}
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1.2}>
                {form.images.map((img, i) => (
                  <Box key={i} sx={{ position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getAssetUrl(img)} alt={`img-${i}`} style={{ width: 70, height: 70, borderRadius: 8, objectFit: 'cover' }} />
                    <IconButton size="small" color="error" onClick={() => removeImage(i)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: theme.palette.background.paper }}>
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ md: 'center' }}>
              <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
                Upload Video
                <input hidden type="file" accept="video/*" onChange={uploadVideo} />
              </Button>
              <TextField name="video" label="Video URL" value={form.video} onChange={handleField} fullWidth />
            </Stack>
            {uploadingVideo ? <Typography fontSize={12} color="text.secondary">Uploading video...</Typography> : null}

            <Stack direction="row" spacing={2}>
              <FormControlLabel control={<Switch checked={form.featured} onChange={(e) => setForm((s) => ({ ...s, featured: e.target.checked }))} />} label="Featured Product" />
              <FormControlLabel control={<Switch checked={form.customization} onChange={(e) => setForm((s) => ({ ...s, customization: e.target.checked }))} />} label="OEM/ODM Customization" />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveProduct} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
