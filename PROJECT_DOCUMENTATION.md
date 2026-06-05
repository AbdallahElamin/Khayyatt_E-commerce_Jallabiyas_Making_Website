# Khayyat E-Commerce Platform — Complete Project Documentation

> **Khayyat** is a bespoke Jallabiya e-commerce marketplace connecting customers with master tailors across the Middle East and North Africa (MENA). This graduation project demonstrates a complete full-stack web application with AI-powered measurement capabilities for traditional garment tailoring.

**Status**: Front-end prototype with mock data + Python AI measurement backend  
**Purpose**: Software Engineering Diploma Graduation Project  
**Tech Stack**: React 19, TypeScript, TanStack Start (SSR), Tailwind CSS v4, Python FastAPI (AI Backend), Supabase (Database)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [Features & Functionality](#3-features--functionality)
4. [File Structure & Organization](#4-file-structure--organization)
5. [Data Flow & Actor Journeys](#5-data-flow--actor-journeys)
6. [Key Components Reference](#6-key-components-reference)
7. [Database Schema](#7-database-schema)
8. [AI Measurement System](#8-ai-measurement-system)
9. [Development & Deployment](#9-development--deployment)

---

## 1. Project Overview

### What is Khayyat?

Khayyat (Arabic: خياط, meaning "tailor") is a modern marketplace platform that digitizes the traditional bespoke garment ordering process. The platform enables:

- **Customers**: Design custom Jallabiyas through a guided wizard, provide body measurements (manual or AI-assisted), and track orders
- **Tailors**: Showcase portfolios with past work, manage profiles, and receive commission orders
- **Administrators**: Manage tailor accounts, monitor platform statistics, and moderate content

### Core Value Proposition


1. **Democratizes access** to master tailors across MENA region
2. **Removes geographical barriers** — customers anywhere can commission from ateliers in Marrakech, Cairo, Amman, etc.
3. **Modernizes traditional craft** — combines heritage tailoring with modern UX and AI measurement technology
4. **Transparency** — customers see portfolios, ratings, and track order progress in real-time

### Current State

- ✅ **Front-end**: Fully functional prototype with 47 shadcn/ui components, 3-role system, 4-step design wizard
- ✅ **AI Backend**: Professional-grade Python body measurement extraction using SMPL-X anthropometry
- ✅ **Database Schema**: Complete Supabase schema with RLS policies for profiles, orders, activity logs
- ⚠️ **Integration**: Front-end uses mock data; backend runs as separate FastAPI service (integration pending)
- ⚠️ **Authentication**: Mock auth with keyword-based role detection (Supabase Auth ready but not connected)
- ⚠️ **Payment**: Mock payment flow (COD/Card selection without real processing)

---

## 2. Architecture & Technology Stack

### 2.1 Front-End Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Language** | TypeScript | 5.8.3 | Type-safe development, strict mode |
| **UI Framework** | React | 19.2.0 | Component-based UI with modern hooks |
| **Meta-Framework** | TanStack Start | 1.167.50 | SSR (Server-Side Rendering) framework |
| **Router** | TanStack Router | 1.168.25 | Type-safe file-based routing |
| **State** | TanStack React Query | 5.83.0 | Server state management |
| **Build Tool** | Vite | 7.3.1 | Fast build and HMR |
| **Styling** | Tailwind CSS | 4.2.1 | Utility-first CSS framework |
| **Components** | shadcn/ui | — | 47 pre-built Radix UI primitives |

| **Form Validation** | Zod | 3.24.2 | Schema validation for forms |
| **Icons** | Lucide React | 0.575.0 | 1000+ SVG icons |
| **Notifications** | Sonner | 2.0.7 | Toast notifications |
| **Deployment** | Cloudflare Workers | — | Edge runtime for production |

### 2.2 Back-End Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Database** | Supabase (PostgreSQL) | User profiles, orders, activity logs |
| **Auth** | Supabase Auth | JWT-based authentication (ready, not integrated) |
| **Storage** | Supabase Storage | Portfolio images, user avatars (planned) |
| **AI Service** | Python 3.11 + FastAPI | Body measurement extraction |
| **AI Models** | SMPL-X + MediaPipe | 3D body modeling + pose estimation |

### 2.3 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React 19 + TanStack Router + Tailwind CSS               │   │
│  │  • Home, Wizard, Portfolio, Orders, Admin, Profile       │   │
│  └────────────────┬─────────────────────────────────────────┘   │
└───────────────────┼─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌───────────┐ ┌───────────┐ ┌────────────────┐
│ Cloudflare│ │ Supabase  │ │ Python FastAPI │
│  Workers  │ │ Postgres  │ │ (AI Service)   │
│           │ │           │ │                │

│ (SSR)     │ │ + Auth    │ │ Port 8000      │
│           │ │ + RLS     │ │ SMPL-X + MP    │
└───────────┘ └───────────┘ └────────────────┘
     │             │                │
     │             │                │
     └─────────────┴────────────────┘
              (Not yet integrated)
```

### 2.4 Deployment Architecture

- **Front-End**: Cloudflare Workers (edge runtime) via Wrangler CLI
- **Database**: Supabase cloud (PostgreSQL with Row-Level Security)
- **AI Service**: Runs locally on `http://localhost:8000` (FastAPI + Uvicorn)
  - Production deployment: Containerize Python service (Docker) → AWS EC2 / Google Cloud Run / Azure Container Instances

---

## 3. Features & Functionality

### 3.1 Feature Summary Table

| Feature | Status | Actor(s) | Location in Code |
|---------|--------|----------|------------------|
| **User Authentication** | Mock | All | `src/context/AppContext.tsx`, `src/routes/login.tsx`, `src/routes/register.tsx` |
| **Role-Based Access** | ✅ Complete | All | `src/context/AppContext.tsx`, conditional rendering across all routes |
| **Design Wizard** | ✅ Complete | Customer | `src/routes/_layout/wizard.tsx`, `src/components/wizard/` |
| **Tailor Portfolio** | ✅ Complete | All (view), Tailor (edit) | `src/routes/_layout/portfolio*.tsx`, `src/components/portfolio/` |

| **Order Management** | ✅ Complete | Customer | `src/context/OrdersContext.tsx`, `src/routes/_layout/orders.tsx` |
| **Invoice & Tracking** | ✅ Complete | Customer | `src/routes/_layout/invoice.$orderId.tsx`, `src/components/wizard/step5/` |
| **Admin Dashboard** | ✅ Complete | Admin | `src/routes/_layout/admin.tsx`, `src/components/admin/` |
| **Profile Editing** | ✅ Complete | Customer, Tailor | `src/routes/_layout/profile.tsx`, `src/components/profile/` |
| **AI Measurements** | ✅ Backend Ready | Customer | `api/python-engine/`, `src/components/wizard/step3/AiMeasurementPanel.tsx` (mock) |
| **Google Maps** | ✅ Complete | Customer (registration) | `src/components/auth/LocationPicker.tsx`, `src/lib/geocode.functions.ts` |
| **Payment Processing** | Mock | Customer | `src/components/wizard/step5/InvoiceView.tsx` |
| **Real-Time Notifications** | ❌ Planned | All | — |

### 3.2 Feature Descriptions & Code Locations

#### 3.2.1 User Authentication & Authorization

**Description**: Three-role system (customer, tailor, admin) with mock authentication based on username keywords.

**How it works**:
- **Login**: Username contains "admin" → admin role; contains "tailor" or "khalil" → tailor; else → customer
- **Register**: Always creates customer accounts
- **Persistence**: Role stored in `localStorage` under `khayyat.role` and `khayyat.auth`

**Code Locations**:
- Context Provider: `src/context/AppContext.tsx` (lines 1-120)
  - `login()` method (keyword detection logic)
  - `register()` method (customer-only)
  - `logout()` method
  - `setRole()` method (for RoleSwitcher preview)

- Login Page: `src/routes/login.tsx` (lines 1-150)
  - Zod validation (username 3-32 chars, password 6+ chars)
  - Split-panel layout with emerald gradient
- Register Page: `src/routes/register.tsx` (lines 1-200)
  - Full name, email, username, password, confirm password
  - LocationPicker component (Google Maps interactive pin)
  - Zod validation with location non-null check
- RoleSwitcher: `src/components/layout/RoleSwitcher.tsx` (dev-only role preview dropdown)

**Conditional Rendering Examples**:
- Navbar links change based on role (`src/components/layout/Navbar.tsx`)
- Admin dashboard only visible to admins (`src/routes/_layout/admin.tsx`)
- Portfolio owner actions only visible to tailors (`src/components/portfolio/OwnerActions.tsx`)

---

#### 3.2.2 Design Wizard (4-Step Custom Jallabiya Creator)

**Description**: Guided multi-step form for designing a custom Jallabiya with fabric, color, sleeve style, embroidery, fasteners, collar, and back stitch options.

**Steps**:
1. **Select Tailor**: Choose from 8 master tailors via dropdown + proximity map
2. **Customize Design**: Select fabric, color, sleeve, embroidery, fasteners, collar, back stitch (or use presets)
3. **Provide Measurements**: 10 body measurements (manual input + optional AI upload panel)
4. **Review & Confirm**: Order summary with pricing breakdown

**Code Locations**:
- Wizard Route: `src/routes/_layout/wizard.tsx` (main orchestrator)
- Context Provider: `src/components/wizard/WizardContext.tsx` (state management)
  - `step`, `tailorId`, `radiusKm`, `design`, `preset`, `measurements`
  - `canAdvance` computed per step

  - `nextStep()`, `prevStep()`, `confirmOrder()` methods
- Progress Bar: `src/components/wizard/WizardProgress.tsx` (horizontal stepper)
- Footer Navigation: `src/components/wizard/WizardFooter.tsx` (Back/Next buttons)

**Step Components**:
- Step 1: `src/components/wizard/step1/`
  - `TailorDropdown.tsx` — Select dropdown with avatar + rating
  - `MockMap.tsx` — Animated proximity map with pins + radius slider
- Step 2: `src/components/wizard/step2/`
  - `PresetBar.tsx` — Quick-select style buttons (Traditional Sudanese, Saudi, Emirati, etc.)
  - `CustomizerGrid.tsx` — Full customization grid (7 sections × multiple options)
  - `SwatchSelect.tsx` — Reusable swatch selector component
- Step 3: `src/components/wizard/step3/`
  - `MeasurementsForm.tsx` — 10-field form (chest, waist, hip, shoulder, arm, inseam, etc.)
  - `AiMeasurementPanel.tsx` — Mock AI photo upload (2-second delay simulation)
- Step 4: `src/components/wizard/step4/`
  - `OrderSummary.tsx` — 3 review cards (tailor info, design config, measurements)

**Data Catalogues**: `src/lib/wizard-data.ts`
- `FABRICS` (5 types with prices: $40–$180)
- `FABRIC_COLORS` (7 colors with CSS gradients)
- `SLEEVES`, `EMBROIDERY_PLACEMENTS`, `EMBROIDERY_PATTERNS`, `FASTENERS`, `BUTTON_COLORS`, `COLLARS`, `BACK_STITCH_PATTERNS`
- `STYLE_PRESETS` (5 regional defaults)
- `TAILOR_INVENTORY` (per-tailor availability map)

**Pricing Logic**: `src/context/OrdersContext.tsx` → `createOrder()` method
- Base: Fabric price + $90 labor
- Embroidery: $25 per placement (collar/cuffs/hem)
- Delivery: $15
- Tax: 15% of subtotal


---

#### 3.2.3 Tailor Portfolio System

**Description**: Public portfolio pages for each tailor showing bio, ratings, past commissions, and owner actions (add/edit posts, change avatar/name).

**Features**:
- Portfolio archive page with filters (search, city, specialty, sort by rating/experience/name)
- Individual tailor profile pages with timeline of commission posts
- Owner actions (tailors/admins can edit their own or others' profiles)
- Star ratings, years of experience, city badges

**Code Locations**:
- Portfolio Archive: `src/routes/_layout/portfolio.tsx`
  - `PortfolioFilters.tsx` — Search input, city dropdown, specialty dropdown, sort select
  - `TailorCard.tsx` — Grid card with gradient cover, avatar, rating, stats
- Individual Profile: `src/routes/_layout/portfolio.$tailorId.tsx`
  - Dynamic route with loader (validates tailor ID, throws 404 if invalid)
  - `ProfileHeader.tsx` — Cover banner with avatar, name, rating, stats
  - `PostCard.tsx` — Timeline card for each commission (title, description, customer, gradient)
  - `OwnerActions.tsx` — Floating action menu (add post, edit name, edit avatar)
- Dialogs: `src/components/portfolio/`
  - `PostDialog.tsx` — Create/edit post form (title, description, customer, gradient selector)
  - `EditNameDialog.tsx` — Change tailor display name
  - `EditAvatarDialog.tsx` — Change avatar (URL input)
  - `TailorArchivePostDialog.tsx` — Archive/delete posts
  - `AtelierLightbox.tsx` — Full-screen post image viewer

**Mock Data**: `src/lib/mock-data.ts`
- `TAILOR_PROFILES` — 8 tailors (Morocco, Egypt, Jordan, Lebanon, Tunisia, Saudi Arabia, Türkiye)

- `TAILOR_POSTS_SEED` — 24 portfolio posts with titles, descriptions, customer names, gradients
- `POST_GRADIENTS` — 8 named gradient presets (Emerald, Gold, Saffron, Rose, Indigo, Jade, Sand, Copper)

---

#### 3.2.4 Order Management & Tracking

**Description**: Customers can view all orders, see invoices, make payments, and track order stages from commission to delivery.

**5 Order Stages**:
1. **Commissioned** — Order placed with tailor
2. **Measurements Confirmed** — Tailor verified measurements
3. **Cutting** — Fabric cutting in progress
4. **Stitching** — Garment assembly
5. **Final QA & Delivery** — Quality check and shipment

**Code Locations**:
- Orders Context: `src/context/OrdersContext.tsx`
  - `orders` array (in-memory state)
  - `createOrder()` — Generates order ID, computes pricing
  - `confirmPayment()` — Sets payment method, advances to "confirmed" status
  - `advanceStage()` — Increments order stage (dev testing button)
- Orders List: `src/routes/_layout/orders.tsx`
  - Lists all customer orders with status badges
  - Links to `/invoice/$orderId` for details
- Invoice/Tracking: `src/routes/_layout/invoice.$orderId.tsx`
  - Shows `InvoiceView` (pending payment) OR `TrackingView` (confirmed orders)
- Invoice View: `src/components/wizard/step5/InvoiceView.tsx`
  - Itemized pricing table
  - Payment method selection (COD / Card)
  - Mock card form (name, number, expiry, CVV)

- Tracking View: `src/components/wizard/step5/TrackingView.tsx`
  - 5-stage progress bar with checkmarks
  - Activity log table (stage name, timestamp, note)
  - Dev "Advance stage" button (increments stage)

**Order Data Structure**:
```typescript
type Order = {
  id: string;           // e.g. "o-xyz123"
  status: "pending_payment" | "confirmed";
  paymentMethod: "cod" | "card" | null;
  tailorId: string;
  design: DesignConfig;
  measurements: Measurements;
  pricing: Pricing;
  stage: number;        // 0-4
  activities: Activity[];
  createdAt: Date;
};
```

---

#### 3.2.5 Admin Dashboard

**Description**: Administrators can manage tailor accounts, view platform statistics, add/edit/ban tailors, and monitor system health.

**Features**:
- Platform stats cards (customers, active tailors, banned tailors, orders this month)
- Tailors management table (name, atelier, city, experience, status)
- Add new tailor (provision auth account + profile)
- Edit tailor details (name, atelier, location, experience start date)
- Ban/unban tailors (date picker or permanent ban)

**Code Locations**:
- Admin Dashboard: `src/routes/_layout/admin.tsx`
  - Role gate (only `role === "admin"` can view)
  - Stats aggregation from `PLATFORM_STATS` and `tailors` array

  - Loads tailors from Supabase `profiles` table (role = "tailor")
  - `addTailor()` creates Auth user via `supabaseAdmin.auth.admin.createUser()` then inserts profile
- Dialog Components: `src/components/admin/`
  - `AddTailorDialog.tsx` — Full form (name, atelier, email, username, password, city, location, experience start date)
  - `EditTailorDialog.tsx` — Edit tailor details (same fields minus password)
  - `BanTailorDialog.tsx` — Date picker for temporary ban or checkbox for permanent
  - `TailorsTable.tsx` — Data table with Edit/Ban/Unban action buttons

**Mock Data**: `src/lib/mock-data.ts`
- `MANAGED_TAILORS_SEED` — 4 sample tailors for testing
- `PLATFORM_STATS` — { customers: 1840, ordersThisMonth: 312 }

**Key Requirement**: Admin dashboard requires Service Role Key in `.env` to create auth accounts:
```
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

#### 3.2.6 Profile Editing

**Description**: Role-specific profile editing with password gate for security.

**Customer Profile**:
- Avatar upload (URL input)
- Full name editing
- Password change
- Location editing (Google Maps LocationPicker)
- Locked fields: Email, Username

**Tailor Profile**:
- Avatar upload
- Display name editing (atelier name in header, personal name in bio)

- Locked fields: Email, Username, Atelier name

**Admin Profile**:
- Redirects to dashboard (admins cannot edit their profile)

**Code Locations**:
- Profile Route: `src/routes/_layout/profile.tsx`
  - Role gate (admin → redirect to dashboard)
  - `PasswordGate.tsx` — Security check before editing (any 4+ char password works in mock)
  - `ProfileEditForm.tsx` — Full edit form with role-conditional fields
- Components: `src/components/profile/`
  - `PasswordGate.tsx` — Password input + "Unlock" button
  - `ProfileEditForm.tsx` — Avatar, name, password (customer), location (customer), locked fields (email, username)

---

#### 3.2.7 Google Maps Integration

**Description**: Interactive map for customer registration with pin placement and reverse geocoding.

**Features**:
- Drag-and-drop pin on map
- Reverse geocode to get address from lat/lng
- Address displayed below map

**Code Locations**:
- LocationPicker: `src/components/auth/LocationPicker.tsx`
  - Google Maps JavaScript API (`@types/google.maps`)
  - `useEffect` hook to initialize map
  - Event listener on map click to update pin position
  - Calls `reverseGeocode()` server function
- Server Function: `src/lib/geocode.functions.ts`
  - TanStack Start `createServerFn` wrapper
  - Calls Lovable Connector Gateway (`connector-gateway.lovable.dev/google_maps`)

  - Uses server-side API key from `.env` (`VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`)

**Environment Variables**:
```
VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY=your-api-key
VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID=your-tracking-id
```

---

## 4. File Structure & Organization

### 4.1 Project Root Files

| File | Purpose | Essential? |
|------|---------|-----------|
| `.env` | Environment variables (Google Maps API keys, Supabase credentials) | ✅ Critical |
| `package.json` | Dependencies, scripts (dev, build, lint, format) | ✅ Critical |
| `tsconfig.json` | TypeScript config (ES2022, Bundler module, path aliases) | ✅ Critical |
| `vite.config.ts` | Vite config (delegates to `@lovable.dev/vite-tanstack-config`) | ✅ Critical |
| `wrangler.jsonc` | Cloudflare Workers config (entry: `src/server.ts`) | ✅ Critical |
| `supabase-schema.sql` | Database schema (profiles, orders, activity_logs, RLS policies) | ✅ Critical |
| `components.json` | shadcn/ui config (New York style, Tailwind v4) | ⚙️ Config |
| `eslint.config.js` | ESLint flat config (TS, React Hooks, Prettier) | ⚙️ Quality |
| `.prettierrc` | Prettier formatting rules | ⚙️ Quality |
| `bunfig.toml` | Bun package manager config (24h supply-chain guard) | ⚙️ Config |
| `Plan.md` | Development plan (Lovable AI build phases) | 📄 Docs |
| `Project_Context_Dump.md` | Existing comprehensive project documentation | 📄 Docs |


### 4.2 Source Code Structure (`src/`)

```
src/
├── start.ts                    # TanStack Start instance + error middleware
├── server.ts                   # SSR server entry (Cloudflare Workers fetch handler)
├── router.tsx                  # Router factory (QueryClient context)
├── routeTree.gen.ts           # Auto-generated route tree (DO NOT EDIT)
├── styles.css                  # Global CSS (Tailwind v4 config, design tokens)
│
├── context/                    # React Context providers
│   ├── AppContext.tsx         # Global state: role, user, auth, login/register
│   └── OrdersContext.tsx      # Order management: create, confirm, advance stage
│
├── hooks/                      # Custom React hooks
│   └── use-mobile.tsx         # Responsive breakpoint hook (768px)
│
├── lib/                        # Utilities, mock data, server functions
│   ├── error-capture.ts       # Global error listener for SSR recovery
│   ├── error-page.ts          # Branded 500 error page HTML template
│   ├── geocode.functions.ts   # Server function: reverse geocoding via Lovable/Google Maps
│   ├── mock-data.ts           # All mock data: users, tailors, posts, platform stats
│   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
│   └── wizard-data.ts         # Design catalogues: fabrics, colors, presets, inventory
│
├── routes/                     # File-based routing (TanStack Router)
│   ├── __root.tsx             # Root route: HTML shell, providers, error boundary
│   ├── _layout.tsx            # Layout wrapper: Navbar + Footer + OrdersProvider
│   ├── login.tsx              # Login page (Zod validation, mock auth)
│   ├── register.tsx           # Registration page (customer-only, LocationPicker)

│   └── _layout/                # Protected routes (require auth)
│       ├── index.tsx          # Home page: hero, trending, featured ateliers, how-it-works
│       ├── admin.tsx          # Admin dashboard: stats, tailors table, add/edit/ban dialogs
│       ├── orders.tsx         # Orders list: links to invoice/tracking per order
│       ├── portfolio.tsx      # Portfolio archive: filterable tailor grid
│       ├── portfolio.$tailorId.tsx  # Individual tailor profile: bio, posts timeline
│       ├── profile.tsx        # Profile editing (password-gated)
│       ├── wizard.tsx         # 4-step design wizard
│       └── invoice.$orderId.tsx     # Invoice/tracking view for specific order
│
└── components/                 # React components organized by domain
    ├── admin/                 # Admin dashboard components
    │   ├── AddTailorDialog.tsx
    │   ├── BanTailorDialog.tsx
    │   ├── EditTailorDialog.tsx
    │   └── TailorsTable.tsx
    │
    ├── auth/                  # Authentication components
    │   └── LocationPicker.tsx # Google Maps interactive pin + reverse geocode
    │
    ├── layout/                # Layout components (navbar, footer, etc.)
    │   ├── Footer.tsx
    │   ├── Navbar.tsx
    │   ├── PagePlaceholder.tsx
    │   ├── ProfileMenu.tsx
    │   └── RoleSwitcher.tsx
    │
    ├── portfolio/             # Portfolio & tailor profile components
    │   ├── AtelierLightbox.tsx
    │   ├── EditAvatarDialog.tsx
    │   ├── EditNameDialog.tsx

    │   ├── OwnerActions.tsx
    │   ├── PortfolioFilters.tsx
    │   ├── PostCard.tsx
    │   ├── PostDialog.tsx
    │   ├── ProfileHeader.tsx
    │   ├── StarRating.tsx
    │   ├── TailorArchivePostDialog.tsx
    │   └── TailorCard.tsx
    │
    ├── profile/               # Profile editing components
    │   ├── PasswordGate.tsx
    │   └── ProfileEditForm.tsx
    │
    ├── wizard/                # Design wizard components
    │   ├── WizardContext.tsx  # Wizard state provider
    │   ├── WizardFooter.tsx   # Navigation footer (Back/Next)
    │   ├── WizardProgress.tsx # Horizontal stepper progress bar
    │   ├── step1/             # Step 1: Tailor selection
    │   │   ├── MockMap.tsx
    │   │   └── TailorDropdown.tsx
    │   ├── step2/             # Step 2: Design customization
    │   │   ├── CustomizerGrid.tsx
    │   │   ├── PresetBar.tsx
    │   │   └── SwatchSelect.tsx
    │   ├── step3/             # Step 3: Measurements
    │   │   ├── AiMeasurementPanel.tsx
    │   │   └── MeasurementsForm.tsx
    │   ├── step4/             # Step 4: Order review
    │   │   └── OrderSummary.tsx
    │   └── step5/             # Step 5: Invoice & tracking (used in /invoice route)
    │       ├── InvoiceView.tsx
    │       └── TrackingView.tsx
    │

    └── ui/                    # 47 shadcn/ui primitives (Radix UI wrappers)
        ├── accordion.tsx
        ├── alert-dialog.tsx
        ├── button.tsx
        ├── card.tsx
        ├── dialog.tsx
        ├── dropdown-menu.tsx
        ├── input.tsx
        ├── select.tsx
        ├── table.tsx
        └── ... (38 more components)
```

### 4.3 Python AI Backend Structure (`api/python-engine/`)

```
api/python-engine/
├── tailorvision/              # Main Python package
│   ├── __init__.py           # Public API: TailorVisionPipeline, PipelineConfig
│   ├── __main__.py           # CLI entry point (python -m tailorvision)
│   ├── pipeline.py           # 8-stage orchestrator
│   ├── config.py             # PipelineConfig dataclass
│   ├── schema.py             # Pydantic output models (MeasurementResult)
│   ├── exceptions.py         # Typed exception hierarchy
│   │
│   ├── input/                # Stage 1-2: validation & preprocessing
│   │   ├── loader.py
│   │   ├── validator.py
│   │   └── preprocessor.py
│   │
│   ├── vision/               # Stage 3: pose & segmentation
│   │   ├── pose_estimator.py # MediaPipe PoseLandmarker backend
│   │   ├── segmentor.py
│   │   └── keypoint_lifter.py

│   │
│   ├── fit/                  # Stage 4-5: SMPL-X shape fitting
│   │   ├── body_model_adapter.py
│   │   ├── pose_fit_engine.py
│   │   └── anthropometric_prior.py
│   │
│   ├── scale/                # Stage 6: metric scale recovery
│   │   └── scale_recovery_engine.py
│   │
│   ├── measure/              # Stage 7: measurement extraction
│   │   ├── measurement_engine.py
│   │   └── uncertainty.py
│   │
│   ├── tailor/               # Stage 8a: garment mapping
│   │   ├── ease_tables.py
│   │   └── tailoring_mapper.py
│   │
│   ├── quality/              # Stage 8b: QA reporting
│   │   └── quality_reporter.py
│   │
│   └── api/                  # CLI and FastAPI server
│       ├── cli.py            # Click CLI (tailor-vision measure ...)
│       └── server.py         # FastAPI endpoints (POST /measure)
│
├── models/                   # Model file storage (git-ignored)
│   ├── smplx/
│   │   ├── SMPLX_MALE.npz
│   │   ├── SMPLX_FEMALE.npz
│   │   └── SMPLX_NEUTRAL.npz
│   └── mediapipe/
│       └── pose_landmarker_heavy.task
│
├── third_party/              # External libraries (git-ignored clone)
│   └── SMPL-Anthropometry/   # git clone from GitHub
│

├── tests/                    # Unit tests (pytest)
│   ├── conftest.py
│   ├── test_validator.py
│   ├── test_scale_recovery.py
│   ├── test_tailoring_mapper.py
│   └── ... (8 more test files)
│
├── images/                   # Sample client photos for testing
│   ├── sample1_front.jpg
│   ├── sample1_side.jpg
│   └── ...
│
├── output/                   # Auto-created (result.json, debug overlays)
├── requirements.txt          # pip dependency list
├── pyproject.toml            # Package metadata, entry points
├── README.md                 # Full documentation
└── start-ai.ps1             # PowerShell script to start FastAPI server
```

**Essential Files**:
- ✅ **Critical**: `tailorvision/`, `models/`, `third_party/`, `requirements.txt`, `pyproject.toml`
- ⚙️ **Config**: `pyproject.toml` (package metadata, CLI entry points)
- 📄 **Docs**: `README.md` (installation guide, usage examples, API reference)

---

## 5. Data Flow & Actor Journeys

### 5.1 Customer Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   User → Register Page (/register)
         ├─ Fill form (name, email, username, password, confirm password)
         ├─ LocationPicker (Google Maps pin + reverse geocode)

         └─ Submit → AppContext.register() → Set role = "customer"
                                         → Navigate to /

2. LOGIN
   User → Login Page (/login)
         ├─ Enter username + password
         └─ Submit → AppContext.login() → Detect role from username
                                         → Navigate to /

3. BROWSE PORTFOLIOS
   Customer → Home (/) → Click "Browse Portfolios"
              ├─ Portfolio Archive (/portfolio)
              │   ├─ Filter by city, specialty, sort
              │   └─ Click tailor card
              │
              └─ Individual Portfolio (/portfolio/$tailorId)
                  ├─ View bio, ratings, years of experience
                  └─ View timeline of past commissions (posts)

4. DESIGN WIZARD (4 Steps)
   Customer → Home (/) → Click "Design Your Jallabiya Now!"
              ├─ Step 1: Select Tailor
              │   ├─ TailorDropdown (choose from 8 tailors)
              │   └─ MockMap (proximity map with radius slider)
              │
              ├─ Step 2: Customize Design
              │   ├─ PresetBar (quick-select: Traditional Sudanese, Saudi, etc.)
              │   └─ CustomizerGrid (fabric, color, sleeve, embroidery, fasteners, collar, back stitch)
              │
              ├─ Step 3: Provide Measurements
              │   ├─ MeasurementsForm (10 fields: chest, waist, hip, shoulder, arm, inseam, etc.)
              │   └─ AiMeasurementPanel (optional: upload 2 photos → mock 2-sec delay)
              │

              └─ Step 4: Review & Confirm
                  ├─ OrderSummary (3 cards: tailor info, design config, measurements)
                  └─ Click "Confirm Order" → WizardContext.confirmOrder()
                                           → OrdersContext.createOrder() (compute pricing)
                                           → Navigate to /invoice/$orderId

5. PAYMENT & TRACKING
   Customer → Invoice Page (/invoice/$orderId)
              ├─ InvoiceView (if status = "pending_payment")
              │   ├─ Itemized pricing table
              │   ├─ Select payment method (COD / Card)
              │   ├─ Mock card form (name, number, expiry, CVV)
              │   └─ Click "Complete Payment" → OrdersContext.confirmPayment()
              │                                → Reload page
              │
              └─ TrackingView (if status = "confirmed")
                  ├─ 5-stage progress bar (Commissioned → Measurements → Cutting → Stitching → QA & Delivery)
                  ├─ Activity log table (stage, timestamp, note)
                  └─ Dev button: "Advance Stage" → OrdersContext.advanceStage()

6. PROFILE MANAGEMENT
   Customer → Navbar → Profile Menu → "Profile"
              └─ Profile Page (/profile)
                  ├─ PasswordGate (enter password → unlock)
                  └─ ProfileEditForm
                      ├─ Avatar upload (URL input)
                      ├─ Full name editing
                      ├─ Password change
                      ├─ Location editing (LocationPicker)
                      └─ Locked fields: Email, Username
```


### 5.2 Tailor Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                       TAILOR JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. PROVISIONING (by Admin)
   Admin → Admin Dashboard (/admin)
         ├─ Click "Add Tailor"
         └─ AddTailorDialog
             ├─ Fill form (name, atelier, email, username, password, city, location, experience)
             └─ Submit → Admin calls supabaseAdmin.auth.admin.createUser()
                      → Insert profile into `profiles` table (role = "tailor")

2. LOGIN
   Tailor → Login Page (/login)
          ├─ Enter username (contains "tailor" or "khalil") + password
          └─ Submit → AppContext.login() → Detect role = "tailor"
                                         → Navigate to /

3. PORTFOLIO MANAGEMENT
   Tailor → Browse to own portfolio (/portfolio/$tailorId)
          ├─ View public profile (bio, ratings, posts)
          └─ OwnerActions (floating action menu)
              ├─ Add Post → PostDialog (title, description, customer, gradient)
              ├─ Edit Post → PostDialog (pre-filled)
              ├─ Archive Post → TailorArchivePostDialog (confirm delete)
              ├─ Edit Name → EditNameDialog (change display name)
              └─ Edit Avatar → EditAvatarDialog (URL input)

4. PROFILE EDITING
   Tailor → Navbar → Profile Menu → "Profile"
          └─ Profile Page (/profile)

              ├─ PasswordGate (enter password → unlock)
              └─ ProfileEditForm
                  ├─ Avatar upload
                  ├─ Display name editing
                  └─ Locked fields: Email, Username, Atelier name

5. ORDER FULFILLMENT (Planned)
   [Future feature: Tailors receive notifications when orders are placed]
   [Future feature: Tailors advance order stages from their dashboard]
```

### 5.3 Admin Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   Admin → Login Page (/login)
         ├─ Enter username (contains "admin") + password
         └─ Submit → AppContext.login() → Detect role = "admin"
                                        → Navigate to /

2. DASHBOARD
   Admin → Home (/) → Click "Open Admin Dashboard"
         └─ Admin Dashboard (/admin)
             ├─ View platform stats (customers, active tailors, banned tailors, orders)
             └─ Tailors management table

3. TAILOR MANAGEMENT
   Admin → Admin Dashboard (/admin)
         ├─ Add Tailor
         │   └─ AddTailorDialog → Create Auth user + profile
         │
         ├─ Edit Tailor
         │   └─ EditTailorDialog → Update profile details
         │

         ├─ Ban Tailor
         │   └─ BanTailorDialog → Set ban date (temporary or permanent)
         │
         └─ Unban Tailor
             └─ Click "Unban" in table → Remove ban date

4. PORTFOLIO MODERATION
   Admin → Browse any portfolio (/portfolio/$tailorId)
         └─ OwnerActions (admins can edit ANY tailor's profile)
             ├─ Edit posts
             ├─ Archive inappropriate posts
             ├─ Edit name/avatar
             └─ Ban tailor if needed

5. PROFILE (Restricted)
   Admin → Navbar → Profile Menu → "Profile"
         └─ Redirects to /admin (admins cannot edit their own profile)
```

### 5.4 Data Flow Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                          DATA FLOW                                 │
└───────────────────────────────────────────────────────────────────┘

FRONT-END (React)
     │
     ├─ User Input (forms, clicks)
     │      │
     │      ▼
     ├─ React Context (In-Memory State)
     │      ├─ AppContext (role, user, auth)
     │      ├─ OrdersContext (orders[], pricing)
     │      └─ WizardContext (step, design, measurements)
     │             │
     │             ▼
     ├─ Mock Data (Static Arrays)
     │      ├─ lib/mock-data.ts (TAILOR_PROFILES, TAILOR_POSTS)
     │      └─ lib/wizard-data.ts (FABRICS, COLORS, PRESETS)
     │

     └─ Server Functions (TanStack Start)
            └─ reverseGeocode(lat, lng) → Lovable Connector → Google Maps API

BACK-END (Supabase)
     │
     ├─ Database (PostgreSQL)
     │      ├─ profiles (role, name, location, rating)
     │      ├─ orders (status, payment_method, total_price)
     │      ├─ order_items (tailor_id, design, measurements, stage)
     │      └─ activity_logs (order_item_id, stage, note)
     │             │
     │             ▼
     └─ Row-Level Security (RLS)
            ├─ Customers can view their own orders
            ├─ Tailors can view orders containing their items
            └─ Admins can view/edit all data

AI SERVICE (Python FastAPI)
     │
     ├─ Input: 2 photos (front, side) + height (optional)
     │      │
     │      ▼
     ├─ Pipeline (8 stages)
     │      ├─ Stage 1-2: Validation & Preprocessing
     │      ├─ Stage 3: Pose Estimation (MediaPipe)
     │      ├─ Stage 4-5: SMPL-X Shape Fitting (PyTorch)
     │      ├─ Stage 6: Scale Recovery (known height / heuristic)
     │      ├─ Stage 7: Measurement Extraction (SMPL-Anthropometry)
     │      └─ Stage 8: Quality Report + Tailoring Recommendations
     │             │
     │             ▼
     └─ Output: JSON (16 measurements in cm + confidence + uncertainty)
```

---

## 6. Key Components Reference


### 6.1 Context Providers

| Component | File | Purpose | State | Methods |
|-----------|------|---------|-------|---------|
| **AppProvider** | `src/context/AppContext.tsx` | Global auth & role management | `role`, `isAuthenticated`, `user` | `login()`, `register()`, `logout()`, `setRole()` |
| **OrdersProvider** | `src/context/OrdersContext.tsx` | Order state management | `orders[]` | `createOrder()`, `confirmPayment()`, `advanceStage()` |
| **WizardProvider** | `src/components/wizard/WizardContext.tsx` | Wizard step state | `step`, `tailorId`, `design`, `measurements` | `nextStep()`, `prevStep()`, `confirmOrder()` |

### 6.2 Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| **Navbar** | `src/components/layout/Navbar.tsx` | Sticky navbar with role-aware nav links, ProfileMenu, RoleSwitcher |
| **Footer** | `src/components/layout/Footer.tsx` | Site footer with nav columns and social links |
| **ProfileMenu** | `src/components/layout/ProfileMenu.tsx` | Avatar dropdown menu (Profile, Orders, Dashboard, Logout) |
| **RoleSwitcher** | `src/components/layout/RoleSwitcher.tsx` | Dev-only dropdown to preview different roles |
| **PagePlaceholder** | `src/components/layout/PagePlaceholder.tsx` | Centered placeholder for restricted/empty pages |

### 6.3 Wizard Components

| Component | File | Purpose |
|-----------|------|---------|
| **WizardProgress** | `src/components/wizard/WizardProgress.tsx` | Horizontal stepper progress bar (4 steps) |

| **WizardFooter** | `src/components/wizard/WizardFooter.tsx` | Navigation footer (Back/Next, Confirm) |
| **TailorDropdown** | `src/components/wizard/step1/TailorDropdown.tsx` | Select dropdown with avatar + rating |
| **MockMap** | `src/components/wizard/step1/MockMap.tsx` | Animated proximity map with pins + radius slider |
| **PresetBar** | `src/components/wizard/step2/PresetBar.tsx` | Quick-select style preset buttons |
| **CustomizerGrid** | `src/components/wizard/step2/CustomizerGrid.tsx` | Full customization grid (7 sections) |
| **SwatchSelect** | `src/components/wizard/step2/SwatchSelect.tsx` | Reusable swatch selector component |
| **MeasurementsForm** | `src/components/wizard/step3/MeasurementsForm.tsx` | 10-field body measurement form |
| **AiMeasurementPanel** | `src/components/wizard/step3/AiMeasurementPanel.tsx` | Mock AI photo upload (2-sec delay) |
| **OrderSummary** | `src/components/wizard/step4/OrderSummary.tsx` | 3 review cards (tailor, design, measurements) |

### 6.4 Portfolio Components

| Component | File | Purpose |
|-----------|------|---------|
| **PortfolioFilters** | `src/components/portfolio/PortfolioFilters.tsx` | Search + filter bar (city, specialty, sort) |
| **TailorCard** | `src/components/portfolio/TailorCard.tsx` | Portfolio grid card for a tailor |
| **ProfileHeader** | `src/components/portfolio/ProfileHeader.tsx` | Tailor profile cover + avatar + stats banner |
| **PostCard** | `src/components/portfolio/PostCard.tsx` | Timeline card for a tailor's commission post |

| **OwnerActions** | `src/components/portfolio/OwnerActions.tsx` | Floating action menu (add post, edit name/avatar) |
| **PostDialog** | `src/components/portfolio/PostDialog.tsx` | Create/edit post dialog (title, description, gradient) |
| **EditNameDialog** | `src/components/portfolio/EditNameDialog.tsx` | Dialog to change tailor display name |
| **EditAvatarDialog** | `src/components/portfolio/EditAvatarDialog.tsx` | Dialog to change tailor avatar (URL input) |
| **StarRating** | `src/components/portfolio/StarRating.tsx` | Read-only star rating display |
| **AtelierLightbox** | `src/components/portfolio/AtelierLightbox.tsx` | Full-screen post image viewer |

### 6.5 Admin Components

| Component | File | Purpose |
|-----------|------|---------|
| **TailorsTable** | `src/components/admin/TailorsTable.tsx` | Data table of all managed tailors |
| **AddTailorDialog** | `src/components/admin/AddTailorDialog.tsx` | Dialog to provision a new tailor account |
| **EditTailorDialog** | `src/components/admin/EditTailorDialog.tsx` | Dialog to edit tailor details |
| **BanTailorDialog** | `src/components/admin/BanTailorDialog.tsx` | Dialog to ban a tailor (date picker or permanent) |

### 6.6 shadcn/ui Components

47 pre-built Radix UI components in `src/components/ui/`:

- **Form Controls**: Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Input OTP
- **Data Display**: Card, Table, Badge, Avatar, Progress, Separator, Ornament, Skeleton
- **Overlays**: Dialog, Alert Dialog, Drawer, Sheet, Popover, Hover Card, Tooltip, Context Menu, Dropdown Menu
- **Navigation**: Tabs, Accordion, Breadcrumb, Navigation Menu, Menubar, Sidebar

- **Layout**: Collapsible, Resizable, Scroll Area, Aspect Ratio
- **Feedback**: Alert, Sonner (Toast), Command Palette
- **Visualization**: Calendar, Carousel, Chart, Day Picker
- **Misc**: Form (react-hook-form wrapper), Toggle, Toggle Group, Pagination

---

## 7. Database Schema

### 7.1 Schema Overview

The database is hosted on Supabase (PostgreSQL) with Row-Level Security (RLS) policies for multi-tenant data isolation.

**Tables**:
1. `profiles` — User profiles (customer, tailor, admin)
2. `orders` — Order headers (customer, status, payment, total)
3. `order_items` — Order line items (tailor, design, measurements, stage)
4. `activity_logs` — Order stage progression logs

### 7.2 Table Definitions

#### 7.2.1 `profiles` Table

```sql
CREATE TYPE public.user_role AS ENUM ('customer', 'tailor', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,                -- Links to Supabase Auth user ID
  role public.user_role NOT NULL DEFAULT 'customer',
  
  -- Shared fields
  full_name TEXT,
  username TEXT UNIQUE,
  
  -- Location fields (customer & tailor)
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT,
  
  -- Tailor-specific fields
  atelier_name TEXT,
  experience_start_date DATE,

  
  -- Tailor rating (updated manually or via future trigger)
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**RLS Policies**:
- ✅ Public read access (anyone can view profiles/tailors)
- ✅ Users can update their own profile
- ✅ Users can insert their own profile (used during registration)

---

#### 7.2.2 `orders` Table

```sql
CREATE TYPE public.order_status AS ENUM ('pending_payment', 'confirmed');
CREATE TYPE public.payment_method AS ENUM ('cod', 'card');

CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,                          -- e.g. "o-xyz123"
  customer_id UUID REFERENCES public.profiles(id),
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  payment_method public.payment_method,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**RLS Policies**:
- ✅ Customers can view their own orders
- ✅ Tailors can view orders containing their items
- ✅ Customers can insert their own orders
- ✅ Customers can update their own order status (confirm payment)

---

#### 7.2.3 `order_items` Table

```sql
CREATE TABLE public.order_items (
  id TEXT PRIMARY KEY,                          -- e.g. "item-xyz123"

  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  tailor_id UUID REFERENCES public.profiles(id),
  design JSONB NOT NULL,                        -- Full design config (fabric, color, etc.)
  measurements JSONB NOT NULL,                  -- 10 body measurements
  pricing JSONB NOT NULL,                       -- Itemized pricing breakdown
  stage INTEGER NOT NULL DEFAULT 0,             -- 0-4 (Commissioned → QA & Delivery)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**RLS Policies**:
- ✅ Customers can view items in their orders
- ✅ Tailors can view their own items
- ✅ Customers can insert items (as part of order creation)
- ✅ Tailors can update stage on their own items

---

#### 7.2.4 `activity_logs` Table

```sql
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id TEXT REFERENCES public.order_items(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,                       -- Stage number (0-4)
  note TEXT,                                    -- Activity description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**RLS Policies**:
- ✅ Customers can view logs for their orders
- ✅ Tailors can view logs for their items
- ✅ Customers/tailors can insert logs (customer on creation, tailor on advance)

---

### 7.3 Security Functions (SECURITY DEFINER)


Two helper functions prevent infinite recursion in RLS policies:

```sql
CREATE OR REPLACE FUNCTION public.is_tailor_for_order(order_id_param text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.order_items
    WHERE order_id = order_id_param AND tailor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_customer_for_order(order_id_param text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id_param AND customer_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 8. AI Measurement System

### 8.1 Overview

**TailorVision** is a professional-grade Python tool that extracts 16 standard body measurements from two client photographs (front + side view).

**Core Technologies**:
- **SMPL-X**: 3D parametric body model (10 shape parameters: betas)
- **MediaPipe**: Pose estimation (33 keypoints)
- **SMPL-Anthropometry**: Measurement extraction from SMPL-X vertices
- **PyTorch**: Shape fitting optimizer (Adam, 200 iterations)

### 8.2 Pipeline Stages

The measurement pipeline runs 8 sequential stages:

1. **Input Validation**: Checks resolution, blur variance, body completeness

2. **Preprocessing**: Resize to max 640px height, optional background removal
3. **Pose Estimation + Segmentation**: MediaPipe PoseLandmarker (33 keypoints)
4. **Keypoint Fusion**: Fuses front + side views into BiViewPose
5. **SMPL-X Shape Fitting**: PyTorch Adam optimizer over 10 beta parameters
6. **Metric Scale Recovery**: known_height / heuristic / normalized fallback
7. **Measurement Extraction**: SMPL-Anthropometry MeasureBody on T-pose vertices
8. **Quality Report + Tailoring Map**: Aggregates scores, applies ease allowance

### 8.3 16 Measurements Extracted

| Label | Key | Measurement |
|-------|-----|-------------|
| A | `head_circumference` | Head circumference |
| B | `neck_circumference` | Neck circumference |
| C | `shoulder_to_crotch_height` | Shoulder to crotch height |
| D | `chest_circumference` | Chest circumference |
| E | `waist_circumference` | Waist circumference |
| F | `hip_circumference` | Hip circumference |
| G | `wrist_right_circumference` | Wrist right circumference |
| H | `bicep_right_circumference` | Bicep right circumference |
| I | `forearm_right_circumference` | Forearm right circumference |
| J | `arm_right_length` | Arm right length |
| K | `inside_leg_height` | Inside leg height |
| L | `thigh_left_circumference` | Thigh left circumference |
| M | `calf_left_circumference` | Calf left circumference |
| N | `ankle_left_circumference` | Ankle left circumference |
| O | `shoulder_breadth` | Shoulder breadth |
| P | `height` | Full body height |


### 8.4 Usage Examples

#### CLI Usage

```bash
# Minimal (height unknown)
python -m tailorvision measure \
  --front images/sample1_front.jpg \
  --side  images/sample1_side.jpg

# With known height (recommended)
python -m tailorvision measure \
  --front  images/sample1_front.jpg \
  --side   images/sample1_side.jpg  \
  --height 136                      \
  --gender male

# Full options
python -m tailorvision measure \
  --front   images/sample1_front.jpg \
  --side    images/sample1_side.jpg  \
  --height  136                      \
  --gender  male                     \
  --garment traditional              \
  --output  output_sample1.json      \
  --verbose
```

#### Python API Usage

```python
from tailorvision import TailorVisionPipeline, PipelineConfig

config = PipelineConfig(
    known_height_cm=136.0,
    gender="male",
    garment_type="traditional",
    device="cpu",
    save_debug_artifacts=True,
)

pipeline = TailorVisionPipeline(config)
result = pipeline.run("images/sample1_front.jpg", "images/sample1_side.jpg")

print(result.measurements_cm)
# {'height': 134.5, 'chest_circumference': 81.5, ...}

result.save_json("output_sample1.json")
```


#### FastAPI Server Usage

```bash
# Start the server
cd api/python-engine
.venv_311\Scripts\activate
uvicorn tailorvision.api.server:app --host 0.0.0.0 --port 8000 --reload

# Make a request
curl -X POST http://localhost:8000/measure \
  -F "front=@images/sample1_front.jpg" \
  -F "side=@images/sample1_side.jpg" \
  -F "height=136" \
  -F "gender=male"
```

### 8.5 Output JSON Schema

```json
{
  "body_model_type": "smplx",
  "gender": "male",
  "smplx_parameters": {
    "betas": [-0.12, 0.43, ...],
    "pose_neutralized": true,
    "gender": "male"
  },
  "measurements_cm": {
    "height": 134.5,
    "chest_circumference": 81.5,
    "waist_circumference": 71.4,
    "hip_circumference": 79.1,
    "shoulder_breadth": 27.3,
    "arm_right_length": 42.1,
    "inside_leg_height": 58.2,
    "...": "..."
  },
  "measurement_confidence": {
    "chest_circumference": "HIGH",
    "waist_circumference": "HIGH",
    "...": "..."
  },
  "uncertainty_cm": {
    "chest_circumference": 0.1,
    "waist_circumference": 0.1,
    "...": "..."
  },
  "scale": {
    "mode": "known_height",
    "scale_factor": 0.7844,
    "confidence": 0.97

  },
  "quality_scores": { "overall": 0.58 },
  "warnings": ["POOR_FIT_CONVERGENCE"],
  "tailoring_recommendations": {
    "garment_type": "traditional",
    "collar_size_cm": 32.9,
    "chest_with_ease_cm": 93.5,
    "waist_with_ease_cm": 85.4,
    "hip_with_ease_cm": 95.1,
    "sleeve_length_cm": 44.1,
    "inseam_cm": 61.2,
    "shoulder_seam_cm": 13.7
  }
}
```

### 8.6 Accuracy Notes

| Scenario | Expected Accuracy |
|----------|-------------------|
| Known height + clear photos + fitted clothes | ±1–2 cm on circumferences |
| Known height + moderate clothing | ±2–4 cm |
| Unknown height, heuristic scale | ±5–15% relative |
| Loose/baggy clothing | Inflated 2–8 cm (warning emitted) |
| Non-upright pose | Compressed lengths (BAD_POSTURE warning) |
| POOR_FIT_CONVERGENCE | Increase `fit_iterations` in config |

### 8.7 Integration Status

**Current State**: Python backend is fully functional and tested. Front-end has a mock AI panel with 2-second delay simulation.

**Next Steps**:
1. Create FastAPI endpoint: `POST /api/measure` (multipart/form-data with front/side images + height)
2. Update `AiMeasurementPanel.tsx` to replace mock delay with real `fetch()` call to `http://localhost:8000/measure`

3. Handle response: map `measurements_cm` object to `WizardContext.setMeasurements()`
4. Add error handling for unreachable API (graceful fallback to manual entry)
5. Deploy Python service to cloud (Docker container → AWS EC2 / Google Cloud Run)

---

## 9. Development & Deployment

### 9.1 Local Development Setup

#### Prerequisites

- **Node.js** 18+ (or Bun for faster installs)
- **Python** 3.10–3.12 (for AI backend)
- **Git** (for cloning SMPL-Anthropometry)
- **Supabase Account** (free tier)
- **Google Maps API Key** (for LocationPicker)

#### Front-End Setup

```bash
# Clone repository
git clone <repo-url>
cd Khayyatt_E-commerce_Jallabiyas_Making_Website

# Install dependencies
bun install
# or: npm install

# Copy .env.example to .env and fill in values
cp .env.example .env

# Start development server
bun run dev
# or: npm run dev

# Open browser: http://localhost:5173
```

#### Environment Variables (`.env`)

```env
# Google Maps API (for LocationPicker)
VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY=your-api-key
VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID=your-tracking-id

# Supabase (for database & auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (for admin dashboard to create tailor accounts)
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Python AI Backend Setup

```bash
# Navigate to Python engine directory
cd api/python-engine

# Create virtual environment (Python 3.11 recommended)
python -m venv .venv_311
.venv_311\Scripts\activate  # Windows
# source .venv_311/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt
# or: pip install -e .

# Download SMPL-X model files (register at smpl-x.is.tue.mpg.de)
# Place in: models/smplx/SMPLX_MALE.npz, SMPLX_FEMALE.npz, SMPLX_NEUTRAL.npz

# Clone SMPL-Anthropometry
git clone https://github.com/DavidBoja/SMPL-Anthropometry third_party/SMPL-Anthropometry

# Download MediaPipe model (Windows PowerShell)
New-Item -ItemType Directory -Force -Path models\mediapipe
Invoke-WebRequest `
  -Uri "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task" `
  -OutFile "models\mediapipe\pose_landmarker_heavy.task"

# Test the CLI
python -m tailorvision measure \
  --front images/sample1_front.jpg \
  --side  images/sample1_side.jpg \
  --height 136

# Start FastAPI server
uvicorn tailorvision.api.server:app --host 0.0.0.0 --port 8000 --reload
```


### 9.2 Database Setup (Supabase)

1. **Create Supabase Project**: Go to https://supabase.com and create a new project
2. **Run Schema**: Copy contents of `supabase-schema.sql` into Supabase SQL Editor and execute
3. **Get Credentials**: Copy project URL and anon key to `.env`
4. **Service Role Key**: Copy service role key to `.env` (needed for admin dashboard)

### 9.3 Available Scripts

```bash
# Development
bun run dev              # Start Vite dev server (http://localhost:5173)
bun run dev:ai          # Start Python AI backend (http://localhost:8000)

# Build
bun run build           # Production build (Cloudflare Workers)
bun run build:dev       # Development build (with source maps)
bun run preview         # Preview production build

# Code Quality
bun run lint            # Run ESLint
bun run format          # Run Prettier

# AI Backend (Python)
cd api/python-engine
python -m tailorvision measure --help           # CLI help
pytest tests/ -v                                 # Run tests
uvicorn tailorvision.api.server:app --reload   # Start FastAPI server
```

### 9.4 Production Deployment

#### Front-End (Cloudflare Workers)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login


# Build for production
bun run build

# Deploy to Cloudflare Workers
wrangler deploy

# Your site is live at: https://khayyat.your-username.workers.dev
```

**Environment Variables**: Set in Cloudflare dashboard under Workers → Settings → Variables

#### Python AI Backend (Docker + Cloud)

**Option 1: AWS EC2**

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY tailorvision/ ./tailorvision/
COPY models/ ./models/
COPY third_party/ ./third_party/

CMD ["uvicorn", "tailorvision.api.server:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and push to ECR
docker build -t khayyat-ai .
docker tag khayyat-ai:latest <ecr-repo-url>:latest
docker push <ecr-repo-url>:latest

# Deploy to EC2 or ECS
```

**Option 2: Google Cloud Run**

```bash
# Build and deploy
gcloud run deploy khayyat-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Option 3: Azure Container Instances**

```bash
az container create \
  --resource-group khayyat-rg \
  --name khayyat-ai \
  --image <acr-repo-url>/khayyat-ai:latest \
  --cpu 2 \
  --memory 4 \

  --ports 8000 \
  --dns-name-label khayyat-ai
```

### 9.5 Testing

#### Front-End Testing

No automated tests currently implemented. Recommended tools:
- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Type Checking**: `tsc --noEmit`

#### Python Backend Testing

```bash
cd api/python-engine

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=tailorvision --cov-report=term-missing

# Run specific test file
pytest tests/test_scale_recovery.py -v
```

**Test Coverage**:
- ✅ Image validation logic (`test_validator.py`)
- ✅ Scale recovery modes (`test_scale_recovery.py`)
- ✅ Tailoring ease tables (`test_tailoring_mapper.py`)
- ✅ Pose estimator stub (`test_pose_estimator.py`)
- ✅ Keypoint fusion (`test_keypoint_lifter.py`)
- ✅ Pydantic schemas (`test_schema.py`)

### 9.6 Known Issues & Limitations

**Front-End**:
1. ❌ **No real authentication** — Mock auth with keyword-based role detection
2. ❌ **No persistence** — All state lost on page refresh (except localStorage for role/auth)
3. ❌ **No payment processing** — Mock payment flow (COD/Card selection only)
4. ❌ **No real-time updates** — No WebSocket/SSE for order status notifications
5. ❌ **No image uploads** — Avatars and post images use URL inputs (no Supabase Storage integration)

6. ⚠️ **AI integration pending** — Front-end has mock 2-second delay; backend is ready but not connected

**Python Backend**:
1. ⚠️ **Requires model downloads** — SMPL-X models (registration required), MediaPipe model, SMPL-Anthropometry clone
2. ⚠️ **CPU-only by default** — GPU acceleration requires CUDA-enabled PyTorch build
3. ⚠️ **Accuracy limitations** — Best with known height + fitted clothing; loose clothing inflates circumferences
4. ⚠️ **Photo requirements** — Needs plain background, upright pose, full body visible, natural lighting

**Database**:
1. ⚠️ **RLS not tested thoroughly** — Row-level security policies need comprehensive testing
2. ⚠️ **No automated backups** — Manual backup configuration required
3. ⚠️ **No data migration scripts** — Schema changes require manual SQL execution

### 9.7 Future Enhancements

**High Priority**:
1. ✅ Connect front-end to Supabase Auth (replace mock auth)
2. ✅ Integrate Python AI backend with front-end (replace 2-sec delay)
3. ✅ Implement Supabase Storage for image uploads
4. ✅ Add payment gateway integration (Stripe / PayPal)
5. ✅ Implement real-time order tracking (WebSocket / Supabase Realtime)

**Medium Priority**:
6. ✅ Add customer reviews and ratings system
7. ✅ Implement tailor dashboard (view orders, manage inventory)
8. ✅ Add email notifications (order confirmation, status updates)
9. ✅ Implement chat/messaging between customers and tailors
10. ✅ Add multi-language support (Arabic, French, English)

**Low Priority**:
11. ✅ Add social media sharing for portfolio posts

12. ✅ Implement advanced search and filtering
13. ✅ Add analytics dashboard for admins
14. ✅ Create mobile apps (React Native / Flutter)
15. ✅ Implement referral program

---

## 10. Key Takeaways & Project Summary

### 10.1 What Makes This Project Special

1. **Cultural Preservation**: Bridges traditional MENA garment tailoring with modern e-commerce
2. **AI Innovation**: Uses cutting-edge computer vision (SMPL-X, MediaPipe) for body measurements
3. **Full-Stack Complexity**: Demonstrates React 19, TypeScript, SSR, Python ML, PostgreSQL, edge deployment
4. **Real-World Ready**: Database schema with RLS, role-based access, order tracking, payment flow
5. **Production-Quality Code**: Type-safe, modular, well-documented, follows best practices

### 10.2 Technical Highlights

- **Modern React**: React 19 with TanStack Start (SSR), TanStack Router (type-safe routing)
- **Design System**: Tailwind CSS v4 with oklch() colors, dual font system (Cormorant Garamond + Inter)
- **Component Library**: 47 shadcn/ui components (Radix UI wrappers)
- **State Management**: React Context (no Redux/Zustand) — AppContext, OrdersContext, WizardContext
- **AI Backend**: 8-stage measurement pipeline with PyTorch optimization, Monte-Carlo uncertainty
- **Database**: Supabase with Row-Level Security, multi-tenant data isolation
- **Deployment**: Cloudflare Workers (edge), Docker containers (AI service)

### 10.3 Learning Outcomes

This project demonstrates proficiency in:


1. **Front-End Development**: React 19, TypeScript, SSR, file-based routing, responsive design
2. **UI/UX Design**: Design systems, Tailwind CSS, accessibility, mobile-first
3. **State Management**: Context API, derived state, local storage persistence
4. **Back-End Development**: Python, FastAPI, RESTful APIs, microservices
5. **Machine Learning**: Computer vision, pose estimation, 3D body modeling, optimization
6. **Database Design**: Relational schema, foreign keys, JSONB, RLS policies, security functions
7. **Authentication & Authorization**: Multi-role systems, RLS, JWT (ready)
8. **DevOps**: Git, Docker, cloud deployment (Cloudflare, AWS, GCP, Azure)
9. **API Integration**: Google Maps, Supabase, external services
10. **Testing**: Unit tests (pytest), type checking (TypeScript)

### 10.4 Recommended Reading Order

For someone reviewing this codebase:

1. **Start Here**: `PROJECT_DOCUMENTATION.md` (this file) → Overview, architecture, features
2. **Understand Data**: `src/lib/mock-data.ts`, `src/lib/wizard-data.ts` → See all mock entities
3. **Follow a Journey**: Pick one actor flow (Customer, Tailor, Admin) and trace it through the code
4. **Explore Components**: Start with routes (`src/routes/`), then drill into components
5. **Database Schema**: Read `supabase-schema.sql` to understand data model
6. **AI Backend**: Read `api/python-engine/README.md` for full AI system documentation

### 10.5 Quick Reference: Where to Find Things

**Need to...** | **Go to...**
---|---
Understand project structure | Section 4 (File Structure)
See all features | Section 3 (Features & Functionality)
Follow user journeys | Section 5 (Data Flow & Actor Journeys)
Understand database | Section 7 (Database Schema)
Learn about AI backend | Section 8 (AI Measurement System)

Set up development environment | Section 9.1 (Local Development Setup)
Deploy to production | Section 9.4 (Production Deployment)
Find component reference | Section 6 (Key Components Reference)
See tech stack | Section 2 (Architecture & Technology Stack)

---

## Appendix A: File Tree with Essentiality

```
Khayyatt_E-commerce_Jallabiyas_Making_Website/
│
├── 🔴 .env                               # CRITICAL: Environment variables (API keys, DB credentials)
├── 🔴 package.json                       # CRITICAL: Dependencies, scripts
├── 🔴 tsconfig.json                      # CRITICAL: TypeScript configuration
├── 🔴 vite.config.ts                     # CRITICAL: Build configuration
├── 🔴 wrangler.jsonc                     # CRITICAL: Cloudflare Workers config
├── 🔴 supabase-schema.sql                # CRITICAL: Database schema
├── 🟡 components.json                    # CONFIG: shadcn/ui settings
├── 🟡 eslint.config.js                   # QUALITY: Linting rules
├── 🟡 .prettierrc                        # QUALITY: Code formatting
├── 🟡 bunfig.toml                        # CONFIG: Package manager settings
├── 📄 Plan.md                            # DOCS: Development roadmap
├── 📄 Project_Context_Dump.md            # DOCS: Existing documentation
├── 📄 PROJECT_DOCUMENTATION.md           # DOCS: This file (comprehensive guide)
│
├── src/
│   ├── 🔴 start.ts                       # CRITICAL: TanStack Start entry point
│   ├── 🔴 server.ts                      # CRITICAL: SSR server entry (Cloudflare Workers)
│   ├── 🔴 router.tsx                     # CRITICAL: Router factory
│   ├── 🟢 routeTree.gen.ts              # AUTO: Generated route tree (do not edit)

│   ├── 🔴 styles.css                     # CRITICAL: Global styles, design tokens
│   │
│   ├── context/                          # State management
│   │   ├── 🔴 AppContext.tsx            # CRITICAL: Global auth & role
│   │   └── 🔴 OrdersContext.tsx         # CRITICAL: Order management
│   │
│   ├── lib/                              # Utilities & data
│   │   ├── 🔴 mock-data.ts              # CRITICAL: All mock entities
│   │   ├── 🔴 wizard-data.ts            # CRITICAL: Design catalogues
│   │   ├── 🔴 utils.ts                  # CRITICAL: Helper functions
│   │   ├── 🟡 geocode.functions.ts      # FEATURE: Reverse geocoding
│   │   ├── 🟡 error-capture.ts          # FEATURE: SSR error recovery
│   │   └── 🟡 error-page.ts             # FEATURE: Branded 500 page
│   │
│   ├── routes/                           # File-based routing
│   │   ├── 🔴 __root.tsx                # CRITICAL: Root layout, providers
│   │   ├── 🔴 _layout.tsx               # CRITICAL: Authenticated layout
│   │   ├── 🔴 login.tsx                 # CRITICAL: Login page
│   │   ├── 🔴 register.tsx              # CRITICAL: Registration page
│   │   └── _layout/
│   │       ├── 🔴 index.tsx             # CRITICAL: Home page
│   │       ├── 🔴 wizard.tsx            # CRITICAL: Design wizard
│   │       ├── 🔴 admin.tsx             # CRITICAL: Admin dashboard
│   │       ├── 🟡 portfolio.tsx         # FEATURE: Tailor archive
│   │       ├── 🟡 portfolio.$tailorId.tsx  # FEATURE: Individual profile
│   │       ├── 🟡 orders.tsx            # FEATURE: Orders list
│   │       ├── 🟡 invoice.$orderId.tsx  # FEATURE: Invoice/tracking
│   │       └── 🟡 profile.tsx           # FEATURE: Profile editing
│   │
│   └── components/                       # React components
│       ├── admin/                        # Admin dashboard (4 files)
│       ├── auth/                         # LocationPicker (1 file)

│       ├── layout/                        # Navbar, Footer, etc. (5 files)
│       ├── portfolio/                    # Portfolio components (11 files)
│       ├── profile/                      # Profile editing (2 files)
│       ├── wizard/                       # Wizard components (13 files)
│       └── ui/                           # 47 shadcn/ui primitives
│
└── api/python-engine/                    # AI measurement backend
    ├── 🔴 tailorvision/                  # CRITICAL: Main Python package (8 modules)
    ├── 🔴 models/                        # CRITICAL: SMPL-X + MediaPipe models (download required)
    ├── 🔴 third_party/                   # CRITICAL: SMPL-Anthropometry (clone required)
    ├── 🔴 requirements.txt               # CRITICAL: Python dependencies
    ├── 🔴 pyproject.toml                 # CRITICAL: Package metadata
    ├── 📄 README.md                      # DOCS: Full AI system documentation
    ├── 🟡 tests/                         # QUALITY: Unit tests (8 files)
    ├── 🟢 images/                        # SAMPLE: Test photos
    └── 🟢 output/                        # OUTPUT: Auto-generated results

Legend:
🔴 CRITICAL: Essential for project to run
🟡 FEATURE/QUALITY: Important but not blocking
🟢 AUTO/SAMPLE/OUTPUT: Generated or example files
📄 DOCS: Documentation
```

---

## Appendix B: Common Tasks & Solutions

### Task: Add a new route

1. Create file in `src/routes/` (e.g., `src/routes/_layout/new-page.tsx`)
2. Export route with `createFileRoute("/_layout/new-page")`

3. Define component and head metadata
4. TanStack Router auto-generates `routeTree.gen.ts`
5. Add link in Navbar or other navigation

### Task: Add a new shadcn/ui component

```bash
# List available components
npx shadcn-ui@latest add

# Add a specific component (e.g., tooltip)
npx shadcn-ui@latest add tooltip
```

Component will be created in `src/components/ui/tooltip.tsx`

### Task: Add global state

1. Create new context file in `src/context/` (e.g., `NotificationsContext.tsx`)
2. Define state, provider, and hook (`useNotifications()`)
3. Wrap app in provider (add to `__root.tsx` or `_layout.tsx`)
4. Import and use hook in components

### Task: Connect to Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Usage in component
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'tailor');
```

### Task: Add environment variable

1. Add to `.env` file: `VITE_NEW_VAR=value`
2. Access in code: `import.meta.env.VITE_NEW_VAR`
3. For production: Add to Cloudflare Workers → Settings → Variables


### Task: Debug SSR errors

1. Check browser console (client-side errors)
2. Check terminal output (server-side errors)
3. Enable verbose logging in `src/start.ts`
4. Check `src/lib/error-capture.ts` for captured errors
5. Use `console.log()` in server functions (visible in terminal)

### Task: Update mock data

1. Edit `src/lib/mock-data.ts` or `src/lib/wizard-data.ts`
2. Changes reflect immediately in dev mode (HMR)
3. No database sync needed (all in-memory)

### Task: Run Python AI backend

```bash
cd api/python-engine
.venv_311\Scripts\activate
uvicorn tailorvision.api.server:app --reload
```

Server runs on `http://localhost:8000`

### Task: Test a feature without full setup

Use the RoleSwitcher in the navbar (dev mode):
1. Login with any credentials
2. Click role dropdown in navbar
3. Switch between Customer, Tailor, Admin
4. Explore features specific to each role

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Jallabiya** | Traditional loose-fitting robe worn in Middle East and North Africa |
| **Atelier** | Tailor's workshop or studio |
| **MENA** | Middle East and North Africa region |
| **Bespoke** | Custom-made to individual specifications |
| **SSR** | Server-Side Rendering (pages rendered on server before sending to browser) |
| **RLS** | Row-Level Security (database access control at row level) |

| **SMPL-X** | Expressive 3D body model with face and hands |
| **MediaPipe** | Google's ML framework for pose estimation |
| **Anthropometry** | Scientific study and measurement of human body |
| **Edge Runtime** | Code running on CDN edge servers (close to users) |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Component library built on Radix UI |
| **TanStack** | Suite of tools for React (Router, Query, Start) |
| **Cloudflare Workers** | Serverless platform running on edge network |
| **Supabase** | Open-source Firebase alternative (PostgreSQL + Auth + Storage) |

---

## Appendix D: Credits & Resources

### Technologies Used

- **React**: https://react.dev
- **TanStack Start**: https://tanstack.com/start
- **TanStack Router**: https://tanstack.com/router
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Supabase**: https://supabase.com
- **Cloudflare Workers**: https://workers.cloudflare.com
- **SMPL-X**: https://smpl-x.is.tue.mpg.de
- **MediaPipe**: https://developers.google.com/mediapipe
- **SMPL-Anthropometry**: https://github.com/DavidBoja/SMPL-Anthropometry
- **FastAPI**: https://fastapi.tiangolo.com
- **PyTorch**: https://pytorch.org

### Design Inspiration

- Traditional Middle Eastern aesthetics
- Modern e-commerce UX patterns
- Luxury brand websites (focus on craft and heritage)

### Learning Resources


- **React 19**: https://react.dev/blog/2024/04/25/react-19
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS v4**: https://tailwindcss.com/docs/v4-beta
- **TanStack Router Guide**: https://tanstack.com/router/latest/docs
- **Supabase Docs**: https://supabase.com/docs
- **Python Type Hints**: https://docs.python.org/3/library/typing.html

---

## Appendix E: Contact & Support

**Project Author**: [Your Name]  
**Purpose**: Software Engineering Diploma Graduation Project  
**Institution**: [Your Institution]  
**Year**: 2026

**Repository**: [GitHub URL]  
**Demo**: [Live Demo URL]

**For Questions**:
- Email: [your-email@example.com]
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [Your GitHub Profile]

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 5, 2026 | Initial comprehensive documentation |

---

**End of Documentation**

This document provides a complete reference for understanding, developing, and deploying the Khayyat E-Commerce Platform. For updates or corrections, please refer to the repository's issue tracker or contact the project author.

---

**© 2026 Khayyat Project. All rights reserved.**

