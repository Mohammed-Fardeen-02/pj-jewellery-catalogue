# PJ — AI-Powered Jewellery Catalogue (Frontend Foundation)

A production-grade, bespoke frontend foundation for **PJ Fine Jewellery** — a single-brand luxury jewellery house featuring an editorial public storefront and a dedicated administration dashboard.

---

## 1. Project Overview

PJ operates strictly as an independent high-jewellery atelier catalogue (not a multi-vendor marketplace). The frontend architecture is structured into two distinct visual domains:

1. **Public Storefront**: Editorial jewellery catalogue showcasing signature pieces, category navigation (Rings, Necklaces, Earrings, Bracelets), piece detail views, brand storytelling, and high-jewelry aesthetics.
2. **Admin Portal**: Secure atelier management shell with dashboard metrics, product master inventory views, category classification, and architecture settings.

> **Phase Scope Note**: This phase establishes the production frontend foundation, route architecture, design system tokens, reusable UI primitives, centralized typed API client, mock data boundaries, and testing baseline. Feature-specific CRUD, auth session tokens, image storage uploads, and live AI integration are planned for subsequent phases.

---

## 2. Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **UI Runtime**: React 19 (`19.3.0`)
- **Language**: TypeScript 5 with `strict` mode
- **Styling**: Tailwind CSS v4 with bespoke luxury design tokens
- **Typography**: Google Fonts via `next/font` (`Cormorant Garamond` serif for editorial headings, `Plus Jakarta Sans` for UI)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **API Client**: Centralized native `fetch` wrapper with typed responses, timeout, and FastAPI error envelope translation
- **Testing**: [Vitest](https://vitest.dev/) 3 + [React Testing Library](https://testing-library.com/react)

---

## 3. Design Tokens & Visual Direction

The design system embodies the understated luxury and architectural precision of a high-jewellery atelier:

| Token | CSS Variable / Value | Purpose |
| :--- | :--- | :--- |
| **Warm Ivory** | `#FAF8F4` (`--background`) | Primary canvas background |
| **Pure Surface** | `#FFFFFF` (`--surface`) | Cards, dialogs, forms, content surfaces |
| **Warm Neutral** | `#F6F3EE` (`--surface-warm`)| Subtle hover states, secondary containers |
| **Charcoal Dark** | `#24211E` (`--foreground`) | Primary editorial text, high-contrast buttons |
| **Muted Stone** | `#716B64` (`--text-secondary`)| Subtitles, SKU identifiers, metadata |
| **Champagne Gold**| `#B08D57` (`--gold`) | Signature brand accents, focus rings, badges |
| **Gold Hover** | `#987642` (`--gold-hover`) | Interactive gold element hover |
| **Border Neutral**| `#E8E1D8` (`--border`) | Subtle structural borders |

---

## 4. Directory Structure

```text
frontend/
├── public/
│   └── images/                     # Local SVG jewellery placeholders & hero artwork
├── src/
│   ├── app/
│   │   ├── (storefront)/           # Public storefront route group
│   │   │   ├── layout.tsx          # Storefront layout (Header, Nav, Footer)
│   │   │   ├── page.tsx            # Atelier brand homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx        # All jewellery catalogue
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    # Piece detail showcase (specs, images, SKU)
│   │   │   └── categories/
│   │   │       └── [slug]/
│   │   │           └── page.tsx    # Category-filtered catalogue
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Administrator login with Zod validation
│   │   │   └── (dashboard)/        # Admin dashboard route group
│   │   │       ├── layout.tsx      # Admin shell (Dark sidebar, mobile drawer, topbar)
│   │   │       ├── page.tsx        # Overview metrics & recent pieces table
│   │   │       ├── products/
│   │   │       │   └── page.tsx    # Products management master
│   │   │       ├── categories/
│   │   │       │   └── page.tsx    # Category classification table
│   │   │       └── settings/
│   │   │           └── page.tsx    # Backend connection & architecture parameters
│   │   ├── globals.css             # Tailwind v4 import & custom theme variables
│   │   ├── layout.tsx              # Root HTML layout with fonts & Sonner toaster
│   │   ├── not-found.tsx           # Luxury 404 error page
│   │   └── error.tsx               # Client error boundary
│   ├── components/
│   │   ├── layout/                 # Storefront header and footer
│   │   ├── storefront/             # ProductCard, CategoryCard
│   │   └── ui/                     # Button, Badge, Card, Input, Textarea, FormField,
│   │                               # LoadingSpinner, Skeleton, EmptyState, ErrorState, PageHeader
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts           # Centralized typed ApiClient with timeout & abort
│   │   │   ├── endpoints.ts        # Centralized endpoint registry
│   │   │   └── errors.ts           # ApiError class parsing FastAPI error envelopes
│   │   ├── utils/
│   │   │   └── cn.ts               # clsx + tailwind-merge helper
│   │   ├── validation/             # Zod schemas (auth, product, category)
│   │   └── mock-data.ts            # Isolated illustrative mock catalogue data
│   └── types/
│       ├── api.ts                  # API pagination, token & health contracts
│       ├── models.ts               # Product, Category, JewelleryAttributes schemas
│       └── index.ts                # Unified type barrel export
├── tests/
│   ├── setup.ts                    # Vitest jest-dom setup
│   └── unit/
│       ├── api-client.test.ts      # Unit tests for fetch wrapper, token & errors
│       ├── ui-components.test.tsx  # Unit tests for Button, Badge, Input, Skeleton
│       └── validation.test.ts      # Unit tests for login, product, category Zod schemas
├── .env.example                    # Environment variable template
├── .env.local                      # Local developer configuration (git-ignored)
├── Dockerfile                      # Multi-stage production container build
├── next.config.ts                  # Next.js configuration with standalone output
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 5. Route Map

| URL Path | Route Group | Description |
| :--- | :--- | :--- |
| `/` | `(storefront)` | Atelier homepage with hero, featured collections, signature pieces, story |
| `/products` | `(storefront)` | Complete jewellery catalogue with grid view |
| `/products/[slug]` | `(storefront)` | Product detail view with specifications, dimensions, metal purity |
| `/categories/[slug]` | `(storefront)` | Category catalogue (e.g. `/categories/rings`, `/categories/necklaces`) |
| `/admin/login` | `admin` | Administrator login with field validation & password toggle |
| `/admin` | `admin/(dashboard)` | Overview dashboard with catalogue metrics & recent items |
| `/admin/products` | `admin/(dashboard)` | Jewellery products master management table |
| `/admin/categories` | `admin/(dashboard)` | Category taxonomy master table |
| `/admin/settings` | `admin/(dashboard)` | Gateway URL configuration & architecture inspection |

---

## 6. Centralized API Architecture

The frontend communicates with the FastAPI backend through a typed API client:

- **Target Backend URL**: `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8000`)
- **API Version Prefix**: `NEXT_PUBLIC_API_V1_PREFIX` (default: `/api/v1`)
- **FastAPI Error Envelope Translation**: Automatically unrolls backend JSON error structures (`error.code`, `error.message`, `error.details`, and `request_id`).
- **Safety**: No server secrets or AI keys are exposed on the frontend.
- **Request Cancellation**: Built-in 15s timeout with `AbortController` and chained custom signals.

### Backend Contract Verification

The frontend types (`src/types/models.ts` and `src/types/api.ts`) have been verified against the backend Pydantic schemas in `backend/app/schemas/`:

- `ProductResponse` &rarr; `Product` (UUID id, sku, title, slug, attributes dictionary, is_published, images)
- `CategoryResponse` &rarr; `Category` (UUID id, name, slug, description, is_active)
- `StandardErrorResponse` &rarr; `ApiErrorEnvelope` (error code, message, field details, request_id)
- `PaginatedResponse[T]` &rarr; `PaginatedResponse<T>` (items, total, page, limit, total_pages)
- `TokenResponse` &rarr; `TokenResponse` (access_token, token_type, expires_in, refresh_token)

---

## 7. Mock Data Isolation & Boundaries

Illustrative jewellery pieces are isolated strictly inside `src/lib/mock-data.ts`.
- Components receive typed data via props.
- No components make fake claims that mock data is coming from the backend.
- Price and specifications are clearly marked as illustrative catalog placeholders without unsupported gemstone authenticity claims.
- Real API calls throw errors if the backend is unavailable rather than silently falling back to mock data.

---

## 8. Prerequisites & Installation

### Prerequisites
- **Node.js**: v20.x or higher (`v20.19.0` tested)
- **npm**: v10.x or higher (`10.8.2` tested)

### Setup Commands

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

---

## 9. Development & Verification Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server at `http://localhost:3000` |
| `npm run build` | Builds the production bundle (with standalone Docker output) |
| `npm run start` | Runs the production build server |
| `npm run typecheck` | Validates TypeScript strict mode (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint 9 checks |
| `npm run test` | Executes Vitest unit tests |
| `npm run test:watch`| Executes Vitest in interactive watch mode |

---

## 10. Container Deployment (Docker)

A multi-stage `Dockerfile` is provided for production deployments:

```bash
# Build Docker image
docker build -t pj-jewellery-frontend .

# Run container
docker run -p 3000:3000 --env-file .env.local pj-jewellery-frontend
```

---

## 11. Known Limitations & Next Implementation Phases

### Current Foundation Status
- Visual design, layouts, routes, components, and API plumbing are complete.
- Admin login form validates inputs client-side and attempts backend verification against `/api/v1/auth/login`.

### Upcoming Phases
1. **Phase 2 — Authentication Lifecycle**:
   - Secure HttpOnly session cookie persistence
   - Protected route middleware for `/admin/*`
   - Refresh token rotation integration
2. **Phase 3 — Product & Category CRUD**:
   - Create, edit, archive product workflows
   - Real-time backend pagination & search filtering
3. **Phase 4 — Image Storage & AI Studio**:
   - Multi-image upload to backend media storage
   - AI-assisted description, tags, and category enrichment using the FastAPI AI endpoints
