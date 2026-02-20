'use client';

import { ChangeEvent, useEffect, useMemo, useState, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

type UserRole = 'admin' | 'customer';

type UserAddress = {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole | 'user' | string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  address?: UserAddress | null;
};

type UserForm = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  isVerified: boolean;
  isActive: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
};

type ValidationErrors = Partial<Record<keyof UserForm, string>> & { address?: string };

type MessageTemplate = { id: string; label: string; text: string };

const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  phone: '',
  role: 'customer',
  password: '',
  isVerified: false,
  isActive: true,
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
  },
};

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: 'welcome', label: 'Welcome', text: 'Hello {{name}}, welcome to Noboraz!' },
  { id: 'promo', label: 'Promo', text: 'Hello {{name}}, we have a special offer for you today.' },
  { id: 'followup', label: 'Follow-up', text: 'Hello {{name}}, just following up. Reply if you need support.' },
];

function getApiError(error: any, fallback: string): string {
  const message = error?.response?.data?.message;
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) return errors.map((e: any) => e?.message).filter(Boolean).join(', ');
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}

function validateForm(form: UserForm, isEdit: boolean): ValidationErrors {
  const errors: ValidationErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();

  if (!name) errors.name = 'Name is required';
  else if (name.length < 2 || name.length > 100) errors.name = 'Name must be between 2 and 100 characters';

  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email is invalid';

  if (!isEdit && !form.password) errors.password = 'Password is required';
  if (form.password && form.password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (phone) {
    const compact = phone.replace(/\s+/g, '');
    if (!/^01[3-9]\d{8}$/.test(compact)) errors.phone = 'Phone must be Bangladesh format: 01XXXXXXXXX';
  }

  const hasAddress = Object.values(form.address).some((v) => v.trim());
  if (hasAddress && (!form.address.street.trim() || !form.address.city.trim() || !form.address.state.trim())) {
    errors.address = 'Street, city, and state are required when using address';
  }

  return errors;
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [viewing, setViewing] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [whatsAppDialogOpen, setWhatsAppDialogOpen] = useState(false);
  const [whatsAppBulk, setWhatsAppBulk] = useState(false);
  const [whatsAppTarget, setWhatsAppTarget] = useState<User | null>(null);
  const [messageTemplateId, setMessageTemplateId] = useState('welcome');
  const [messageText, setMessageText] = useState('');
  const [sendDelay, setSendDelay] = useState(500);
  const [sendingMessages, setSendingMessages] = useState(false);

  const loadUsers = useCallback(async (retry = 0) => {
    setError(null);
    try {
      const response = await api.get('/admin/users');
      const data = response.data?.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Error loading users:', err);
      if (retry < MAX_RETRIES) {
        setRetryCount(retry + 1);
        setTimeout(() => loadUsers(retry + 1), RETRY_DELAY * Math.pow(2, retry));
        return;
      }
      setError(getApiError(err, 'Failed to fetch users'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const roleOk = filterRole === 'all' || u.role === filterRole || (filterRole === 'customer' && u.role === 'user');
      if (!roleOk) return false;
      if (!q) return true;
      return [u.name, u.email, u.phone].filter(Boolean).some((x) => String(x).toLowerCase().includes(q));
    });
  }, [users, search, filterRole]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const customers = users.filter((u) => u.role === 'customer' || u.role === 'user').length;
    const active = users.filter((u) => u.isActive !== false).length;
    return { total, admins, customers, active };
  }, [users]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role === 'admin' ? 'admin' : 'customer',
      password: '',
      isVerified: !!user.isVerified,
      isActive: user.isActive !== false,
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'Bangladesh',
      },
    });
    setErrors({});
    setFormDialogOpen(true);
  };

  const closeFormDialog = () => {
    setFormDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const onField = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onAddressField = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
  };

  const saveUser = async () => {
    const validation = validateForm(form, !!editing);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role,
        isVerified: form.isVerified,
        isActive: form.isActive,
        address: {
          street: form.address.street.trim(),
          city: form.address.city.trim(),
          state: form.address.state.trim(),
          zipCode: form.address.zipCode.trim(),
          country: form.address.country.trim() || 'Bangladesh',
        },
      };
      if (form.password) payload.password = form.password;

      if (editing) await api.put(`/admin/users/${editing._id}`, payload);
      else await api.post('/admin/users', payload);

      toast.success(editing ? 'User updated successfully' : 'User added successfully');
      closeFormDialog();
      await loadUsers();
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to save user'));
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setDeleting(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSelected((prev) => prev.filter((id) => id !== userId));
    } catch (error: any) {
      toast.error(getApiError(error, 'Failed to delete user'));
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelect = (userId: string) => {
    setSelected((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const toggleSelectAll = () => {
    if (filteredUsers.length === 0) return;
    if (selected.length === filteredUsers.length) setSelected([]);
    else setSelected(filteredUsers.map((u) => u._id));
  };

  const openSingleWhatsAppComposer = (user: User) => {
    if (!user.phone) {
      toast.error('This user has no phone number');
      return;
    }
    setWhatsAppBulk(false);
    setWhatsAppTarget(user);
    const firstTemplate = MESSAGE_TEMPLATES[0]?.text || 'Hello {{name}}';
    setMessageTemplateId('welcome');
    setMessageText(firstTemplate.replace('{{name}}', user.name || 'Customer'));
    setWhatsAppDialogOpen(true);
  };

  const openBulkWhatsAppComposer = () => {
    const targets = users.filter((u) => selected.includes(u._id) && !!u.phone);
    if (targets.length === 0) {
      toast.error('None of the selected users have phone numbers.');
      return;
    }
    setWhatsAppBulk(true);
    setWhatsAppTarget(null);
    const firstTemplate = MESSAGE_TEMPLATES[0]?.text || 'Hello {{name}}';
    setMessageTemplateId('welcome');
    setMessageText(firstTemplate);
    setWhatsAppDialogOpen(true);
  };

  const applyTemplate = (templateId: string) => {
    setMessageTemplateId(templateId);
    const template = MESSAGE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    if (whatsAppTarget) setMessageText(template.text.replace('{{name}}', whatsAppTarget.name || 'Customer'));
    else setMessageText(template.text);
  };

  const logWhatsAppMessage = async (user: User, message: string) => {
    try {
      await api.post('/admin/whatsapp-logs', {
        customerName: user.name || 'Customer',
        customerPhone: user.phone || '',
        customerId: user._id,
        message,
        templateId: messageTemplateId,
      });
    } catch {
      // Keep UX smooth if log API fails.
    }
  };

  const sendWhatsAppMessages = async () => {
    const msg = messageText.trim();
    if (!msg) {
      toast.error('Message is required');
      return;
    }

    setSendingMessages(true);
    try {
      if (!whatsAppBulk && whatsAppTarget?.phone) {
        const personalized = msg.replace(/{{\s*name\s*}}/gi, whatsAppTarget.name || 'Customer');
        const clean = whatsAppTarget.phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${clean}?text=${encodeURIComponent(personalized)}`, '_blank');
        await logWhatsAppMessage(whatsAppTarget, personalized);
        toast.success('WhatsApp opened');
      } else {
        const targets = users.filter((u) => selected.includes(u._id) && !!u.phone);
        let sent = 0;
        for (const user of targets) {
          const personalized = msg.replace(/{{\s*name\s*}}/gi, user.name || 'Customer');
          const clean = (user.phone || '').replace(/[^0-9]/g, '');
          if (!clean) continue;
          window.open(`https://wa.me/${clean}?text=${encodeURIComponent(personalized)}`, '_blank');
          await logWhatsAppMessage(user, personalized);
          sent += 1;
          if (sendDelay > 0) await new Promise((resolve) => setTimeout(resolve, sendDelay));
        }
        toast.success(`Opening WhatsApp for ${sent} user(s)`);
      }
      setWhatsAppDialogOpen(false);
    } finally {
      setSendingMessages(false);
    }
  };

  if (loading) {
    return (
      <Stack spacing={2.5}>
        <Paper sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PeopleIcon />
            <Typography variant="h5" fontWeight={700}>Users</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading users...'}
          </Typography>
        </Paper>
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Box>
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
            <PeopleIcon />
            <Typography variant="h5" fontWeight={700}>Users</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">View and manage registered users.</Typography>
        </Paper>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => { setLoading(true); loadUsers(0); }} startIcon={<RefreshIcon />}>
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
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ md: 'center' }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <PeopleIcon />
              <Typography variant="h5" fontWeight={700}>Users</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              View and manage registered users. {users.length} users
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {selected.length > 0 ? (
              <Button variant="outlined" color="success" startIcon={<WhatsAppIcon />} onClick={openBulkWhatsAppComposer}>
                Send WhatsApp ({selected.length})
              </Button>
            ) : null}
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadUsers(0)}>Refresh</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add User</Button>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
        <Card sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">Total Users</Typography><Typography variant="h5" fontWeight={700}>{stats.total}</Typography></Card>
        <Card sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">Admins</Typography><Typography variant="h5" fontWeight={700} color="warning.main">{stats.admins}</Typography></Card>
        <Card sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">Customers</Typography><Typography variant="h5" fontWeight={700} color="primary.main">{stats.customers}</Typography></Card>
        <Card sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">Active</Typography><Typography variant="h5" fontWeight={700} color="success.main">{stats.active}</Typography></Card>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
          <TextField
            fullWidth
            label="Search users"
            placeholder="Name, email, phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            select
            label="Role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'all' | UserRole)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="customer">Customer/User</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={filteredUsers.length > 0 && selected.length === filteredUsers.length}
                    indeterminate={selected.length > 0 && selected.length < filteredUsers.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={selected.includes(user._id)} onChange={() => toggleSelect(user._id)} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Avatar sx={{ width: 34, height: 34 }}>{user.name?.charAt(0).toUpperCase() || '?'}</Avatar>
                      <Box>
                        <Typography fontSize={14} fontWeight={600}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={user.role === 'admin' ? 'Admin' : 'Customer'} color={user.role === 'admin' ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.8}>
                      <Chip size="small" label={user.isActive === false ? 'Inactive' : 'Active'} color={user.isActive === false ? 'default' : 'success'} />
                      <Chip size="small" label={user.isVerified ? 'Verified' : 'Unverified'} color={user.isVerified ? 'info' : 'default'} />
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => { setViewing(user); setViewDialogOpen(true); }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {user.phone ? (
                      <Tooltip title="WhatsApp">
                        <IconButton size="small" color="success" onClick={() => openSingleWhatsAppComposer(user)}>
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    <Tooltip title="Delete">
                      <span>
                        <IconButton size="small" color="error" disabled={deleting === user._id} onClick={() => void deleteUser(user._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={formDialogOpen} onClose={closeFormDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.6}>
            <TextField name="name" label="Name" value={form.name} onChange={onField} error={!!errors.name} helperText={errors.name} fullWidth />
            <TextField name="email" label="Email" value={form.email} onChange={onField} error={!!errors.email} helperText={errors.email} fullWidth />
            <TextField name="phone" label="Phone (01XXXXXXXXX)" value={form.phone} onChange={onField} error={!!errors.phone} helperText={errors.phone} fullWidth />
            <Select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            <TextField
              name="password"
              type="password"
              label={editing ? 'New Password (optional)' : 'Password'}
              value={form.password}
              onChange={onField}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
            />
            <TextField name="street" label="Street" value={form.address.street} onChange={onAddressField} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField name="city" label="City" value={form.address.city} onChange={onAddressField} fullWidth />
              <TextField name="state" label="State" value={form.address.state} onChange={onAddressField} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField name="zipCode" label="Zip Code" value={form.address.zipCode} onChange={onAddressField} fullWidth />
              <TextField name="country" label="Country" value={form.address.country} onChange={onAddressField} fullWidth />
            </Stack>
            {errors.address ? <Typography variant="caption" color="error">{errors.address}</Typography> : null}
            <FormControlLabel control={<Switch checked={form.isVerified} onChange={(e) => setForm((prev) => ({ ...prev, isVerified: e.target.checked }))} />} label="Verified User" />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />} label="Active User" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFormDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveUser} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {viewing ? (
            <Stack spacing={1}>
              <Typography><strong>Name:</strong> {viewing.name}</Typography>
              <Typography><strong>Email:</strong> {viewing.email}</Typography>
              <Typography><strong>Phone:</strong> {viewing.phone || '-'}</Typography>
              <Typography><strong>Role:</strong> {viewing.role}</Typography>
              <Typography><strong>Verified:</strong> {viewing.isVerified ? 'Yes' : 'No'}</Typography>
              <Typography><strong>Active:</strong> {viewing.isActive === false ? 'No' : 'Yes'}</Typography>
              <Typography><strong>Joined:</strong> {formatDate(viewing.createdAt)}</Typography>
              <Typography>
                <strong>Address:</strong>{' '}
                {[viewing.address?.street, viewing.address?.city, viewing.address?.state, viewing.address?.zipCode, viewing.address?.country]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={whatsAppDialogOpen} onClose={() => setWhatsAppDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{whatsAppBulk ? 'Bulk WhatsApp Message' : 'Send WhatsApp Message'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField select label="Template" value={messageTemplateId} onChange={(e) => applyTemplate(e.target.value)} fullWidth>
              {MESSAGE_TEMPLATES.map((t) => <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>)}
            </TextField>
            <TextField
              label="Message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              multiline
              minRows={5}
              fullWidth
              helperText="Use {{name}} for personalization"
            />
            {whatsAppBulk ? (
              <TextField type="number" label="Delay between messages (ms)" value={sendDelay} onChange={(e) => setSendDelay(Math.max(0, Number(e.target.value || 0)))} fullWidth />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWhatsAppDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={sendWhatsAppMessages} disabled={sendingMessages}>
            {sendingMessages ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
