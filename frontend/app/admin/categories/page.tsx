'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
  MenuItem,
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
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import api, { getAssetUrl } from '@/lib/api';
import toast from 'react-hot-toast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

type ParentCategory = {
  _id: string;
  name: string;
  slug: string;
};

type Category = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  parentCategory?: ParentCategory | null;
  createdAt?: string;
};

type CategoryForm = {
  name: string;
  description: string;
  image: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
  parentCategory: string;
};

type SortBy = 'displayOrder' | 'name' | 'productCount' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';
type ValidationErrors = Partial<Record<keyof CategoryForm, string>>;

const EMPTY_FORM: CategoryForm = {
  name: '',
  description: '',
  image: '',
  icon: '',
  isActive: true,
  displayOrder: 0,
  parentCategory: '',
};

const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;

function validateForm(data: CategoryForm): ValidationErrors {
  const errors: ValidationErrors = {};
  const name = data.name.trim();
  const description = data.description.trim();
  const image = data.image.trim();
  const icon = data.icon.trim();

  if (!name) {
    errors.name = 'Category name is required';
  } else if (name.length < 2 || name.length > MAX_NAME) {
    errors.name = `Name must be between 2 and ${MAX_NAME} characters`;
  }

  if (description.length > MAX_DESCRIPTION) {
    errors.description = `Description must be ${MAX_DESCRIPTION} characters or less`;
  }

  if (image && !isValidImageValue(image)) {
    errors.image = 'Image must be a valid URL or /uploads path';
  }

  if (icon.length > 20) {
    errors.icon = 'Icon must be 20 characters or less';
  }

  if (!Number.isFinite(data.displayOrder) || data.displayOrder < 0) {
    errors.displayOrder = 'Display order must be a non-negative number';
  }

  return errors;
}

function isValidImageValue(value: string): boolean {
  if (!value) return true;
  if (value.startsWith('/uploads/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getApiErrorMessage(error: any, fallback: string): string {
  const message = error?.response?.data?.message;
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((e: any) => e?.message).filter(Boolean).join(', ');
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  return fallback;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [updatingCounts, setUpdatingCounts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('displayOrder');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const fetchCategories = useCallback(async (retry = 0) => {
    setError(null);
    try {
      const response = await api.get('/categories');
      const data = response.data?.data || response.data;
      setCategories(Array.isArray(data) ? data : []);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      if (retry < MAX_RETRIES) {
        setRetryCount(retry + 1);
        setTimeout(() => fetchCategories(retry + 1), RETRY_DELAY * Math.pow(2, retry));
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = [...categories];

    if (query) {
      result = result.filter((c) =>
        [c.name, c.description, c.slug, c.parentCategory?.name]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => (statusFilter === 'active' ? c.isActive : !c.isActive));
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'displayOrder') comparison = (a.displayOrder || 0) - (b.displayOrder || 0);
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      if (sortBy === 'productCount') comparison = (a.productCount || 0) - (b.productCount || 0);
      if (sortBy === 'createdAt') comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [categories, search, statusFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const inactive = total - active;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
    const emptyCategories = categories.filter((c) => !c.productCount).length;
    return { total, active, inactive, totalProducts, emptyCategories };
  }, [categories]);

  const parentOptions = useMemo(() => {
    const editingId = editing?._id;
    return categories.filter((c) => c._id !== editingId);
  }, [categories, editing]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
      icon: category.icon || '',
      isActive: !!category.isActive,
      displayOrder: Number.isFinite(category.displayOrder) ? category.displayOrder : 0,
      parentCategory: category.parentCategory?._id || '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const saveCategory = async () => {
    const validation = validateForm(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        icon: form.icon.trim(),
        isActive: form.isActive,
        displayOrder: Number(form.displayOrder) || 0,
        parentCategory: form.parentCategory || null,
      };

      if (editing) await api.put(`/categories/${editing._id}`, payload);
      else await api.post('/categories', payload);

      toast.success(editing ? 'Category updated' : 'Category created');
      closeDialog();
      await fetchCategories();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to save category'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      await api.put(`/categories/${category._id}`, { isActive: !category.isActive });
      setCategories((prev) => prev.map((c) => (c._id === category._id ? { ...c, isActive: !c.isActive } : c)));
      toast.success(category.isActive ? 'Category deactivated' : 'Category activated');
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to update category status'));
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await api.delete(`/categories/${category._id}`);
      setCategories((prev) => prev.filter((c) => c._id !== category._id));
      toast.success('Category deleted');
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to delete category'));
    }
  };

  const updateCounts = async () => {
    setUpdatingCounts(true);
    try {
      await api.post('/categories/update-counts');
      toast.success('Product counts updated');
      await fetchCategories();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to update counts'));
    } finally {
      setUpdatingCounts(false);
    }
  };

  if (loading) {
    return (
      <Stack spacing={2.5}>
        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CategoryIcon />
            <Typography variant="h5" fontWeight={700}>Categories</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading categories...'}
          </Typography>
        </Paper>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} sx={{ flex: 1 }} />
          ))}
        </Stack>
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={400} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2.5}>
        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CategoryIcon />
            <Typography variant="h5" fontWeight={700}>Categories</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">Organize products by category.</Typography>
        </Paper>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => { setLoading(true); fetchCategories(0); }} startIcon={<RefreshIcon />}>
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
      <Paper sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <CategoryIcon />
              <Typography variant="h5" fontWeight={700}>
                Categories
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Organize products by category with clear ordering and visibility control.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchCategories(0)}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<AutorenewIcon />}
              onClick={updateCounts}
              disabled={updatingCounts}
            >
              {updatingCounts ? 'Updating...' : 'Update Counts'}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Add Category
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Total Categories
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {stats.total}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Active
          </Typography>
          <Typography variant="h5" fontWeight={700} color="success.main">
            {stats.active}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Inactive
          </Typography>
          <Typography variant="h5" fontWeight={700} color="text.secondary">
            {stats.inactive}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Total Products
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {stats.totalProducts}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Empty Categories
          </Typography>
          <Typography variant="h5" fontWeight={700} color="warning.main">
            {stats.emptyCategories}
          </Typography>
        </Paper>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
          <TextField
            fullWidth
            label="Search categories"
            placeholder="Name, slug, description, parent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            select
            sx={{ minWidth: 180 }}
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <TextField
            select
            sx={{ minWidth: 180 }}
            label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <MenuItem value="displayOrder">Display order</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="productCount">Product count</MenuItem>
            <MenuItem value="createdAt">Created date</MenuItem>
          </TextField>
          <TextField
            select
            sx={{ minWidth: 140 }}
            label="Order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category._id} hover>
                  <TableCell>#{category.displayOrder || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      {category.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getAssetUrl(category.image)}
                          alt={category.name}
                          style={{ width: 36, height: 36, borderRadius: 2, objectFit: 'cover' }}
                        />
                      ) : (
                        <CategoryIcon fontSize="small" />
                      )}
                      <Box>
                        <Typography fontSize={14} fontWeight={600}>
                          {category.icon ? `${category.icon} ` : ''}
                          {category.name}
                        </Typography>
                        {category.description ? (
                          <Typography fontSize={12} color="text.secondary" noWrap sx={{ maxWidth: 280 }}>
                            {category.description}
                          </Typography>
                        ) : null}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={category.slug} />
                  </TableCell>
                  <TableCell>{category.parentCategory?.name || '-'}</TableCell>
                  <TableCell>{category.productCount || 0}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={category.isActive ? 'success' : 'default'}
                      label={category.isActive ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={category.isActive ? 'Deactivate' : 'Activate'}>
                      <IconButton size="small" onClick={() => toggleActive(category)}>
                        {category.isActive ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(category)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => deleteCategory(category)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">No categories match the current filters.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {Object.keys(errors).length > 0 ? (
              <Alert severity="error">Please fix validation errors before saving.</Alert>
            ) : null}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                label="Name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              <TextField
                type="number"
                fullWidth
                label="Display Order"
                value={form.displayOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value || 0) }))}
                error={!!errors.displayOrder}
                helperText={errors.displayOrder}
                inputProps={{ min: 0 }}
              />
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              error={!!errors.description}
              helperText={errors.description || `${form.description.length}/${MAX_DESCRIPTION}`}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                label="Icon (emoji or short text)"
                value={form.icon}
                onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                error={!!errors.icon}
                helperText={errors.icon}
              />
              <TextField
                select
                fullWidth
                label="Parent Category"
                value={form.parentCategory}
                onChange={(e) => setForm((prev) => ({ ...prev, parentCategory: e.target.value }))}
              >
                <MenuItem value="">None</MenuItem>
                {parentOptions.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              fullWidth
              label="Image URL"
              placeholder="https://example.com/image.jpg or /uploads/..."
              value={form.image}
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
              error={!!errors.image}
              helperText={errors.image}
            />
            {form.image.trim() && !errors.image ? (
              <Box>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAssetUrl(form.image.trim())}
                  alt="Category preview"
                  style={{ width: 96, height: 96, borderRadius: 8, objectFit: 'cover' }}
                />
              </Box>
            ) : null}
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active category"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveCategory} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
