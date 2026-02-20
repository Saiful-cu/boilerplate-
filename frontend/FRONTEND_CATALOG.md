# Noboraz v2 — Comprehensive Frontend Feature Catalog

> **Stack**: Next.js 14+ (App Router) · MUI (Material UI) · Tailwind CSS · Zustand · React Context · Axios · TypeScript  
> **Target Market**: Bangladesh (৳ BDT, bKash, Dhaka shipping)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Pages](#2-pages)
3. [Layouts](#3-layouts)
4. [Components](#4-components)
5. [State Management](#5-state-management)
6. [Lib / Utilities](#6-lib--utilities)
7. [API Integration Map](#7-api-integration-map)
8. [Type Definitions](#8-type-definitions)

---

## 1. Architecture Overview

### Provider Hierarchy
```
ThemeRegistry (Emotion SSR) → ThemeProvider (MUI) → AuthProvider → SettingsProvider → CartProvider → Toaster
```

### Route Structure
| Route Pattern | Access | Layout |
|---|---|---|
| `/` | Public | Store (Navbar + Footer + BottomNav) |
| `/products`, `/products/[id]` | Public | Store |
| `/cart`, `/checkout/**` | Public | Store |
| `/orders`, `/profile` | Auth required | Store |
| `/login`, `/register`, `/verify-email`, `/registration-success` | Public | Clean (no chrome) |
| `/admin/**` | Admin role | Admin (sidebar + appbar) |
| `/preview/**` | Public | Minimal (SettingsProvider only) |
| `/help`, `/track-order` | Public | Store |

---

## 2. Pages

### 2.1 Public Storefront

#### `app/page.tsx` — Homepage
- **Summary**: Dynamic homepage rendering sections fetched from `GET /homepage`
- **Section Types**: `hero`, `product_grid`, `collection_banners`, `category_grid`, `promotional_cards`, `features`, `newsletter`, `custom_html`
- **Fallback**: Default HeroSection + Featured ProductGridSection on API error
- **Interface**: `HomepageSection { _id, type, title, order, isActive, config }`

#### `app/products/page.tsx` — Product Listing (417 lines)
- **Summary**: Full product catalog with filtering, sorting, and search
- **Features**: Category filter, search, price range (min/max sliders), sort (featured/newest/price/rating), grid/list view toggle, mobile filter drawer
- **Components**: `FilterSidebar`, `SortBar`, `ProductGrid`
- **API**: `GET /products`, `GET /categories?active=true`
- **State**: Client-side filtering on fetched products

#### `app/products/[id]/page.tsx` — Product Detail (705 lines)
- **Summary**: Full product page with Daraz-style layout
- **Features**: Image gallery with zoom, color selector (with per-color images), size selector, quantity selector, sticky mobile action bar, tabs (Description/Specifications/Reviews), review eligibility check
- **Components**: `ProductImageGallery`, `ProductInfo`, `ColorSelector`, `SizeSelector`, `QuantitySelector`, `ProductActionButtons`, `ReviewList`, `ReviewForm`
- **API**: `GET /products/:id`, `GET /reviews/can-review/:id`
- **Helpers**: `colorHelpers` (getColorHex, isLightColor)

#### `app/cart/page.tsx` — Shopping Cart (103 lines)
- **Summary**: Cart display with promo code support
- **Components**: `CartItem`, `OrderSummary`, `EmptyCart`
- **State**: `CartContext` (cart, removeFromCart, updateQuantity, getCartTotal)
- **Promo Flow**: Promo code stored in sessionStorage for checkout

#### `app/checkout/page.tsx` — Checkout (661 lines)
- **Summary**: Multi-step checkout (Contact → Address → Payment)
- **Features**: Saved address selection (auto-select default), auto-detect Dhaka city for shipping rate, promo code validation, bKash payment redirect, COD
- **Shipping**: inside_dhaka ৳70 (2-3 days), outside_dhaka ৳130 (4-5 days)
- **API**: `GET /auth/addresses`, `POST /promo-codes/validate`, `POST /orders`, `POST /bkash/create-payment`
- **Interfaces**: `SavedAddress`, `PromoData`

#### `app/checkout/bkash-result/page.tsx` — bKash Callback (310 lines)
- **Summary**: Handles bKash payment result (success/cancelled/failed/error)
- **Features**: Transaction details display, 10-second auto-redirect countdown on success
- **Wrapped**: Suspense boundary for search params

#### `app/orders/page.tsx` — User Orders (~370 lines)
- **Summary**: Order list with status, payment info, item images
- **Features**: bKash retry for pending/failed payments, "Write Review" on delivered orders
- **Auth**: Redirects to `/login` if no token
- **API**: `GET /orders`, `POST /bkash/create-payment`

#### `app/profile/page.tsx` — User Profile (~160 lines)
- **Summary**: Profile page with gradient header, avatar, account info, quick actions
- **Components**: `AddressManager`
- **API**: `GET /auth/me` (via AuthContext)

#### `app/track-order/page.tsx` — Order Tracking (~260 lines)
- **Summary**: Track order by ID with shipping stepper
- **Features**: Status progress (Pending → Processing → Shipped → Delivered), tracking number display
- **API**: `GET /orders/:orderId`

#### `app/help/page.tsx` — Help Center (~300 lines)
- **Summary**: FAQ page with categorized questions
- **Categories**: Orders & Shipping, Payment, Returns & Refunds, Account & General
- **Features**: Search/filter FAQs, accordion UI, contact section with links

### 2.2 Authentication

#### `app/login/page.tsx` — Login (344 lines)
- **Summary**: Split-panel login (brand/features left, form right)
- **Features**: Email/password login, email verification resend, redirect logic (admin → `/admin`, others → `redirectTo` param)
- **API**: `POST /auth/login`, `POST /auth/resend-verification`
- **State**: `useAuth().login()`

#### `app/register/page.tsx` — Registration (~330 lines)
- **Summary**: Registration form with password strength indicator
- **Features**: Name/email/password fields, real-time password strength scoring, email verification flow
- **API**: `POST /auth/register`
- **Flow**: If `requiresVerification` → redirect to `/registration-success`

#### `app/verify-email/page.tsx` — Email Verification (274 lines)
- **Summary**: Verifies email via token from URL
- **States**: verifying → success/error/expired
- **Features**: Auto-login on success, resend verification option
- **API**: `GET /auth/verify-email/:token`

#### `app/registration-success/page.tsx` — Post-Registration (217 lines)
- **Summary**: "Check Your Email" page after registration
- **Features**: Resend verification with 60-second cooldown
- **Data**: Retrieves email from sessionStorage

### 2.3 Admin Panel

#### `app/admin/page.tsx` — Dashboard (~470 lines)
- **Summary**: Admin dashboard with revenue, profit, orders stats and trend charts
- **Features**: Time range filter (week/month/year/all), revenue & profit LineChart (recharts), recent orders, quick actions
- **API**: `GET /admin/stats?timeRange=`, fallback to `/admin/orders`, `/products`, `/admin/users`
- **Interface**: `DashboardStats`, `TrendData`

#### `app/admin/products/page.tsx` — Product Management (601 lines)
- **Summary**: Full CRUD with table view
- **Fields**: name, description, category, price, originalPrice, cost, externalCost, stock, images, video, featured, brand, modelNumber, features, tags, colors (with images), moq, weight, volume, certifications
- **Features**: Image upload (5MB limit), video upload (50MB limit), profit calculation (price - cost - externalCost)
- **API**: `GET /products`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, `POST /upload/images`, `POST /upload/video`

#### `app/admin/orders/page.tsx` — Order Management (596 lines)
- **Summary**: Order management with accordion-style list
- **Features**: Status workflow (pending → processing → shipped → delivered → cancelled), WhatsApp customer messaging, Add Order modal, shipping tracker, search/filter
- **Components**: `ShippingTracker`, `AddOrderModal`
- **API**: `GET /admin/orders`, `PUT /admin/orders/:id`, `POST /admin/orders`
- **Stats**: total, pending, delivered, revenue

#### `app/admin/categories/page.tsx` — Category Management (692 lines)
- **Summary**: Category CRUD with table view
- **Fields**: name, description, image, icon, isActive, displayOrder, parentCategory
- **Features**: Toggle active/inactive, sort (displayOrder/name/productCount/createdAt), filter (search/status)
- **API**: `GET /admin/categories`, `POST /admin/categories`, `PUT /admin/categories/:id`, `DELETE /admin/categories/:id`

#### `app/admin/users/page.tsx` — User Management (705 lines)
- **Summary**: User CRUD with bulk WhatsApp messaging
- **Features**: Bulk select users, WhatsApp message templates (welcome/promo/followup), user form with BD address
- **API**: `GET /admin/users`, `POST /admin/users`, `PUT /admin/users/:id`, `DELETE /admin/users/:id`, `POST /admin/whatsapp-logs`
- **Stats**: total, admins, customers, active

#### `app/admin/settings/page.tsx` — Settings (2626 lines)
- **Summary**: Massive settings page with 9 tabs
- **Tabs**: Branding, Appearance, Contact, Social Media, Business, SEO, Message Templates, Email Templates, Maintenance
- **Features**: Email template CRUD with builder modal, file upload (logo/favicon), color pickers, typography settings, unsaved changes warning
- **Components**: `EmailTemplateBuilderModal`
- **API**: `GET /settings`, `PUT /settings`, `POST /upload/images`
- **Defaults**: Daraz-inspired frontend colors (`#F85606`), SaaS-inspired admin colors (`#3B82F6`)

#### `app/admin/reviews/page.tsx` — Review Moderation (701 lines)
- **Summary**: Review management with approve/reject/respond/delete
- **Features**: Status filter (pending/approved/rejected), rating filter (1-5), search, pagination, admin response
- **API**: `GET /admin/reviews`, `PUT /admin/reviews/:id`, `DELETE /admin/reviews/:id`

#### `app/admin/promo-codes/page.tsx` — Promo Code Management (648 lines)
- **Summary**: Promo code CRUD with card grid layout
- **Fields**: code, description, discountType (percentage/fixed), discountValue, minOrderAmount, maxDiscountAmount, usageLimit, validFrom, validUntil, isActive
- **Status Detection**: Active, Inactive, Scheduled, Expired, Limit Reached

#### `app/admin/email-logs/page.tsx` — Email Log Monitoring (701 lines)
- **Summary**: Email logs with stats and filters
- **Stats**: total, sent, failed, success rate
- **Types**: order_confirmation, order_status, verification, welcome, password_reset, promotional, newsletter
- **Features**: Bulk delete, resend, pagination

#### `app/admin/homepage-builder/page.tsx` — Homepage Builder (~320 lines)
- **Summary**: Visual drag-and-drop homepage builder
- **Features**: Editor/Preview tabs, undo/redo (Ctrl+Z/Ctrl+Shift+Z), auto-save (3s debounce), Ctrl+S save, unsaved changes warning
- **Layout**: SectionToolbox (left 280px) | Canvas (center) | PropertiesPanel (right 340px)
- **State**: `useBuilderStore` (Zustand)

### 2.4 Preview

#### `app/preview/homepage/page.tsx` — Homepage Preview (213 lines)
- **Summary**: Receives sections via `postMessage` from parent iframe, renders same section types as main homepage
- **Fallback**: Standalone mode fetches from `GET /homepage`

---

## 3. Layouts

### `app/layout.tsx` — Root Layout (43 lines)
- Wraps in `<Providers>` → `<LayoutWrapper>`
- Metadata: "Noboraz - Your Trusted Ecommerce Store"

### `app/admin/layout.tsx` — Admin Layout (~260 lines)
- AppBar + permanent desktop sidebar (260px) + temporary mobile drawer
- 10 sidebar items: Dashboard, Products, Categories, Orders, Users, Promo Codes, Reviews, Homepage Builder, Email Logs, Settings
- Auth guard (admin role), dark/light theme toggle
- "Back to Store" / "View Store" links

### `app/preview/layout.tsx` — Preview Layout (33 lines)
- Minimal layout with SettingsProvider only

### `components/LayoutWrapper.tsx` — Conditional Chrome (35 lines)
- Store routes: Navbar + main + Footer + BottomNav
- Admin/auth routes: children only (no chrome)

---

## 4. Components

### 4.1 Core Layout Components

| Component | File | Summary |
|---|---|---|
| **Navbar** | `components/Navbar.tsx` (373 lines) | Top bar (tagline, track order, help, free shipping info) + main nav (logo, search, user menu/auth buttons, cart badge) + category bar. Hydration-safe cart badge. |
| **Footer** | `components/Footer.tsx` (374 lines) | Newsletter strip, 4-column grid (brand, quick links, customer service, contact + social media), copyright. |
| **BottomNav** | `components/BottomNav.tsx` (120 lines) | Mobile-only fixed bottom nav (Home, Products, Cart, Orders, Login/Profile). Hydration-safe cart badge. |
| **PrivateRoute** | `components/PrivateRoute.tsx` (35 lines) | Auth guard wrapper — redirects to `/login` if no user. Shows loading spinner. |

### 4.2 Home Page Sections

| Component | File | Summary |
|---|---|---|
| **HeroSection** | `components/home/HeroSection.tsx` (265 lines) | Split layout: left (badge, headline, subtitle, CTA buttons, trust indicators) + right (stat cards grid). Config-driven title/subtitle/button. |
| **ProductGridSection** | `components/home/ProductGridSection.tsx` (305 lines) | Fetches products by type (featured/best_sellers/new_arrivals/sale), optional tab switcher, product cards with image/price/rating/Quick View overlay. |
| **ProductCard** | `components/home/ProductCard.tsx` (90 lines) | Basic card: image, FEATURED badge, name, rating, price, stock status. |
| **CategoryGrid** | `components/home/CategoryGrid.tsx` (200 lines) | Fetches categories from API, card grid with images, "Popular" badge on first, "View All" button. |
| **CollectionBanners** | `components/home/CollectionBanners.tsx` (100 lines) | Two-column banner cards with gradient overlays, titles, "Shop Now" buttons. |
| **PromotionalCards** | `components/home/PromotionalCards.tsx` (120 lines) | Similar to CollectionBanners — promo card grid with gradient, image overlay. |
| **FeaturesSection** | `components/home/FeaturesSection.tsx` (105 lines) | 4-column feature icons: Free Shipping, Secure Payment, Easy Returns, 24/7 Support. Uses react-icons (FaShippingFast, etc.). |
| **NewsletterSection** | `components/home/NewsletterSection.tsx` (200 lines) | Full-width gradient section with benefits grid, email subscribe form, success alert. |

### 4.3 Product Components

| Component | File | Summary |
|---|---|---|
| **FilterSidebar** | `components/products/FilterSidebar.tsx` (202 lines) | Sticky sidebar: search input, category list, price range sliders (min ৳0-5000, max ৳0-10000). |
| **SortBar** | `components/products/SortBar.tsx` (85 lines) | Sort dropdown: Featured, Newest, Price Low/High, Top Rated. |
| **ProductGrid** | `components/products/ProductGrid.tsx` (200 lines) | Product card grid with image, stock badge, featured badge, rating, price (with original/discount), "Add to Cart" button. |

### 4.4 Product Detail Components

| Component | File | Summary |
|---|---|---|
| **ProductImageGallery** | `components/product-detail/ProductImageGallery.tsx` (105 lines) | Main image with click-to-zoom, thumbnail strip with selection highlight + image counter. |
| **ProductInfo** | `components/product-detail/ProductInfo.tsx` (115 lines) | Daraz-style: price row (৳ + original + discount % + wishlist/share), product name, star rating, stock indicator. |
| **ColorSelector** | `components/product-detail/ColorSelector.tsx` (85 lines) | Circular color swatches (hex fill or image), selected highlight, label display. |
| **SizeSelector** | `components/product-detail/SizeSelector.tsx` (65 lines) | Chip-based size selector with selected state styling. |
| **QuantitySelector** | `components/product-detail/QuantitySelector.tsx` (90 lines) | Stepper (−/value/+) with compact mode for sticky bar. Max limited by stock. |
| **ProductActionButtons** | `components/product-detail/ProductActionButtons.tsx` (80 lines) | Daraz-style split: "Buy Now" (outlined) | "Add to Cart" (filled). Disabled when out of stock. |

### 4.5 Cart Components

| Component | File | Summary |
|---|---|---|
| **CartItem** | `components/cart/CartItem.tsx` (280 lines) | Product image, name (link), color/size chips, stock warning, quantity stepper, remove button, savings display. |
| **OrderSummary** | `components/cart/OrderSummary.tsx` (433 lines) | Item count, free shipping progress bar (threshold ৳5000), promo code input with validate/remove, price breakdown, checkout button. |
| **EmptyCart** | `components/cart/EmptyCart.tsx` (144 lines) | Empty state with cart icon, benefits chips (Free Shipping, Best Prices, Easy Returns), CTA buttons. |
| **PromoSection** | `components/cart/PromoSection.tsx` (115 lines) | Shopping benefits list: Free Shipping, Cash on Delivery, Easy Returns, Secure Payment. Gradient card. |
| **DeliveryTimeline** | `components/cart/DeliveryTimeline.tsx` (162 lines) | Estimated delivery stepper (5 steps), express delivery upsell option. |

### 4.6 Review Components

| Component | File | Summary |
|---|---|---|
| **ReviewCard** | `components/ReviewCard.tsx` (233 lines) | User avatar, name, rating, date, verified badge, comment, image grid (expand), video grid, "Helpful" button, media lightbox. |
| **ReviewForm** | `components/ReviewForm.tsx` (323 lines) | Dialog form: rating stars, comment (1000 char max), image upload (max 5), video upload (max 2), multipart submit. |
| **ReviewList** | `components/ReviewList.tsx` (287 lines) | Rating overview (average + distribution bars), filter by rating click, paginated review cards, "Helpful" marking. |

### 4.7 Profile Components

| Component | File | Summary |
|---|---|---|
| **AddressManager** | `components/profile/AddressManager.tsx` (386 lines) | Address CRUD: label, name, phone (BD format), street, city, postal code, type (shipping/billing/both), default flag. Card display with edit/delete. |

### 4.8 Shared / Admin Components

| Component | File | Summary |
|---|---|---|
| **ShippingTracker** | `components/shared/ShippingTracker.tsx` (237 lines) | Horizontal stepper (Placed → Processing → Shipped → Delivered) with custom colored connectors and icons. Cancelled state display. |
| **AddOrderModal** | `components/shared/AddOrderModal.tsx` (1128 lines) | Complex admin dialog: search/select user, search/add products with quantities, shipping address (auto-fill from user), payment method, shipping method (inside/outside Dhaka), order totals. |
| **EmailTemplateBuilderModal** | `components/shared/EmailTemplateBuilderModal.tsx` (1054 lines) | Visual email builder: block types (header, heading, paragraph, image, button, divider, spacer, list, footer), drag reorder, design settings (colors, width, border radius), desktop/mobile preview, variable insertion, HTML code view. |
| **UIComponents** | `components/shared/UIComponents.tsx` (309 lines) | Reusable primitives: `LoadingSpinner`, `EmptyState`, `ErrorAlert`, `SuccessAlert`, `FormInput`, `SubmitButton`, `PageContainer`, `FormContainer`, `ProductCard`. |

### 4.9 Page Builder Components

| Component | File | Summary |
|---|---|---|
| **Canvas** | `components/page-builder/Canvas.tsx` (170 lines) | Drag-and-drop zone using `@dnd-kit/core` + `@dnd-kit/sortable`. Renders `SectionCard` list with empty state. |
| **SectionToolbox** | `components/page-builder/SectionToolbox.tsx` (130 lines) | Left panel listing all section types (from `SECTION_TYPES`) with icon, label, tooltip description, add button. |
| **SectionCard** | `components/page-builder/SectionCard.tsx` (256 lines) | Sortable card: drag handle, section icon/label/type, "Hidden" chip, order badge, action buttons (up/down/visibility/duplicate/delete). |
| **PropertiesPanel** | `components/page-builder/PropertiesPanel.tsx` (321 lines) | Right panel: section title input, section-specific editor (switch by type), error boundary with retry. |
| **Preview** | `components/page-builder/Preview.tsx` (215 lines) | Live iframe preview of homepage, responsive toggle (desktop/tablet/mobile), refresh, open-in-new-tab. Sends sections via postMessage. |

#### Page Builder Editors (9 editors)
All in `components/page-builder/editors/`:
| Editor | Section Type | Key Config Fields |
|---|---|---|
| `HeroEditor` | `hero` | title, subtitle, backgroundImage, CTA (text+link), overlay (color+opacity), showButton |
| `ProductGridEditor` | `product_grid` | productType (featured/best_sellers/new_arrivals/sale), limit, columns, showPrices, showTabs |
| `CategoryGridEditor` | `category_grid` | categories, showCount, limit, columns, showImages |
| `CollectionBannersEditor` | `collection_banners` | banners array (id, image, title, link, subtitle), layout, columns, showOverlay |
| `FeaturesEditor` | `features` | items array (icon, title, description), title, columns, showIcons |
| `NewsletterEditor` | `newsletter` | heading, subheading, buttonText, placeholder, backgroundColor, style, showDisclaimer |
| `TestimonialsEditor` | `testimonials` | items array (name, text, rating, role, avatar), title, autoplay, visibleCount |
| `PromotionalCardsEditor` | `promotional_cards` | cards array (title, subtitle, imageUrl, linkUrl, buttonText, backgroundColor), title, columns |
| `CustomHtmlEditor` | `custom_html` | name, html, css, containerClass |

---

## 5. State Management

### 5.1 React Contexts

#### `AuthContext` — `lib/context/AuthContext.tsx`
```typescript
interface AuthContextType {
    user: User | null;           // { _id, name, email, role, isVerified, addresses }
    login(email, password): Promise<User>;
    register(name, email, password): Promise<User>;
    logout(): void;
    loading: boolean;
}
```
- Token stored in `localStorage` (`token`, `user`)
- On register with `requiresVerification`, returns without storing auth

#### `CartContext` — `lib/context/CartContext.tsx`
```typescript
interface CartContextType {
    cart: CartItem[];            // { _id, name, price, quantity, images, stock }
    addToCart(product, quantity?): void;
    removeFromCart(productId): void;
    updateQuantity(productId, quantity): void;
    clearCart(): void;
    getCartTotal(): number;
    getCartCount(): number;
}
```
- Persisted in `localStorage` (`cart`)
- Toast notifications on add/remove/clear with dedup ids

#### `SettingsContext` — `lib/context/SettingsContext.tsx`
```typescript
interface SiteSettings {
    // Branding
    siteName, siteTagline, logo, favicon, heroBanners, footerLogo
    // Contact
    email, phone, address
    // Social
    facebook?, twitter?, instagram?, youtube?, linkedin?
    // Business
    currency, currencySymbol, shippingFee, freeShippingThreshold, taxRate?
    // Colors (Website)
    primaryColor, secondaryColor, accentColor, textColor, backgroundColor,
    headerBackgroundColor, footerBackgroundColor, buttonColor, buttonHoverColor
    // Colors (Admin)
    adminPrimaryColor, adminSecondaryColor, adminAccentColor, adminSidebarColor,
    adminHeaderColor, adminSuccessColor, adminWarningColor, adminDangerColor
    // Typography
    primaryFont, secondaryFont, headingFont, fontSize, headingFontWeight, bodyFontWeight
    // SEO
    metaTitle?, metaDescription?, metaKeywords?
    // Maintenance
    maintenanceMode?, maintenanceMessage?
}
```
- Fetches from `GET /settings` on mount
- Applies CSS custom properties to `:root` (35+ variables)
- Dynamically loads Google Fonts
- Default: Daraz-inspired orange theme (`#F85606`)

#### `AdminThemeContext` — `lib/context/AdminThemeContext.tsx`
```typescript
interface ThemeContextType {
    theme: Theme;
    mode: 'light' | 'dark';
    toggleTheme(): void;
}
```
- Persisted in `localStorage` (`admin-theme-mode`)
- Provides `adminLightTheme` / `adminDarkTheme` from `lib/theme.ts`

### 5.2 Zustand Store

#### `useBuilderStore` — `lib/stores/builderStore.ts` (389 lines)
```typescript
interface BuilderState {
    sections: Section[];
    selectedSectionId: string | null;
    isDirty: boolean;
    isLoading: boolean;
    isSaving: boolean;
    history: { past: Section[][]; future: Section[][] };

    // Section Management
    addSection(type, position?): void;
    removeSection(id): void;
    duplicateSection(id): void;
    reorderSections(fromIndex, toIndex): void;
    moveSection(id, direction): void;
    toggleSectionActive(id): void;

    // Config
    updateSectionConfig(id, config): void;
    updateSectionTitle(id, title): void;

    // Selection
    selectSection(id | null): void;

    // Persistence
    loadSections(): Promise<void>;   // GET /homepage
    saveSections(): Promise<void>;   // PUT /homepage

    // History
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
}
```
- Uses `zustand/middleware/immer` for immutable updates
- 50-item undo history limit
- Auto-recalculates section order on mutations
- Derived selectors: `useSelectedSection()`, `useActiveSections()`

---

## 6. Lib / Utilities

### `lib/api.ts` — Axios Client (112 lines)
- Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`)
- 30s timeout, JSON content-type
- **Request interceptor**: Injects `Bearer` token from localStorage
- **Response interceptor**: 401 → clear auth + redirect to `/login`, 429 rate limit warning, 500+ server error logging
- **Exports**: `api` (default), `getAssetUrl(path)`, `getApiUrl(endpoint)`, `apiWithRetry(fn, retries, delay)`, `API_BASE_URL`, `SERVER_BASE_URL`

### `lib/http/client.ts` — Fetch-based HTTP Client (260 lines)
- Alternative fetch-based client using `@/config` base URL
- Methods: `get`, `post`, `put`, `delete`
- Features: Timeout via AbortController, structured error normalization to `AppError`
- Note: Currently coexists with Axios client; pages primarily use Axios

### `lib/errors/index.ts` — Error Handling (167 lines)
- `AppError { message, code, status, context? }`
- `ErrorCode` enum: NETWORK_ERROR, TIMEOUT, UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, UNKNOWN_ERROR, CONFIG_ERROR
- `createAppError()`, `getUserFriendlyMessage()`, `normalizeError()`
- User-friendly message mapping (never exposes internal details)

### `lib/colorHelpers.ts` — Color Utilities (148 lines)
- Comprehensive color database (100+ named colors with aliases: "jet black", "rose gold", etc.)
- `getColorHex(name)` → hex code or null
- `isLightColor(name)` → boolean (for contrast decisions)
- Supports hex passthrough and RGB format

### `lib/theme.ts` — MUI Theme (790 lines)
- Custom MUI theme with extended palette (`custom.accent`, `custom.gradients.*`, `custom.chart.*`)
- Primary: `#F85606` (Daraz orange), responsive font sizes
- Admin themes: `adminLightTheme`, `adminDarkTheme` with custom sidebar/header/accent colors

### `lib/ThemeRegistry.tsx` — Emotion SSR (45 lines)
- CacheProvider with `useServerInsertedHTML` for proper MUI style injection in Next.js App Router

### `config/index.ts` — Environment Config (112 lines)
- Single source of truth for env vars
- Validates `NEXT_PUBLIC_API_BASE_URL` format
- Fail-fast on invalid config
- Default: `http://localhost:5000`

---

## 7. API Integration Map

### Auth
| Method | Endpoint | Used In |
|---|---|---|
| POST | `/auth/login` | login page, AuthContext |
| POST | `/auth/register` | register page, AuthContext |
| GET | `/auth/verify-email/:token` | verify-email page |
| POST | `/auth/resend-verification` | login, registration-success, verify-email |
| GET | `/auth/addresses` | checkout, AddressManager |
| POST | `/auth/addresses` | AddressManager |
| PUT | `/auth/addresses/:id` | AddressManager |
| DELETE | `/auth/addresses/:id` | AddressManager |

### Products
| Method | Endpoint | Used In |
|---|---|---|
| GET | `/products` | product listing, admin products, homepage, AddOrderModal |
| GET | `/products/:id` | product detail |
| POST | `/products` | admin products |
| PUT | `/products/:id` | admin products |
| DELETE | `/products/:id` | admin products |

### Categories
| Method | Endpoint | Used In |
|---|---|---|
| GET | `/categories` | product listing, navbar, CategoryGrid, admin categories |
| POST | `/admin/categories` | admin categories |
| PUT | `/admin/categories/:id` | admin categories |
| DELETE | `/admin/categories/:id` | admin categories |

### Orders
| Method | Endpoint | Used In |
|---|---|---|
| POST | `/orders` | checkout |
| GET | `/orders` | orders page |
| GET | `/orders/:id` | track-order |
| GET | `/admin/orders` | admin orders, dashboard |
| PUT | `/admin/orders/:id` | admin orders |
| POST | `/admin/orders` | AddOrderModal |

### Reviews
| Method | Endpoint | Used In |
|---|---|---|
| GET | `/reviews/product/:id` | ReviewList |
| GET | `/reviews/can-review/:id` | product detail |
| POST | `/reviews` | ReviewForm |
| PUT | `/reviews/:id/helpful` | ReviewList |
| GET | `/admin/reviews` | admin reviews |
| PUT | `/admin/reviews/:id` | admin reviews |
| DELETE | `/admin/reviews/:id` | admin reviews |

### Payments
| Method | Endpoint | Used In |
|---|---|---|
| POST | `/bkash/create-payment` | checkout, orders (retry) |

### Promo Codes
| Method | Endpoint | Used In |
|---|---|---|
| POST | `/promo-codes/validate` | checkout, OrderSummary |
| GET | `/admin/promo-codes` | admin promo-codes |
| POST | `/admin/promo-codes` | admin promo-codes |
| PUT | `/admin/promo-codes/:id` | admin promo-codes |
| DELETE | `/admin/promo-codes/:id` | admin promo-codes |

### Homepage
| Method | Endpoint | Used In |
|---|---|---|
| GET | `/homepage` | homepage, builderStore, preview |
| PUT | `/homepage` | builderStore |

### Settings
| Method | Endpoint | Used In |
|---|---|---|
| GET | `/settings` | SettingsContext |
| PUT | `/settings` | admin settings |

### Admin
| Method | Endpoint | Used In |
|---|---|---|
| GET | `/admin/stats` | admin dashboard |
| GET | `/admin/users` | admin users, AddOrderModal |
| POST | `/admin/users` | admin users |
| PUT | `/admin/users/:id` | admin users |
| DELETE | `/admin/users/:id` | admin users |
| POST | `/admin/whatsapp-logs` | admin users |
| GET | `/admin/email-logs` | admin email-logs |
| DELETE | `/admin/email-logs/:id` | admin email-logs |
| POST | `/admin/email-logs/:id/resend` | admin email-logs |

### Upload
| Method | Endpoint | Used In |
|---|---|---|
| POST | `/upload/images` | admin products, admin settings |
| POST | `/upload/video` | admin products |

---

## 8. Type Definitions

### `lib/types/pageBuilder.ts` (328 lines)
All section configs defined with **Zod schemas** + inferred TypeScript types:

| Type | Key Fields |
|---|---|
| `HeroConfig` | title?, subtitle?, backgroundImage?, cta? {text, link}, overlay? {color, opacity}, showButton?, buttonText?, buttonLink? |
| `ProductGridConfig` | productType (featured/best_sellers/new_arrivals/sale), limit (1-24), columns (2-6), showPrices?, showTabs? |
| `CollectionBannersConfig` | title?, banners[] {id, image, title, link, subtitle?}, layout? (grid/carousel/masonry), columns? (1-4), showOverlay? |
| `CategoryGridConfig` | categories[]?, showCount?, limit?, columns? (2-6), showImages? |
| `FeaturesConfig` | title?, items/features[] {icon, title, description}, columns? (2-6), showIcons? |
| `NewsletterConfig` | heading/title?, subheading/subtitle?, buttonText?, placeholder?, backgroundColor?, style? (minimal/card/full-width), showDisclaimer? |
| `TestimonialsConfig` | title?, items/testimonials[] {name, text, rating?, role?, avatar?}, autoplay/autoPlay?, visibleCount? (1-6), showRating?, showAvatar? |
| `PromotionalCardsConfig` | title?, cards[] {title, subtitle?, description?, imageUrl?, linkUrl?, buttonText?, backgroundColor?}, columns? (1-4), fullWidth? |
| `CustomHtmlConfig` | name?, html, css?, containerClass? |

**Core Types**:
```typescript
type SectionType = 'hero' | 'product_grid' | 'collection_banners' | 'category_grid' | 'features' | 'newsletter' | 'testimonials' | 'promotional_cards' | 'custom_html';

interface Section<T extends SectionType = SectionType> {
    id: string;
    _id?: string;
    type: T;
    order: number;
    isActive: boolean;
    title?: string;
    config: SectionConfigMap[T];
}

interface PageSchema {
    version: '1.0';
    meta: { id, name, updatedAt, updatedBy? };
    sections: Section[];
}

interface SectionTypeMeta {
    type: SectionType;
    label: string;
    icon: string;
    description: string;
}
```

---

## Key Design Patterns

1. **Dynamic Theming**: All colors from backend settings → CSS custom properties → consumed via `var(--color-primary)` in both MUI `sx` and Tailwind classes
2. **Hydration Safety**: Cart badge and dynamic counts use `isMounted` guard to avoid SSR/CSR mismatch
3. **Dual Layout System**: LayoutWrapper conditionally strips Navbar/Footer/BottomNav for admin and auth routes
4. **Page Builder Architecture**: Zustand store → Canvas (dnd-kit) ↔ PropertiesPanel → iframe Preview via postMessage
5. **Email Template Builder**: Block-based visual editor with 9 block types, design settings, variable insertion, desktop/mobile preview
6. **BD-Focused Commerce**: bKash payment, Dhaka/outside-Dhaka shipping, ৳ currency, BD phone validation, WhatsApp customer messaging
