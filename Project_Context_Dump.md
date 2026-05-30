# Khayyat — Project Context Dump

> **Khayyat** is a bespoke Jallabiya e-commerce marketplace connecting customers with master tailors across the Middle East and North Africa. Customers design custom garments through a guided wizard, select fabrics/cuts/embroidery, provide body measurements (manually or via an AI-assisted tool), and track orders from commission to delivery. Tailors manage portfolio profiles with posts of past work. Administrators oversee and manage tailor accounts from a dashboard.

> **Current state**: Front-end prototype with **mock data** and **in-memory state**. There is no real backend, database, or payment processing. Authentication is simulated via username-keyword role detection. The project was scaffolded with the **Lovable** AI platform using their TanStack Start template.

---

## 1. Tech Stack & Environment

### Core Languages & Frameworks

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Language** | TypeScript (strict mode) | `^5.8.3`, target ES2022, JSX react-jsx |
| **UI Library** | React | `^19.2.0` |
| **Meta-framework** | TanStack Start (SSR) | `^1.167.50` — file-based routing with SSR via `@tanstack/react-start` |
| **Router** | TanStack Router | `^1.168.25` — type-safe file-based routing |
| **Server-side data** | TanStack React Query | `^5.83.0` — used for `QueryClient` in router context |
| **Build Tool** | Vite | `^7.3.1` with `@vitejs/plugin-react` |
| **Styling** | Tailwind CSS v4 | `^4.2.1` via `@tailwindcss/vite`; uses `oklch()` color functions |
| **Animations** | tw-animate-css | `^1.3.4` — CSS-based Tailwind animation utilities |
| **Component Library** | shadcn/ui (New York style) | 47 pre-built Radix-based UI primitives in `src/components/ui/` |
| **Form Validation** | Zod | `^3.24.2` — schema validation on login/register forms |
| **Toast Notifications** | Sonner | `^2.0.7` |
| **Icons** | Lucide React | `^0.575.0` |
| **CSS Utility** | clsx + tailwind-merge | Composed via `cn()` helper |

### Deployment Target

| Tool | Purpose |
|------|---------|
| **Cloudflare Workers** | Production runtime via `@cloudflare/vite-plugin ^1.25.5` |
| **Wrangler** | Cloudflare Workers CLI; config in `wrangler.jsonc` |
| **Node.js Compatibility** | `nodejs_compat` flag enabled in wrangler |

### Package Management & Build

| Tool | Details |
|------|---------|
| **Bun** | Primary package manager (`bun.lock` present); `bunfig.toml` sets 24h supply-chain guard on new package versions |
| **Lovable Vite Config** | `@lovable.dev/vite-tanstack-config` wraps all Vite plugins (React, Tailwind, TanStack Start, Cloudflare, path aliases, env injection) — custom `vite.config.ts` only adds the SSR server entry override |
| **ESLint** | `^9.32.0` with TypeScript, React Hooks, React Refresh, Prettier integration |
| **Prettier** | `^3.7.3` |

### External Services

| Service | Usage |
|---------|-------|
| **Google Maps JavaScript API** | Used in `LocationPicker` (registration) for interactive map pin & reverse geocoding |
| **Lovable Connector Gateway** | Proxies Google Maps Geocoding API calls server-side (`geocode.functions.ts`) |

### Environment Variables (`.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` | Client-side Google Maps API key |
| `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` | Analytics channel for the Maps connector |

---

## 2. Architecture Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Cloudflare Workers                        │
│  ┌──────────────┐                                            │
│  │  server.ts   │  SSR entry point, error normalization      │
│  │  start.ts    │  TanStack Start instance + error middleware│
│  │  router.tsx  │  Router factory (QueryClient in context)   │
│  └──────┬───────┘                                            │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────────┐ │
│  │              TanStack Router (File-Based)                │ │
│  │                                                          │ │
│  │  __root.tsx ──┬── /login                                 │ │
│  │               ├── /register                              │ │
│  │               └── _layout.tsx (Navbar + Footer)          │ │
│  │                    ├── / (Home)                           │ │
│  │                    ├── /portfolio                         │ │
│  │                    │    └── /portfolio/$tailorId           │ │
│  │                    ├── /wizard                            │ │
│  │                    ├── /orders                            │ │
│  │                    ├── /invoice/$orderId                  │ │
│  │                    ├── /profile                           │ │
│  │                    └── /admin                             │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

```
                    ┌─────────────────┐
                    │  React Context  │
                    │   (In-Memory)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐  ┌─────▼──────┐ ┌─────▼──────┐
     │ AppContext   │  │OrdersCtx   │ │ WizardCtx  │
     │             │  │            │ │            │
     │ • role      │  │ • orders[] │ │ • step     │
     │ • user      │  │ • pricing  │ │ • tailorId │
     │ • auth state│  │ • stages   │ │ • design   │
     │ • login()   │  │ • payment  │ │ • measures │
     │ • register()│  │            │ │ • presets  │
     └─────────────┘  └────────────┘ └────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │   Mock Data     │
                    │  (lib/mock-*)   │
                    │                 │
                    │ • TAILOR_PROFILES│
                    │ • TAILOR_POSTS  │
                    │ • MOCK_USERS    │
                    │ • WIZARD_DATA   │
                    └─────────────────┘
```

### Component Interaction Pattern

1. **Root** (`__root.tsx`) → wraps everything in `QueryClientProvider` + `AppProvider`
2. **Layout** (`_layout.tsx`) → wraps authenticated pages in `OrdersProvider` + adds `Navbar`/`Footer`
3. **Wizard** (`wizard.tsx`) → wraps wizard steps in `WizardProvider`
4. Pages consume context via hooks: `useApp()`, `useOrders()`, `useWizard()`
5. All data is sourced from `lib/mock-data.ts` and `lib/wizard-data.ts` — static arrays with lookup helpers
6. No API calls to a backend exist; the only server function is `reverseGeocode` (Google Maps via Lovable gateway)

### Role System

Three roles drive conditional rendering throughout the entire application:

| Role | Capabilities |
|------|-------------|
| **customer** | Design wizard, order tracking, profile editing (password + location) |
| **tailor** | Portfolio management (posts CRUD, avatar, name), profile editing (limited) |
| **admin** | Admin dashboard (manage tailor accounts, stats, ban/unban), cannot edit own profile |

Role is set by:
- **Login**: keyword detection in username (`admin` → admin, `tailor`/`khalil` → tailor, else → customer)
- **Register**: always customer
- **RoleSwitcher**: dev-only UI dropdown in the navbar for preview
- Persisted to `localStorage` under keys `khayyat.role` and `khayyat.auth`

---

## 3. Directory Structure

```
Khayyatt_E-commerce_Jallabiyas_Making_Website/
│
├── .env                          # Google Maps API keys
├── .gitignore                    # Standard ignores (node_modules, dist, .output, .wrangler)
├── .lovable/
│   ├── plan.md                   # Lovable AI build plan (Phase 5 — Wizard Steps 3,4 + Invoice)
│   └── project.json              # Lovable template metadata (tanstack_start_ts_2026-05-12)
├── .prettierignore               # Prettier exclusions
├── .prettierrc                   # Prettier config
├── bunfig.toml                   # Bun install settings (24h supply-chain guard)
├── components.json               # shadcn/ui configuration (New York style, Tailwind v4)
├── eslint.config.js              # ESLint flat config (TS, React Hooks, Prettier)
├── package.json                  # Dependencies, scripts (dev, build, preview, lint, format)
├── tsconfig.json                 # TypeScript config (ES2022, Bundler module, @/* alias)
├── vite.config.ts                # Vite config (delegates to @lovable.dev plugin, sets SSR entry)
├── wrangler.jsonc                # Cloudflare Workers config (entry: src/server.ts)
│
└── src/
    ├── start.ts                  # TanStack Start instance + error middleware
    ├── server.ts                 # SSR server entry (Cloudflare Workers fetch handler)
    ├── router.tsx                # Router factory (QueryClient context, scroll restoration)
    ├── routeTree.gen.ts          # Auto-generated route tree (DO NOT EDIT)
    ├── styles.css                # Global CSS: Tailwind v4 config, design tokens, light/dark themes
    │
    ├── context/
    │   ├── AppContext.tsx         # Global app state: role, user, auth, login/register/logout
    │   └── OrdersContext.tsx      # Order management: create, confirm, advance stage, pricing
    │
    ├── hooks/
    │   └── use-mobile.tsx         # Responsive breakpoint hook (768px)
    │
    ├── lib/
    │   ├── error-capture.ts      # Global error listener for SSR error recovery
    │   ├── error-page.ts         # Branded 500 error page HTML template
    │   ├── geocode.functions.ts  # Server function: reverse geocoding via Lovable/Google Maps gateway
    │   ├── mock-data.ts          # All mock data: users, tailors, posts, profiles, platform stats
    │   ├── utils.ts              # cn() helper (clsx + tailwind-merge)
    │   └── wizard-data.ts        # Design wizard catalogues: fabrics, colors, sleeves, etc. + presets + per-tailor inventory
    │
    ├── routes/
    │   ├── __root.tsx            # Root route: HTML shell, meta tags, fonts, 404/error components, providers
    │   ├── _layout.tsx           # Layout wrapper: Navbar + Footer + OrdersProvider
    │   ├── login.tsx             # Login page (Zod validation, mock auth)
    │   ├── register.tsx          # Registration page (customer-only, with LocationPicker)
    │   └── _layout/
    │       ├── index.tsx         # Home page: hero, trending designs, role lanes, featured ateliers, how-it-works
    │       ├── admin.tsx         # Admin dashboard: stats cards, tailors table, add/edit/ban dialogs
    │       ├── orders.tsx        # Orders list page: links to invoice/tracking per order
    │       ├── portfolio.tsx     # Portfolio archive: filterable tailor grid (search, city, specialty, sort)
    │       ├── portfolio.$tailorId.tsx  # Individual tailor profile: bio, posts timeline, owner actions
    │       ├── profile.tsx       # User profile editing (password-gated)
    │       ├── wizard.tsx        # 4-step design wizard (tailor select → customize → measure → review)
    │       └── invoice.$orderId.tsx     # Invoice/tracking view for a specific order
    │
    └── components/
        ├── admin/
        │   ├── AddTailorDialog.tsx     # Dialog to provision a new tailor account
        │   ├── BanTailorDialog.tsx     # Dialog to ban a tailor (date picker or permanent)
        │   ├── EditTailorDialog.tsx    # Dialog to edit tailor details
        │   └── TailorsTable.tsx        # Data table of all managed tailors
        │
        ├── auth/
        │   └── LocationPicker.tsx      # Google Maps interactive pin + reverse geocode
        │
        ├── layout/
        │   ├── Footer.tsx             # Site footer with nav columns and social links
        │   ├── Navbar.tsx             # Sticky navbar: role-aware nav links, RoleSwitcher, ProfileMenu, mobile sheet
        │   ├── PagePlaceholder.tsx     # Centered placeholder card for restricted/empty pages
        │   ├── ProfileMenu.tsx        # Avatar dropdown menu (role-conditional links + logout)
        │   └── RoleSwitcher.tsx       # Dev-only role preview dropdown
        │
        ├── portfolio/
        │   ├── EditAvatarDialog.tsx    # Dialog to change tailor avatar (URL input)
        │   ├── EditNameDialog.tsx      # Dialog to change tailor display name
        │   ├── OwnerActions.tsx        # Floating action menu for portfolio owners (add post, edit name/avatar)
        │   ├── PortfolioFilters.tsx    # Search + filter bar (city, specialty, sort)
        │   ├── PostCard.tsx           # Timeline card for a tailor's commission post
        │   ├── PostDialog.tsx          # Create/edit post dialog (title, description, customer, gradient)
        │   ├── ProfileHeader.tsx       # Tailor profile cover + avatar + stats banner
        │   ├── StarRating.tsx         # Read-only star rating display
        │   └── TailorCard.tsx         # Portfolio grid card for a tailor
        │
        ├── profile/
        │   ├── PasswordGate.tsx       # Password confirmation gate before editing profile
        │   └── ProfileEditForm.tsx     # Full profile edit form (avatar, name, password, location)
        │
        ├── wizard/
        │   ├── WizardContext.tsx       # Wizard state provider (step, tailor, design, measurements)
        │   ├── WizardFooter.tsx        # Navigation footer (Back/Next, or Confirm on step 4)
        │   ├── WizardProgress.tsx      # Horizontal stepper progress bar
        │   ├── step1/
        │   │   ├── MockMap.tsx         # Animated proximity map with tailor pins + radius slider
        │   │   └── TailorDropdown.tsx  # Select dropdown for choosing a tailor
        │   ├── step2/
        │   │   ├── CustomizerGrid.tsx  # Full grid of design options (fabric, color, sleeve, etc.)
        │   │   ├── PresetBar.tsx       # Quick-select style preset buttons
        │   │   └── SwatchSelect.tsx    # Reusable swatch selector component
        │   ├── step3/
        │   │   ├── AiMeasurementPanel.tsx  # Mock AI photo upload + pose estimation
        │   │   └── MeasurementsForm.tsx    # 10-field body measurement form
        │   ├── step4/
        │   │   └── OrderSummary.tsx        # Order review cards (tailor, design, measurements)
        │   └── step5/
        │       ├── InvoiceView.tsx         # Itemized invoice + payment method selection
        │       └── TrackingView.tsx         # 5-stage order tracking progress + activity log
        │
        └── ui/                        # 47 shadcn/ui primitives (accordion, button, card, dialog, etc.)
            ├── accordion.tsx
            ├── alert-dialog.tsx
            ├── alert.tsx
            ├── aspect-ratio.tsx
            ├── avatar.tsx
            ├── badge.tsx
            ├── breadcrumb.tsx
            ├── button.tsx
            ├── calendar.tsx
            ├── card.tsx
            ├── carousel.tsx
            ├── chart.tsx
            ├── checkbox.tsx
            ├── collapsible.tsx
            ├── command.tsx
            ├── context-menu.tsx
            ├── dialog.tsx
            ├── drawer.tsx
            ├── dropdown-menu.tsx
            ├── form.tsx
            ├── hover-card.tsx
            ├── input-otp.tsx
            ├── input.tsx
            ├── label.tsx
            ├── menubar.tsx
            ├── navigation-menu.tsx
            ├── ornament.tsx
            ├── pagination.tsx
            ├── popover.tsx
            ├── progress.tsx
            ├── radio-group.tsx
            ├── resizable.tsx
            ├── scroll-area.tsx
            ├── select.tsx
            ├── separator.tsx
            ├── sheet.tsx
            ├── sidebar.tsx
            ├── skeleton.tsx
            ├── slider.tsx
            ├── sonner.tsx
            ├── switch.tsx
            ├── table.tsx
            ├── tabs.tsx
            ├── textarea.tsx
            ├── toggle-group.tsx
            ├── toggle.tsx
            └── tooltip.tsx
```

---

## 4. Core Files & Responsibilities

### Entry Points & Configuration

#### `vite.config.ts`
- Delegates all plugin setup to `@lovable.dev/vite-tanstack-config` (React, Tailwind, TanStack Start, Cloudflare, path aliases, env injection)
- Only custom config: sets `tanstackStart.server.entry` to `"server"` to redirect the SSR entry to `src/server.ts`

#### `src/server.ts`
- **Cloudflare Workers entry point** (exported as `default.fetch`)
- Lazy-loads `@tanstack/react-start/server-entry`
- Wraps every response in error normalization: detects h3's swallowed 500 responses (JSON body `{unhandled:true, message:"HTTPError"}`) and replaces them with a branded HTML error page
- Uses `error-capture.ts` to recover original error stacks from global error listeners

#### `src/start.ts`
- Creates the TanStack Start instance with request-level error middleware
- Catches uncaught errors during request handling and returns a branded 500 HTML page

#### `src/router.tsx`
- Factory function `getRouter()` that creates a TanStack Router instance
- Injects a fresh `QueryClient` into the router context
- Enables scroll restoration and sets `defaultPreloadStaleTime` to 0

#### `src/routeTree.gen.ts`
- **Auto-generated** by TanStack Router's Vite plugin — never edit manually
- Defines the full route tree hierarchy and type augmentation for `@tanstack/react-router`

#### `src/styles.css`
- **Global design system** using Tailwind CSS v4 with `@theme inline` syntax
- Defines two custom font families: `Cormorant Garamond` (display/headings) and `Inter` (body/sans)
- Full light + dark color palettes using `oklch()` color space
- Semantic CSS custom properties: `--primary` (deep emerald), `--accent` (warm gold), `--background` (warm cream)
- Custom gradient tokens: `--gradient-emerald`, `--gradient-gold`
- Custom shadow tokens: `--shadow-luxe`, `--shadow-elevated`
- Base layer applies border-color, body bg/color, and heading font-family globally

---

### State Management (Context Providers)

#### `src/context/AppContext.tsx`
- **Exports**: `AppProvider`, `useApp()`
- **State**: `role` (customer | tailor | admin), `isAuthenticated`, derived `user` (from `MOCK_USERS[role]`)
- **Persistence**: `role` → `localStorage("khayyat.role")`, `auth` → `localStorage("khayyat.auth")`
- **Key behavior**: `login()` infers role from username keywords; `register()` always sets customer; `logout()` clears auth flag
- **Mounted**: at root level in `__root.tsx`

#### `src/context/OrdersContext.tsx`
- **Exports**: `OrdersProvider`, `useOrders()`, `STAGE_LABELS`, type exports (`Order`, `OrderStage`, `PaymentMethod`, `Pricing`)
- **State**: `orders: Order[]` array (in-memory, lost on refresh)
- **Key functions**:
  - `createOrder()` — computes pricing deterministically from design config (fabric price + labor + embroidery fees + delivery + 15% tax), returns order ID
  - `confirmPayment()` — sets payment method, status to "confirmed", stage to 0
  - `advanceStage()` — increments order stage (0→4)
- **Mounted**: in `_layout.tsx` so both wizard and orders pages can access it

#### `src/components/wizard/WizardContext.tsx`
- **Exports**: `WizardProvider`, `useWizard()`, `EMPTY_DESIGN`, `MEASUREMENT_KEYS`, `MEASUREMENT_LABELS`, `WIZARD_STEPS`, type exports (`DesignConfig`, `Measurements`, `MeasurementKey`, `StepNum`)
- **State**: `step` (1-4), `tailorId`, `radiusKm`, `design` (fabric/color/sleeve/embroidery/fastener/collar/backStitch), `preset`, `measurements` (10 body measurements)
- **Key logic**: `canAdvance` computed per step (step 1: tailor selected; step 2: preset or fabric+color chosen; step 3: all 10 measurements > 0; step 4: always true)
- **Mounted**: in `wizard.tsx` route

---

### Data Layer

#### `src/lib/mock-data.ts`
- **Exports**: All mock entities and lookup functions
- **Core types**: `Role`, `MockUser`, `FeaturedTailor`, `TopDesign`, `ManagedTailor`, `TailorProfile`, `TailorPost`
- **Data**:
  - `MOCK_USERS` — one per role (customer: Amira Hassan, tailor: Master Khalil, admin: Yasmin Admin)
  - `FEATURED_TAILORS` — 3 featured tailors for homepage
  - `TOP_DESIGNS` — 3 trending design cards with gradient backgrounds
  - `MANAGED_TAILORS_SEED` — 4 tailors for admin management table
  - `PLATFORM_STATS` — 1840 customers, 312 orders/month
  - `TAILOR_PROFILES` — 8 full tailor profiles spanning Morocco, Egypt, Jordan, Lebanon, Tunisia, Saudi Arabia, Türkiye
  - `POST_GRADIENTS` — 8 named gradient presets (Emerald, Gold, Saffron, Rose, Indigo, Jade, Sand, Copper)
  - `TAILOR_POSTS_SEED` — 24 portfolio posts across all 8 tailors
- **Helpers**: `getTailorById(id)`, `getPostsByTailor(tailorId)`

#### `src/lib/wizard-data.ts`
- **Exports**: All design customization catalogues, pricing constants, style presets, and per-tailor inventory maps
- **Catalogues** (each has `id`, `label`, `swatch` CSS background):
  - `FABRICS` (5 types + prices: $40–$180)
  - `FABRIC_COLORS` (7 colors)
  - `SLEEVES` (3 types)
  - `EMBROIDERY_PLACEMENTS` (3: Collar, Cuffs, Hem)
  - `EMBROIDERY_PATTERNS` (4: Geometric, Floral, Zellige, Minimal)
  - `FASTENERS` (2: Buttons, Zipper)
  - `BUTTON_COLORS` (4: Gold, Pearl, Onyx, Horn)
  - `COLLARS` (3: Band, Chinese, French)
  - `BACK_STITCH_PATTERNS` (4: Straight, Chevron, Cross, Double)
- **Pricing**: `LABOR_BASE=$90`, `EMBROIDERY_FEE=$25/placement`, `DELIVERY_FEE=$15`, `TAX_RATE=15%`
- **Presets**: 5 style presets (Traditional Sudanese, Saudi, Emirati, Egyptian Saidi, Custom)
- **Inventory**: `TAILOR_INVENTORY` maps each tailor ID to available options — unavailable items are greyed out in the customizer
- **Helper**: `getInventory(tailorId)` returns full or tailor-specific inventory

#### `src/lib/utils.ts`
- Single `cn()` utility composing `clsx` + `tailwind-merge` for conditional class name merging

#### `src/lib/geocode.functions.ts`
- TanStack Start server function (`createServerFn`) for reverse geocoding
- Calls the Lovable Connector Gateway (`connector-gateway.lovable.dev/google_maps`) with server-side API keys
- Input: `{ lat, lng }` → Output: `{ address }` (formatted address string)

#### `src/lib/error-capture.ts` / `src/lib/error-page.ts`
- Error infrastructure for SSR: captures unhandled errors/rejections globally, renders a minimal branded 500 HTML page when h3/TanStack swallows errors

---

### Routes (Pages)

#### `src/routes/__root.tsx`
- HTML shell (`<html>`, `<head>`, `<body>`)
- Loads Google Fonts (Cormorant Garamond + Inter) and global stylesheet
- SEO meta tags (title, description, OG, Twitter)
- 404 component with "Go home" link
- Error boundary with "Try again" / "Go home" actions
- Wraps children in `QueryClientProvider` → `AppProvider`

#### `src/routes/_layout.tsx`
- Pathless layout route wrapping all authenticated pages
- Renders `OrdersProvider` → `Navbar` → `<Outlet />` → `Footer`

#### `src/routes/login.tsx`
- Split-panel layout: brand panel (emerald gradient + tagline) | form panel
- Zod schema validation (username 3-32 chars, password 6+ chars)
- Calls `AppContext.login()` then navigates to `/`
- Includes role-detection hint text

#### `src/routes/register.tsx`
- Split-panel layout similar to login
- Full name, email, username, password, confirm password + `LocationPicker` (Google Maps)
- Zod validation including location non-null check and password match
- Calls `AppContext.register()` — always sets customer role
- Info callout: tailor/admin accounts are provisioned separately

#### `src/routes/_layout/index.tsx` (Home)
- Hero section with emerald gradient, badge, CTA buttons (role-conditional: admin → dashboard, others → wizard)
- Top 3 Trending Designs section (from `TOP_DESIGNS`)
- Role lanes section: Customer / Tailor / Admin cards
- Featured Ateliers section (from `FEATURED_TAILORS`, links to portfolio profiles)
- How It Works section: 4 steps (Find → Design → Measure → Receive)

#### `src/routes/_layout/wizard.tsx`
- 4-step guided design wizard wrapped in `WizardProvider`
- Step 1: `TailorDropdown` + `MockMap` (tailor selection with proximity map)
- Step 2: `PresetBar` + `CustomizerGrid` (fabric, color, sleeve, embroidery, etc.)
- Step 3: `MeasurementsForm` (10 fields + optional AI panel)
- Step 4: `OrderSummary` (review all choices)
- `WizardProgress` header + `WizardFooter` navigation

#### `src/routes/_layout/portfolio.tsx`
- Searchable/filterable grid of all 8 tailor profiles
- Filters: text search, city dropdown, specialty dropdown, sort (rating/experience/name)
- Each card links to `/portfolio/$tailorId`

#### `src/routes/_layout/portfolio.$tailorId.tsx`
- Dynamic route with `loader` that validates tailor ID (throws `notFound()` if invalid)
- Tailor profile header with cover gradient, avatar, stats
- Bio card with specialty, city, years badges
- Timeline of commission posts (sorted newest first)
- Owner actions (if tailor/admin): add/edit/delete posts, edit name, edit avatar
- Posts and profile details are locally editable (in-memory state)

#### `src/routes/_layout/orders.tsx`
- Lists all orders from `OrdersContext`
- Each order card shows tailor avatar, order ID, status badge, date, total price
- Links to `/invoice/$orderId`
- Empty state directs to wizard

#### `src/routes/_layout/invoice.$orderId.tsx`
- Shows `InvoiceView` (pending payment) or `TrackingView` (confirmed)
- InvoiceView: itemized pricing + payment method radio (COD/Card) + mock card form
- TrackingView: 5-stage progress bar + activity log table + dev "Advance stage" button

#### `src/routes/_layout/admin.tsx`
- Role-gated: only renders for `role === "admin"`, otherwise shows access-denied placeholder
- Stats cards: total customers, active tailors, banned tailors, orders this month
- Tailors management table with Add, Edit, Ban/Unban actions via dialog components
- All state managed locally with `useState`

#### `src/routes/_layout/profile.tsx`
- Role-gated: admin → redirect to dashboard, others → password gate then edit form
- `PasswordGate`: mock security check (any 4+ char password works)
- `ProfileEditForm`: avatar upload, name editing, password change (customer only), location editing (customer only), locked fields (email, username, market name for tailors)

---

## 5. Existing Patterns & Conventions

### Design System & Theming

- **Color system**: All colors use `oklch()` for perceptual uniformity. Light theme: warm cream background + deep emerald primary + warm gold accent. Full dark theme variant via `.dark` class.
- **Typography**: Dual font system — `Cormorant Garamond` (serif, display/headings) and `Inter` (sans, body). Applied via CSS custom properties (`--font-display`, `--font-sans`).
- **Gradient tokens**: Named CSS variables (`--gradient-emerald`, `--gradient-gold`) reused across hero sections, avatars, and cards.
- **Shadow tokens**: `--shadow-luxe` (gold-tinted elevated shadow) and `--shadow-elevated` (dark subtle shadow) for consistent depth.
- **Ornament component**: Custom SVG decorative divider (`<Ornament />`) used consistently as a visual separator below headings.
- **No placeholder images**: All visual elements use CSS gradients instead of actual images. Tailor avatars are colored circles with initials; post images are gradient rectangles.

### Component Architecture

- **shadcn/ui primitives** (`src/components/ui/`): 47 Radix-based components following the shadcn/ui "New York" style. All use `class-variance-authority` (CVA) for variant APIs and the `cn()` utility for class merging. Components are not customized beyond the standard shadcn output.
- **Feature components**: Organized by domain (`admin/`, `auth/`, `layout/`, `portfolio/`, `profile/`, `wizard/`). Each folder is self-contained with no cross-domain imports (components only import from `ui/`, `context/`, and `lib/`).
- **Wizard step components**: Sub-organized into `step1/`–`step5/` folders within `wizard/`. Each step folder contains only the components rendered during that wizard stage.

### State Management Strategy

- **React Context only**: No external state management library (Redux, Zustand, etc.). Three providers form a hierarchy:
  1. `AppProvider` (global) → role, user, auth
  2. `OrdersProvider` (layout-level) → orders array
  3. `WizardProvider` (wizard route only) → wizard step state
- **Local component state**: Heavy use of `useState` for page-level concerns (e.g., dialogs open/close, filter values, tailor list in admin). State is ephemeral and lost on page refresh.
- **No persistence layer**: All data is in-memory. Comments throughout the code reference "will persist once Cloud is connected" — indicating a planned backend integration that hasn't happened yet.

### Routing Conventions

- **TanStack Router file-based routing**: Route files in `src/routes/` map directly to URL paths. Pathless layout routes use `_layout` prefix.
- **Dynamic segments**: Use `$paramName` convention (e.g., `portfolio.$tailorId.tsx`, `invoice.$orderId.tsx`).
- **Route loaders**: Used in `portfolio.$tailorId.tsx` to validate the tailor ID and throw `notFound()` for invalid IDs.
- **Head/meta**: Every route defines `head()` with page-specific `<title>` and meta tags for SEO.
- **Error/Not Found components**: Custom `errorComponent` and `notFoundComponent` on root and dynamic routes.

### Form Handling

- **Controlled inputs**: All forms use controlled `useState` state with manual `onChange` handlers — no `react-hook-form` integration (despite the dependency being installed).
- **Validation**: Zod schemas on login and register forms. Validation is done on submit with manual error state management via `Record<string, string>`.
- **No server-side validation**: All validation is client-side only.

### Styling Conventions

- **Tailwind utility-first**: All styling done via Tailwind classes in JSX. No separate CSS modules or styled-components.
- **Inline CSS `style` props**: Used for dynamic values (gradients, positions) that can't be expressed in Tailwind classes.
- **Consistent spacing patterns**: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` for page containers; `space-y-*` for vertical stacks; `gap-*` for grids.
- **Responsive design**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints. Mobile navigation uses a Sheet (slide-out drawer).
- **Eyebrow text pattern**: Small uppercase tracking-wide text labels above section headings (e.g., `text-xs uppercase tracking-[0.2em] text-accent-foreground`).

### API & Server Functions

- **Single server function**: `reverseGeocode` in `geocode.functions.ts` — uses `createServerFn` from TanStack Start with `inputValidator` (Zod). Called via `useServerFn` hook on the client.
- **Gateway pattern**: Server-side API calls go through `connector-gateway.lovable.dev` which proxies to Google Maps API. This avoids exposing API keys to the client.
- **No REST/GraphQL API**: The project has no backend API endpoints. All data is mock.

### Mock Data Architecture

- **Seed data pattern**: Large static arrays (`TAILOR_PROFILES`, `TAILOR_POSTS_SEED`, `MANAGED_TAILORS_SEED`) serve as initial data. Components that allow editing copy seed data into local `useState` on mount.
- **Lookup helpers**: Simple array `.find()` functions (e.g., `getTailorById`, `getPostsByTailor`) rather than maps or indices.
- **Per-tailor inventory**: Each tailor has a unique inventory (`TAILOR_INVENTORY`) controlling which fabric, color, and style options are available — greyed-out items can't be selected.
- **Deterministic pricing**: Computed from design choices using fixed constants. No randomization or server-side computation.

### Code Quality & Conventions

- **TypeScript strict mode**: `strict: true` in tsconfig but `noUnusedLocals` and `noUnusedParameters` are disabled.
- **Path aliases**: `@/*` maps to `./src/*` for clean imports.
- **Named exports**: All components and contexts use named exports (no default exports except `server.ts` Cloudflare handler).
- **Colocated types**: Types are defined alongside their usage (in context files, mock-data, wizard-data) rather than in separate type files.
- **Consistent file naming**: Components use PascalCase filenames; routes use kebab-case with TanStack Router conventions (`__root.tsx`, `_layout.tsx`, `$param.tsx`).
- **ESLint rules**: Restricts `server-only` imports (not applicable to TanStack Start); warns on non-component exports from refresh boundary files; disables `@typescript-eslint/no-unused-vars`.

### Architectural Quirks & Notes

1. **No real authentication**: `login()` determines role by checking if the username contains keywords like "admin" or "tailor". Any password works. Auth state is a simple boolean in localStorage.
2. **No backend/database**: Explicitly noted throughout the codebase. The Lovable plan (`plan.md`) references "will persist once Cloud is connected" — indicating Cloudflare D1/KV or similar was planned but not yet implemented.
3. **Google Maps dependency**: The only external API integration. Used for location picking during registration and reverse geocoding. Requires valid API keys in `.env`.
4. **Lovable platform scaffolding**: The project was generated by Lovable (an AI-powered app builder). The Vite config delegates to `@lovable.dev/vite-tanstack-config` which bundles all necessary plugins. The `.lovable/plan.md` describes the iterative build phases.
5. **Unused dependencies**: `react-hook-form` and `@hookform/resolvers` are in `package.json` but not used anywhere in the source code — forms use manual controlled state instead.
6. **SSR error handling is heavily hardened**: Three layers of error catching (global listeners → Start middleware → server.ts wrapper) to ensure Cloudflare Workers always returns a branded error page rather than raw stack traces.
7. **Dev role switcher**: The `RoleSwitcher` component in the navbar allows freely switching between customer/tailor/admin roles for preview purposes — this would need to be removed or hidden in production.
8. **Mock AI measurement**: The "AI Measurement Pipeline" in step 3 of the wizard doesn't actually analyze photos. It generates deterministic measurements by scaling a base body profile proportionally to the user's entered height after a 2-second fake delay.
9. **No dark mode toggle**: Dark theme variables are defined in CSS but there's no UI toggle to switch themes. The `.dark` class would need to be applied to `<html>` by user or system preference logic.
10. **Recharts installed but unused**: The `recharts` charting library is listed as a dependency but is not imported anywhere in the codebase.

---

*Generated on 2026-05-21. This document reflects the state of the codebase at the time of analysis.*
