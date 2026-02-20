'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  Chip,
  Slider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────
interface Block {
  id: string;
  type: string;
  content: Record<string, any>;
}

interface DesignSettings {
  backgroundColor: string;
  contentWidth: number;
  contentBackground: string;
  primaryColor: string;
  secondaryColor: string;
  footerBackground: string;
  borderRadius: number;
}

export interface EmailTemplateData {
  _id?: string;
  name: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  type?: string;
  category?: string;
  variables?: { name: string; placeholder: string; defaultValue?: string }[];
  isActive?: boolean;
  isDefault?: boolean;
  usageCount?: number;
  blocks?: Block[];
  designSettings?: DesignSettings;
}

const defaultDesign: DesignSettings = {
  backgroundColor: '#f8fafc',
  contentWidth: 600,
  contentBackground: '#ffffff',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  footerBackground: '#f1f5f9',
  borderRadius: 16,
};

const TEMPLATE_TYPES = [
  { value: 'verification', label: 'Verification', icon: '✉️' },
  { value: 'welcome', label: 'Welcome', icon: '👋' },
  { value: 'password_reset', label: 'Password Reset', icon: '🔑' },
  { value: 'order_confirmation', label: 'Order Confirmation', icon: '📦' },
  { value: 'order_status', label: 'Order Status', icon: '🚚' },
  { value: 'promotional', label: 'Promotional', icon: '🎉' },
  { value: 'custom', label: 'Custom', icon: '✨' },
];

const BLOCK_TYPES = [
  { type: 'header', label: 'Header', icon: '🎨', color: '#8b5cf6' },
  { type: 'heading', label: 'Heading', icon: '📝', color: '#3b82f6' },
  { type: 'paragraph', label: 'Text', icon: '📄', color: '#10b981' },
  { type: 'image', label: 'Image', icon: '🖼️', color: '#f59e0b' },
  { type: 'button', label: 'Button', icon: '🔘', color: '#ef4444' },
  { type: 'divider', label: 'Divider', icon: '➖', color: '#6366f1' },
  { type: 'spacer', label: 'Spacer', icon: '↕️', color: '#64748b' },
  { type: 'list', label: 'List', icon: '📋', color: '#ec4899' },
  { type: 'footer', label: 'Footer', icon: '⚙️', color: '#0ea5e9' },
];

const VARIABLES = ['name', 'email', 'title', 'content', 'buttonText', 'buttonLink', 'orderNumber', 'verificationLink'];

// ─── Main Component ──────────────────────────────────────────────
export default function EmailTemplateBuilderModal({
  open,
  onClose,
  onSave,
  editTemplate = null,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: EmailTemplateData) => void;
  editTemplate?: EmailTemplateData | null;
}) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    type: 'custom',
    category: 'custom',
    isActive: true,
    isDefault: false,
  });
  const [design, setDesign] = useState<DesignSettings>(defaultDesign);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeView, setActiveView] = useState(0); // 0=design, 1=preview, 2=code
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [leftTab, setLeftTab] = useState(0); // 0=blocks, 1=style
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (!open) return;
    if (editTemplate) {
      setFormData({
        name: editTemplate.name || '',
        subject: editTemplate.subject || '',
        type: editTemplate.type || 'custom',
        category: editTemplate.category || 'custom',
        isActive: editTemplate.isActive !== false,
        isDefault: editTemplate.isDefault || false,
      });
      setBlocks(editTemplate.blocks?.length ? editTemplate.blocks : getDefaultBlocks());
      setDesign(editTemplate.designSettings || defaultDesign);
    } else {
      setFormData({ name: '', subject: '', type: 'custom', category: 'custom', isActive: true, isDefault: false });
      setBlocks(getDefaultBlocks());
      setDesign(defaultDesign);
    }
    setActiveView(0);
    setSelectedBlockIndex(null);
    setLeftTab(0);
  }, [open, editTemplate]);

  const getDefaultBlocks = (): Block[] => [
    { id: `header-${Date.now()}`, type: 'header', content: { title: '{{title}}', subtitle: '' } },
    { id: `heading-${Date.now() + 1}`, type: 'heading', content: { text: 'Hello {{name}} 👋', level: 'h2', color: '#1e293b' } },
    { id: `paragraph-${Date.now() + 2}`, type: 'paragraph', content: { text: '{{content}}', color: '#475569', fontSize: 16 } },
    { id: `button-${Date.now() + 3}`, type: 'button', content: { text: '{{buttonText}}', url: '{{buttonLink}}', color: '#6366f1' } },
    { id: `footer-${Date.now() + 4}`, type: 'footer', content: { text: `© ${new Date().getFullYear()} Company. All rights reserved.` } },
  ];

  // ─── Block Operations ────────────────────────────────────────
  const addBlock = (type: string) => {
    const defaults: Record<string, Record<string, any>> = {
      header: { title: 'Email Title', subtitle: '' },
      heading: { text: 'Heading', level: 'h2', color: '#1e293b' },
      paragraph: { text: 'Your text here...', color: '#475569', fontSize: 16 },
      image: { url: '', alt: 'Image', width: '100%' },
      button: { text: 'Click Here', url: '#', color: '#6366f1' },
      divider: { color: '#e2e8f0', margin: 24 },
      spacer: { height: 32 },
      list: { items: ['Item 1', 'Item 2', 'Item 3'], color: '#475569' },
      footer: { text: `© ${new Date().getFullYear()} Company` },
    };
    const newBlock: Block = { id: `${type}-${Date.now()}`, type, content: defaults[type] || {} };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockIndex(blocks.length);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} block added`);
  };

  const updateBlock = (index: number, content: Record<string, any>) => {
    const newBlocks = [...blocks];
    const existing = newBlocks[index];
    if (!existing) return;
    newBlocks[index] = { ...existing, content: { ...existing.content, ...content } };
    setBlocks(newBlocks);
  };

  const moveBlock = (index: number, dir: number) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    const a = newBlocks[index];
    const b = newBlocks[newIndex];
    if (!a || !b) return;
    newBlocks[index] = b;
    newBlocks[newIndex] = a;
    setBlocks(newBlocks);
    setSelectedBlockIndex(newIndex);
  };

  const duplicateBlock = (index: number) => {
    const block = blocks[index];
    if (!block) return;
    const newBlock: Block = { id: `${block.type}-${Date.now()}`, type: block.type, content: { ...block.content } };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedBlockIndex(index + 1);
    toast.success('Block duplicated');
  };

  const deleteBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
    setSelectedBlockIndex(null);
    toast.success('Block removed');
  };

  // ─── HTML Generation ─────────────────────────────────────────
  const generateHTML = useCallback(() => {
    const { backgroundColor, contentWidth, contentBackground, primaryColor, secondaryColor, footerBackground, borderRadius } = design;
    const blocksHTML = blocks.map(block => {
      switch (block.type) {
        case 'header':
          return `<tr><td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); padding: 48px 40px; text-align: center; border-radius: ${borderRadius}px ${borderRadius}px 0 0;">
            <h1 style="margin: 0; color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">${block.content.title}</h1>
            ${block.content.subtitle ? `<p style="margin: 12px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${block.content.subtitle}</p>` : ''}
          </td></tr>`;
        case 'heading': {
          const sizes: Record<string, number> = { h1: 28, h2: 22, h3: 18 };
          return `<tr><td style="padding: 24px 40px 8px;"><${block.content.level} style="margin: 0; color: ${block.content.color}; font-size: ${sizes[block.content.level] || 22}px; font-weight: 600;">${block.content.text}</${block.content.level}></td></tr>`;
        }
        case 'paragraph':
          return `<tr><td style="padding: 8px 40px;"><p style="margin: 0; color: ${block.content.color}; font-size: ${block.content.fontSize}px; line-height: 1.7;">${block.content.text}</p></td></tr>`;
        case 'image':
          return `<tr><td style="padding: 16px 40px; text-align: center;"><img src="${block.content.url || 'https://placehold.co/560x200/e2e8f0/64748b?text=Image'}" alt="${block.content.alt}" style="max-width: 100%; width: ${block.content.width}; height: auto; border-radius: 12px;"></td></tr>`;
        case 'button':
          return `<tr><td style="padding: 24px 40px; text-align: center;"><a href="${block.content.url}" style="display: inline-block; background: ${block.content.color}; color: #fff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px ${block.content.color}40;">${block.content.text}</a></td></tr>`;
        case 'divider':
          return `<tr><td style="padding: ${block.content.margin}px 40px;"><hr style="border: none; border-top: 1px solid ${block.content.color}; margin: 0;"></td></tr>`;
        case 'spacer':
          return `<tr><td style="height: ${block.content.height}px;"></td></tr>`;
        case 'list': {
          const items = (block.content.items || []).map((item: string) => `<li style="margin-bottom: 8px;">${item}</li>`).join('');
          return `<tr><td style="padding: 8px 40px;"><ul style="margin: 0; padding-left: 20px; color: ${block.content.color}; font-size: 16px; line-height: 1.6;">${items}</ul></td></tr>`;
        }
        case 'footer':
          return `<tr><td style="background: ${footerBackground}; padding: 32px 40px; text-align: center; border-radius: 0 0 ${borderRadius}px ${borderRadius}px;"><p style="margin: 0; color: #64748b; font-size: 14px;">${block.content.text}</p></td></tr>`;
        default: return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${formData.subject}</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${backgroundColor};">
<table role="presentation" style="width: 100%; border-collapse: collapse;"><tr><td align="center" style="padding: 40px 20px;">
<table role="presentation" style="width: 100%; max-width: ${contentWidth}px; border-collapse: collapse; background: ${contentBackground}; border-radius: ${borderRadius}px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
${blocksHTML}
</table></td></tr></table></body></html>`;
  }, [blocks, design, formData.subject]);

  // ─── Save ─────────────────────────────────────────────────────
  const handleSave = () => {
    if (!formData.name || !formData.subject) {
      toast.error('Please enter template name and subject');
      return;
    }
    const html = generateHTML();
    const matches = html.match(/\{\{(\w+)\}\}/g) || [];
    const uniqueVars = Array.from(new Set(matches.map(m => m.replace(/\{\{|\}\}/g, ''))));
    const variables = uniqueVars.map(name => ({ name, placeholder: name, defaultValue: '' }));
    onSave({ ...formData, htmlContent: html, blocks, designSettings: design, variables } as EmailTemplateData);
  };

  if (!open) return null;

  const selectedBlock = selectedBlockIndex !== null ? blocks[selectedBlockIndex] : null;

  const viewLabels = ['✏️ Design', '👁️ Preview', '💻 HTML'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* ─────── Header ─────── */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(to right, #f8fafc, #ffffff, rgba(238,242,255,0.3))',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
              fontSize: '1.25rem',
            }}
          >
            ✨
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {editTemplate ? 'Edit Email Template' : 'Create Email Template'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Design beautiful emails with drag & drop blocks
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button variant="text" onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(to right, #6366f1, #9333ea)',
              fontWeight: 600,
              '&:hover': { boxShadow: '0 4px 14px rgba(99,102,241,0.3)' },
            }}
          >
            {editTemplate ? 'Update Template' : 'Save Template'}
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ─────── Left Panel ─────── */}
        <Box sx={{ width: 320, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Template Info */}
          <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Welcome Email"
                size="small"
                fullWidth
              />
              <TextField
                label="Email Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Welcome to Our Store!"
                size="small"
                fullWidth
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  {TEMPLATE_TYPES.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.icon} {t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Left Tabs */}
          <Tabs
            value={leftTab}
            onChange={(_, v) => setLeftTab(v)}
            variant="fullWidth"
            sx={{
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              minHeight: 44,
              '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' },
            }}
          >
            <Tab label="🧩 Blocks" />
            <Tab label="🎨 Style" />
          </Tabs>

          {/* Panel Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {leftTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Block Types Grid */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
                    🧩 Content Blocks
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {BLOCK_TYPES.map(({ type, label, icon, color }) => (
                      <Card
                        key={type}
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          textAlign: 'center',
                          p: 1.5,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.light',
                            bgcolor: 'primary.50',
                            transform: 'translateY(-2px)',
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => addBlock(type)}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 0.75,
                            fontSize: '1.125rem',
                            bgcolor: `${color}15`,
                          }}
                        >
                          {icon}
                        </Box>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.625rem' }}>
                          {label}
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                </Box>

                {/* Variables */}
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
                    💻 Variables
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {VARIABLES.map(v => (
                      <Chip
                        key={v}
                        label={`{{${v}}}`}
                        size="small"
                        onClick={() => { navigator.clipboard.writeText(`{{${v}}}`); toast.success('Copied!'); }}
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          bgcolor: 'rgba(16,185,129,0.08)',
                          color: '#047857',
                          border: '1px solid rgba(16,185,129,0.2)',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(16,185,129,0.15)' },
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block', fontSize: '0.625rem' }}>
                    Click to copy variable
                  </Typography>
                </Box>
              </Box>
            )}

            {leftTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
                    🎨 Brand Colors
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <ColorPicker label="Primary Color" value={design.primaryColor} onChange={(v) => setDesign(prev => ({ ...prev, primaryColor: v }))} />
                    <ColorPicker label="Secondary Color" value={design.secondaryColor} onChange={(v) => setDesign(prev => ({ ...prev, secondaryColor: v }))} />
                    <ColorPicker label="Background" value={design.backgroundColor} onChange={(v) => setDesign(prev => ({ ...prev, backgroundColor: v }))} />
                    <ColorPicker label="Content BG" value={design.contentBackground} onChange={(v) => setDesign(prev => ({ ...prev, contentBackground: v }))} />
                    <ColorPicker label="Footer BG" value={design.footerBackground} onChange={(v) => setDesign(prev => ({ ...prev, footerBackground: v }))} />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
                    ⚙️ Layout
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" fontWeight={500} color="text.secondary" gutterBottom display="block">Content Width</Typography>
                      <Slider
                        value={design.contentWidth}
                        min={480}
                        max={700}
                        onChange={(_, v) => setDesign(prev => ({ ...prev, contentWidth: v as number }))}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => `${v}px`}
                        size="small"
                        sx={{ color: '#6366f1' }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.disabled">Compact</Typography>
                        <Typography variant="caption" fontWeight={600} color="primary.main">{design.contentWidth}px</Typography>
                        <Typography variant="caption" color="text.disabled">Wide</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" fontWeight={500} color="text.secondary" gutterBottom display="block">Border Radius</Typography>
                      <Slider
                        value={design.borderRadius}
                        min={0}
                        max={24}
                        onChange={(_, v) => setDesign(prev => ({ ...prev, borderRadius: v as number }))}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => `${v}px`}
                        size="small"
                        sx={{ color: '#6366f1' }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.disabled">Sharp</Typography>
                        <Typography variant="caption" fontWeight={600} color="primary.main">{design.borderRadius}px</Typography>
                        <Typography variant="caption" color="text.disabled">Rounded</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* ─────── Center Canvas ─────── */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f1f5f9, #f8fafc, rgba(238,242,255,0.3))', overflow: 'hidden' }}>

          {/* View Tabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tabs
              value={activeView}
              onChange={(_, v) => setActiveView(v)}
              sx={{
                minHeight: 40,
                bgcolor: 'grey.100',
                borderRadius: 2,
                p: 0.5,
                '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', borderRadius: 1.5, px: 2 },
                '& .Mui-selected': { bgcolor: 'background.paper', boxShadow: 1 },
                '& .MuiTabs-indicator': { display: 'none' },
              }}
            >
              {viewLabels.map((label, i) => <Tab key={i} label={label} />)}
            </Tabs>

            {activeView === 1 && (
              <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'grey.100', borderRadius: 2, p: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setPreviewDevice('desktop')}
                  sx={{ borderRadius: 1.5, ...(previewDevice === 'desktop' ? { bgcolor: 'background.paper', boxShadow: 1, color: 'primary.main' } : { color: 'text.secondary' }) }}
                >
                  <DesktopWindowsIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPreviewDevice('mobile')}
                  sx={{ borderRadius: 1.5, ...(previewDevice === 'mobile' ? { bgcolor: 'background.paper', boxShadow: 1, color: 'primary.main' } : { color: 'text.secondary' }) }}
                >
                  <PhoneIphoneIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Typography variant="caption" color="text.disabled">
              {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Canvas Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>
            {/* Design View */}
            {activeView === 0 && (
              <Box
                sx={{
                  mx: 'auto',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                  maxWidth: design.contentWidth + 48,
                  bgcolor: design.backgroundColor,
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Box sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: design.contentBackground, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                    {blocks.length === 0 ? (
                      <Box sx={{ p: 10, textAlign: 'center' }}>
                        <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, #e0e7ff, #f3e8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                          ➕
                        </Box>
                        <Typography color="text.secondary" fontWeight={500} gutterBottom>Start building your email</Typography>
                        <Typography variant="body2" color="text.disabled">Add blocks from the left panel</Typography>
                      </Box>
                    ) : (
                      blocks.map((block, index) => (
                        <Box
                          key={block.id}
                          onClick={() => setSelectedBlockIndex(index)}
                          sx={{
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderRadius: 2,
                            ...(selectedBlockIndex === index
                              ? { outline: '2px solid #6366f1', outlineOffset: 4, zIndex: 10 }
                              : { '&:hover': { outline: '2px solid #c7d2fe', outlineOffset: 2 } }),
                            '&:hover .block-actions': { opacity: 1 },
                          }}
                        >
                          {/* Block Float Actions */}
                          <Box
                            className="block-actions"
                            sx={{
                              position: 'absolute',
                              right: 12,
                              top: 12,
                              display: 'flex',
                              gap: 0.75,
                              zIndex: 20,
                              opacity: selectedBlockIndex === index ? 1 : 0,
                              transition: 'opacity 0.2s',
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); moveBlock(index, -1); }}
                              disabled={index === 0}
                              sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: 2, '&:hover': { bgcolor: 'white' } }}
                            >
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); moveBlock(index, 1); }}
                              disabled={index === blocks.length - 1}
                              sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: 2, '&:hover': { bgcolor: 'white' } }}
                            >
                              <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); duplicateBlock(index); }}
                              sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: 2, '&:hover': { bgcolor: 'white' } }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); deleteBlock(index); }}
                              sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', boxShadow: 2, color: 'error.main', '&:hover': { bgcolor: 'error.50' } }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <BlockPreview block={block} settings={design} isFirst={index === 0} isLast={index === blocks.length - 1} />
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {/* Preview View */}
            {activeView === 1 && (
              <Box
                sx={{
                  mx: 'auto',
                  bgcolor: 'background.paper',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  maxWidth: previewDevice === 'mobile' ? 375 : 700,
                }}
              >
                <Box sx={{ bgcolor: 'grey.100', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f87171' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4ade80' }} />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ px: 2, py: 0.5, bgcolor: 'background.paper', borderRadius: 1.5, fontFamily: 'monospace' }} color="text.secondary">
                      {previewDevice === 'mobile' ? '📱 Mobile Preview' : '🖥️ Desktop Preview'}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  component="iframe"
                  srcDoc={generateHTML()}
                  sx={{ width: '100%', height: 'calc(90vh - 240px)', border: 'none' }}
                  title="Preview"
                />
              </Box>
            )}

            {/* Code View */}
            {activeView === 2 && (
              <Box
                sx={{
                  mx: 'auto',
                  bgcolor: '#0f172a',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  maxWidth: 950,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: '1px solid rgba(148,163,184,0.15)', bgcolor: 'rgba(30,41,59,0.5)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'rgba(239,68,68,0.8)' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'rgba(234,179,8,0.8)' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'rgba(34,197,94,0.8)' }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'rgba(148,163,184,0.8)' }}>
                      email-template.html
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => { navigator.clipboard.writeText(generateHTML()); toast.success('HTML copied!'); }}
                    sx={{ textTransform: 'none', color: 'rgba(203,213,225,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(51,65,85,0.5)' } }}
                  >
                    Copy HTML
                  </Button>
                </Box>
                <Box
                  component="pre"
                  sx={{
                    p: 2.5,
                    fontSize: '0.85rem',
                    color: '#34d399',
                    overflow: 'auto',
                    maxHeight: 'calc(90vh - 260px)',
                    fontFamily: 'monospace',
                    lineHeight: 1.7,
                    m: 0,
                  }}
                >
                  {generateHTML()}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* ─────── Right Panel - Block Editor ─────── */}
        {selectedBlock && (
          <Box sx={{ width: 320, borderLeft: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, borderBottom: '1px solid', borderColor: 'divider', background: 'linear-gradient(to right, white, #f8fafc)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>
                  ✏️
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Edit Block</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'capitalize' }}>{selectedBlock.type}</Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setSelectedBlockIndex(null)} sx={{ color: 'text.secondary' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
              <BlockEditor block={selectedBlock} onChange={(content) => selectedBlockIndex !== null && updateBlock(selectedBlockIndex, content)} />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Color Picker ────────────────────────────────────────────────
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2, bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100' }, transition: 'all 0.2s' }}>
      <Box
        component="input"
        type="color"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          border: '2px solid white',
          boxShadow: 1,
          cursor: 'pointer',
          p: 0,
          '&::-webkit-color-swatch-wrapper': { p: 0 },
          '&::-webkit-color-swatch': { border: 'none', borderRadius: 1.5 },
        }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary">{label}</Typography>
        <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', color: 'text.disabled', fontSize: '0.625rem' }}>{value.toUpperCase()}</Typography>
      </Box>
    </Box>
  );
}

// ─── Block Preview ───────────────────────────────────────────────
function BlockPreview({ block, settings, isFirst, isLast }: { block: Block; settings: DesignSettings; isFirst: boolean; isLast: boolean }) {
  const { primaryColor, secondaryColor, footerBackground, borderRadius } = settings;

  switch (block.type) {
    case 'header':
      return (
        <div style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          padding: '48px 40px',
          textAlign: 'center' as const,
          borderRadius: isFirst ? `${borderRadius}px ${borderRadius}px 0 0` : 0,
        }}>
          <h1 className="text-2xl font-bold text-white m-0">{block.content.title}</h1>
          {block.content.subtitle && <p className="text-white/80 mt-2 m-0">{block.content.subtitle}</p>}
        </div>
      );
    case 'heading': {
      const Tag = (block.content.level || 'h2') as keyof React.JSX.IntrinsicElements;
      const sizeMap: Record<string, string> = { h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg' };
      return (
        <div className="px-10 py-5">
          <Tag className={`${sizeMap[block.content.level] || 'text-xl'} font-bold m-0`} style={{ color: block.content.color }}>{block.content.text}</Tag>
        </div>
      );
    }
    case 'paragraph':
      return (
        <div className="px-10 py-3">
          <p className="m-0 leading-relaxed" style={{ color: block.content.color, fontSize: block.content.fontSize }}>{block.content.text}</p>
        </div>
      );
    case 'image':
      return (
        <div className="px-10 py-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.content.url || 'https://placehold.co/520x180/e2e8f0/64748b?text=Click+to+add+image'} alt={block.content.alt}
            className="max-w-full rounded-xl shadow-sm" style={{ width: block.content.width }} />
        </div>
      );
    case 'button':
      return (
        <div className="px-10 py-7 text-center">
          <span className="inline-block px-10 py-4 text-white font-bold rounded-xl shadow-lg cursor-default"
            style={{ backgroundColor: block.content.color, boxShadow: `0 4px 14px ${block.content.color}40` }}>
            {block.content.text}
          </span>
        </div>
      );
    case 'divider':
      return (
        <div className="px-10" style={{ padding: `${block.content.margin}px 40px` }}>
          <hr className="border-0 border-t m-0" style={{ borderColor: block.content.color }} />
        </div>
      );
    case 'spacer':
      return <div style={{ height: block.content.height }} className="relative bg-gradient-to-r from-transparent via-slate-50 to-transparent" />;
    case 'list':
      return (
        <div className="px-10 py-3">
          <ul className="m-0 pl-5 space-y-2" style={{ color: block.content.color }}>
            {(block.content.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      );
    case 'footer':
      return (
        <div style={{
          background: footerBackground,
          padding: '32px 40px',
          textAlign: 'center' as const,
          borderRadius: isLast ? `0 0 ${borderRadius}px ${borderRadius}px` : 0,
        }}>
          <p className="text-sm text-slate-500 m-0">{block.content.text}</p>
        </div>
      );
    default:
      return <div className="p-6 text-slate-400 text-center">Unknown block type</div>;
  }
}

// ─── Block Editor ────────────────────────────────────────────────
function BlockEditor({ block, onChange }: { block: Block; onChange: (content: Record<string, any>) => void }) {
  const update = (field: string, value: string | number | string[]) => onChange({ [field]: value });

  const renderInput = (label: string, field: string, type = 'text', props: Record<string, any> = {}) => (
    <Box sx={{ mb: 2.5 }} key={`${block.id}-${field}`}>
      {type === 'textarea' ? (
        <TextField
          label={label}
          value={block.content[field] || ''}
          onChange={(e) => update(field, e.target.value)}
          multiline
          rows={4}
          fullWidth
          size="small"
          {...props}
        />
      ) : type === 'color' ? (
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="input"
              type="color"
              value={block.content[field] || '#000000'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(field, e.target.value)}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'grey.200',
                cursor: 'pointer',
                p: 0,
                '&::-webkit-color-swatch-wrapper': { p: 0 },
                '&::-webkit-color-swatch': { border: 'none', borderRadius: 1 },
              }}
            />
            <TextField
              value={block.content[field] || '#000000'}
              onChange={(e) => update(field, e.target.value)}
              size="small"
              fullWidth
              sx={{ '& input': { fontFamily: 'monospace', fontSize: '0.85rem' } }}
            />
          </Box>
        </Box>
      ) : (
        <TextField
          label={label}
          type={type}
          value={block.content[field] || ''}
          onChange={(e) => update(field, type === 'number' ? parseInt(e.target.value) : e.target.value)}
          fullWidth
          size="small"
          {...props}
        />
      )}
    </Box>
  );

  const renderSelect = (label: string, field: string, options: { value: string; label: string }[]) => (
    <Box sx={{ mb: 2.5 }} key={`${block.id}-${field}`}>
      <FormControl fullWidth size="small">
        <InputLabel>{label}</InputLabel>
        <Select
          value={block.content[field] || ''}
          label={label}
          onChange={(e) => update(field, e.target.value)}
        >
          {options.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );

  const renderRange = (label: string, field: string, min: number, max: number, defaultVal: number, minLabel: string, maxLabel: string) => (
    <Box sx={{ mb: 2.5 }} key={`${block.id}-${field}`}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
        {label}
      </Typography>
      <Slider
        value={block.content[field] || defaultVal}
        min={min}
        max={max}
        onChange={(_, v) => update(field, v as number)}
        valueLabelDisplay="auto"
        size="small"
        sx={{ color: '#6366f1' }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.disabled">{minLabel}</Typography>
        <Typography variant="caption" fontWeight={700} color="primary.main">{block.content[field] || defaultVal}px</Typography>
        <Typography variant="caption" color="text.disabled">{maxLabel}</Typography>
      </Box>
    </Box>
  );

  switch (block.type) {
    case 'header':
      return <>{renderInput('Title', 'title', 'text', { placeholder: 'Enter header title...' })}{renderInput('Subtitle', 'subtitle', 'text', { placeholder: 'Optional subtitle...' })}</>;
    case 'heading':
      return <>{renderInput('Text', 'text', 'text', { placeholder: 'Enter heading text...' })}{renderSelect('Size', 'level', [{ value: 'h1', label: '📢 Large (H1)' }, { value: 'h2', label: '📝 Medium (H2)' }, { value: 'h3', label: '📌 Small (H3)' }])}{renderInput('Color', 'color', 'color')}</>;
    case 'paragraph':
      return <>{renderInput('Text', 'text', 'textarea', { placeholder: 'Enter text...' })}{renderRange('Font Size', 'fontSize', 12, 24, 16, '12px', '24px')}{renderInput('Color', 'color', 'color')}</>;
    case 'image':
      return <>{renderInput('Image URL', 'url', 'text', { placeholder: 'https://...' })}{renderInput('Alt Text', 'alt', 'text', { placeholder: 'Describe...' })}{renderSelect('Width', 'width', [{ value: '100%', label: '📐 Full Width' }, { value: '75%', label: '📏 75%' }, { value: '50%', label: '📎 50%' }])}</>;
    case 'button':
      return <>{renderInput('Button Text', 'text', 'text', { placeholder: 'Click Me' })}{renderInput('Link URL', 'url', 'text', { placeholder: 'https://...' })}{renderInput('Button Color', 'color', 'color')}</>;
    case 'divider':
      return <>{renderInput('Line Color', 'color', 'color')}{renderRange('Spacing', 'margin', 8, 48, 24, 'Compact', 'Spacious')}</>;
    case 'spacer':
      return <>{renderRange('Height', 'height', 16, 100, 32, 'Small', 'Large')}</>;
    case 'list':
      return (
        <>
          <Box sx={{ mb: 2.5 }}>
            <TextField
              label="List Items"
              value={(block.content.items || []).join('\n')}
              onChange={(e) => update('items', e.target.value.split('\n'))}
              multiline
              rows={5}
              fullWidth
              size="small"
              placeholder={'Item 1\nItem 2\nItem 3'}
              helperText="One item per line"
            />
          </Box>
          {renderInput('Text Color', 'color', 'color')}
        </>
      );
    case 'footer':
      return <>{renderInput('Footer Text', 'text', 'textarea', { placeholder: '© 2026 Your Company' })}</>;
    default:
      return <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>No settings available</Typography>;
  }
}
