import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Section Config Schemas (Zod)
// ─────────────────────────────────────────────────────────────────────────────

export const CtaSchema = z.object({
    text: z.string().min(1),
    link: z.string().min(1),
});

export const HeroConfigSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    backgroundImage: z.string().optional(),
    cta: CtaSchema.optional(),
    overlay: z.object({
        color: z.string(),
        opacity: z.number().min(0).max(1),
    }).optional(),
    showButton: z.boolean().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
});

export const ProductGridConfigSchema = z.object({
    productType: z.enum(['featured', 'best_sellers', 'new_arrivals', 'sale']),
    limit: z.number().min(1).max(24),
    columns: z.number().min(2).max(6),
    showPrices: z.boolean().optional(),
    showTabs: z.boolean().optional(),
});

export const BannerItemSchema = z.object({
    id: z.string(),
    image: z.string(),
    title: z.string(),
    link: z.string(),
    subtitle: z.string().optional(),
});

export const CollectionBannersConfigSchema = z.object({
    title: z.string().optional(),
    banners: z.array(BannerItemSchema),
    layout: z.enum(['grid', 'carousel', 'masonry']).optional(),
    columns: z.number().min(1).max(4).optional(),
    showOverlay: z.boolean().optional(),
});

export const CategoryGridConfigSchema = z.object({
    categories: z.array(z.string()).optional(),
    showCount: z.boolean().optional(),
    limit: z.number().optional(),
    columns: z.number().min(2).max(6).optional(),
    showImages: z.boolean().optional(),
});

export const FeatureItemSchema = z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
});

export const FeaturesConfigSchema = z.object({
    title: z.string().optional(),
    items: z.array(FeatureItemSchema).optional(),
    features: z.array(FeatureItemSchema).optional(),
    columns: z.number().min(2).max(6).optional(),
    showIcons: z.boolean().optional(),
});

export const NewsletterConfigSchema = z.object({
    heading: z.string().optional(),
    title: z.string().optional(),
    subheading: z.string().optional(),
    subtitle: z.string().optional(),
    buttonText: z.string().optional(),
    placeholder: z.string().optional(),
    backgroundColor: z.string().optional(),
    style: z.enum(['minimal', 'card', 'full-width']).optional(),
    showDisclaimer: z.boolean().optional(),
});

export const TestimonialItemSchema = z.object({
    name: z.string(),
    text: z.string(),
    rating: z.number().min(1).max(5).optional(),
    role: z.string().optional(),
    avatar: z.string().optional(),
});

export const TestimonialsConfigSchema = z.object({
    title: z.string().optional(),
    items: z.array(TestimonialItemSchema).optional(),
    testimonials: z.array(TestimonialItemSchema).optional(),
    autoplay: z.boolean().optional(),
    autoPlay: z.boolean().optional(),
    visibleCount: z.number().min(1).max(6).optional(),
    showRating: z.boolean().optional(),
    showAvatar: z.boolean().optional(),
});

export const PromotionalCardSchema = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    linkUrl: z.string().optional(),
    buttonText: z.string().optional(),
    backgroundColor: z.string().optional(),
});

export const PromotionalCardsConfigSchema = z.object({
    title: z.string().optional(),
    cards: z.array(PromotionalCardSchema).optional(),
    columns: z.number().min(1).max(4).optional(),
    fullWidth: z.boolean().optional(),
});

export const CustomHtmlConfigSchema = z.object({
    name: z.string().optional(),
    html: z.string(),
    css: z.string().optional(),
    containerClass: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Types (inferred from Zod)
// ─────────────────────────────────────────────────────────────────────────────

export type HeroConfig = z.infer<typeof HeroConfigSchema>;
export type ProductGridConfig = z.infer<typeof ProductGridConfigSchema>;
export type CollectionBannersConfig = z.infer<typeof CollectionBannersConfigSchema>;
export type CategoryGridConfig = z.infer<typeof CategoryGridConfigSchema>;
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;
export type NewsletterConfig = z.infer<typeof NewsletterConfigSchema>;
export type TestimonialsConfig = z.infer<typeof TestimonialsConfigSchema>;
export type PromotionalCardsConfig = z.infer<typeof PromotionalCardsConfigSchema>;
export type CustomHtmlConfig = z.infer<typeof CustomHtmlConfigSchema>;

// Exported item types for editors
export type FeatureItem = z.infer<typeof FeatureItemSchema>;
export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;
export type PromoCardItem = z.infer<typeof PromotionalCardSchema>;
export type BannerItem = z.infer<typeof BannerItemSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Section Type Map
// ─────────────────────────────────────────────────────────────────────────────

export interface SectionConfigMap {
    hero: HeroConfig;
    product_grid: ProductGridConfig;
    collection_banners: CollectionBannersConfig;
    category_grid: CategoryGridConfig;
    features: FeaturesConfig;
    newsletter: NewsletterConfig;
    testimonials: TestimonialsConfig;
    promotional_cards: PromotionalCardsConfig;
    custom_html: CustomHtmlConfig;
}

export type SectionType = keyof SectionConfigMap;

// ─────────────────────────────────────────────────────────────────────────────
// Section Definition
// ─────────────────────────────────────────────────────────────────────────────

export interface Section<T extends SectionType = SectionType> {
    id: string;
    _id?: string; // MongoDB ID (for backend compatibility)
    type: T;
    order: number;
    isActive: boolean;
    title?: string;
    config: SectionConfigMap[T];
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface PageSchema {
    version: '1.0';
    meta: {
        id: string;
        name: string;
        updatedAt: string;
        updatedBy?: string;
    };
    sections: Section[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Type Metadata
// ─────────────────────────────────────────────────────────────────────────────

export interface SectionTypeMeta {
    type: SectionType;
    label: string;
    description: string;
    icon: string;
    defaultConfig: SectionConfigMap[SectionType];
}

export const SECTION_TYPES: SectionTypeMeta[] = [
    {
        type: 'hero',
        label: 'Hero Banner',
        description: 'Large hero section with image and text',
        icon: '🎯',
        defaultConfig: {
            title: 'Welcome to Our Store',
            subtitle: 'Discover amazing products',
            buttonText: 'Shop Now',
            buttonLink: '/products',
            showButton: true,
        } as HeroConfig,
    },
    {
        type: 'product_grid',
        label: 'Product Grid',
        description: 'Display product collection',
        icon: '📦',
        defaultConfig: {
            productType: 'featured',
            limit: 8,
            columns: 4,
            showPrices: true,
        } as ProductGridConfig,
    },
    {
        type: 'category_grid',
        label: 'Category Grid',
        description: 'Display category cards',
        icon: '📁',
        defaultConfig: {
            showCount: true,
            limit: 6,
            columns: 4,
            showImages: true,
        } as CategoryGridConfig,
    },
    {
        type: 'collection_banners',
        label: 'Collection Banners',
        description: 'Banner grid for collections',
        icon: '🖼️',
        defaultConfig: {
            banners: [],
            layout: 'grid',
            columns: 2,
        } as CollectionBannersConfig,
    },
    {
        type: 'promotional_cards',
        label: 'Promotional Cards',
        description: 'Promotional offer cards',
        icon: '🎁',
        defaultConfig: {
            cards: [],
            columns: 3,
        } as PromotionalCardsConfig,
    },
    {
        type: 'features',
        label: 'Features',
        description: 'Highlight store features',
        icon: '⭐',
        defaultConfig: {
            features: [
                { icon: '🚚', title: 'Free Delivery', description: 'On orders over $50' },
                { icon: '↩️', title: 'Easy Returns', description: '30 day return policy' },
                { icon: '🔒', title: 'Secure Payment', description: '100% secure checkout' },
                { icon: '💬', title: '24/7 Support', description: 'Dedicated support team' },
            ],
            columns: 4,
        } as FeaturesConfig,
    },
    {
        type: 'newsletter',
        label: 'Newsletter',
        description: 'Email subscription section',
        icon: '📰',
        defaultConfig: {
            title: 'Subscribe to Newsletter',
            subtitle: 'Get updates on new products and offers',
            buttonText: 'Subscribe',
        } as NewsletterConfig,
    },
    {
        type: 'testimonials',
        label: 'Testimonials',
        description: 'Customer reviews section',
        icon: '💬',
        defaultConfig: {
            testimonials: [],
            autoPlay: true,
        } as TestimonialsConfig,
    },
    {
        type: 'custom_html',
        label: 'Custom HTML',
        description: 'Custom HTML content',
        icon: '🔧',
        defaultConfig: {
            html: '<div class="text-center py-8"><p>Custom content here</p></div>',
        } as CustomHtmlConfig,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

export function getSectionMeta(type: SectionType): SectionTypeMeta | undefined {
    return SECTION_TYPES.find(s => s.type === type);
}

export function getDefaultConfig<T extends SectionType>(type: T): SectionConfigMap[T] {
    const meta = getSectionMeta(type);
    return (meta?.defaultConfig ?? {}) as SectionConfigMap[T];
}

export function generateSectionId(): string {
    return `section-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
