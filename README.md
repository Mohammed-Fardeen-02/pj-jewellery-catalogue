# PJ — AI-Powered Jewellery Catalogue

A luxury, single-brand high jewellery catalogue featuring a bespoke customer storefront and a secure administrator portal. Handcrafted with a **Feature-First Architecture** across both the backend and frontend.

---

## 🏛️ Monorepo Architecture

This repository is organized as a unified monorepo containing both the backend service and the frontend web application:

```
pj-jewellery-catalogue/
├── backend/                       # Python FastAPI + PostgreSQL backend service
│   ├── app/
│   │   ├── modules/
│   │   │   ├── categories/       # Category Master (Models, Schemas, Repos, Services, Routes)
│   │   │   └── products/         # Product Master (Models, Schemas, Repos, Services, Routes)
│   │   ├── core/                 # Security (Argon2, JWT), Config, Logging
│   │   ├── db/                   # Async SQLAlchemy engine & base
│   │   ├── dependencies/         # Auth & Database dependency injection
│   │   └── main.py               # Lifespan, CORS, Exception handlers, Request Context
│   ├── alembic/                  # Database migration versions
│   ├── scripts/                  # CLI seed scripts (seed_admin, seed_catalogue)
│   ├── tests/                    # Integration and unit test suite (34 tests)
│   └── docker-compose.yml        # Multi-container orchestration (FastAPI + PostgreSQL)
│
├── frontend/                      # Next.js 16 (App Router) + React 19 + Tailwind CSS
│   ├── src/
│   │   ├── app/                  # Thin route shells & layouts (Storefront & Admin)
│   │   ├── features/
│   │   │   └── auth/             # Feature-first authentication module
│   │   ├── components/           # Reusable UI primitives & global layouts
│   │   └── lib/                  # Generic API client, utilities, endpoints
│   └── tests/                    # Vitest unit test suite (17 tests)
│
└── README.md                      # Monorepo documentation and startup guide
```

---

---

## ⚙️ Environment Configuration (`.env`)

A centralized template with empty variables is provided in root [`.env.example`](file:///.env.example) and backend [`backend/.env.example`](file:///backend/.env.example).

### Configuration Steps:
1. **Backend Configuration**:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. **Configure Required Variables**:
   * **Database**: `DATABASE_URL` (Preconfigured for Docker: `postgresql+asyncpg://postgres:postgres@localhost:5432/pj_jewellery_dev` or SQLite: `sqlite+aiosqlite:///./dev_local.db`).
   * **Super Administrator Credentials**:
     * `SUPERADMIN_EMAIL="admin@pjjewellery.com"`
     * `SUPERADMIN_PASSWORD="Admin@PJ2026!Secured"` (Must be at least 10 chars, hashed with Argon2)
     * `SUPERADMIN_FULL_NAME="PJ Super Administrator"`
   * **Cloudinary Media Storage** (Max 5 images per product, 1 video):
     * `CLOUDINARY_CLOUD_NAME=""` (From [Cloudinary Console](https://console.cloudinary.com))
     * `CLOUDINARY_API_KEY=""`
     * `CLOUDINARY_API_SECRET=""`
     * `CLOUDINARY_FOLDER="pj_jewellery"`
     *(Note: If left empty, Cloudinary operates in mock mode for offline local development without failing)*
   * **JWT Authentication**:
     * `JWT_SECRET_KEY="replace-this-with-a-secure-random-secret-key-at-least-32-chars-long"`
     * `ACCESS_TOKEN_EXPIRE_MINUTES=15`
     * `REFRESH_TOKEN_EXPIRE_DAYS=7`

---

## 🚀 Quick Start Guide (For Evaluators & Developers)

Follow this 3-step sequence to bring up the database, apply migrations, seed the administrator, and seed the complete catalogue with 100 real Cloudinary images and orders.

### Step 1: Database Migrations (Run Alembic First)

#### Option A: Local Python Environment
```bash
cd backend
alembic upgrade head
```

#### Option B: Docker Environment
```bash
cd backend
docker compose up -d
docker compose exec api alembic upgrade head
```

---

### Step 2: Seed / Synchronize Super Administrator

Bootstraps the administrator account with credentials from `backend/.env` (`SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`):

#### Local Python:
```bash
cd backend
python scripts/seed_admin.py
```

#### Docker:
```bash
docker compose exec api python scripts/seed_admin.py
```

* **Default Admin Email**: `admin@pjjewellery.com`
* **Default Admin Password**: `Admin@PJ2026!Secured`
* **Role**: `super_admin`

---

### Step 3: Seed Master Catalogue, 100 Real Cloudinary Images & Orders

Runs the comprehensive master seeding script:
- **5 Luxury Categories**: Rings, Necklaces, Bracelets, Earrings, Pendants & Brooches.
- **20 Fine Jewellery Products**: Exactly 4 products per category with realistic luxury specifications, weights, purities (Platinum 950, 18K Yellow/White/Rose Gold), natural gemstones (Diamond, Emerald, Sapphire, South Sea Pearl, Tanzanite), and pricing.
- **100 Real High-Resolution Images**: Exactly 5 photographic shots per piece (hero macro, 45° angle, side gallery profile, model shoot, luxury gift box) uploaded directly to Cloudinary (`dkg4jpo87`) under `pj_jewellery/catalogue/`.
- **20 Inventory Stock Transactions**: Audit records tracking initial inventory quantities.
- **5 Acquisition Orders**: Spanning full lifecycle states (`confirmed`, `processing`, `shipped`, `delivered`, `pending`) with real customer info and line items.

#### Local Python:
```bash
cd backend
python scripts/seed_catalogue_with_media.py
```
*(Tip: Add `--skip-cloudinary` for offline mode or `--force-reseed` for a clean wipe & reseed).*

#### Docker:
```bash
docker compose exec api python scripts/seed_catalogue_with_media.py
```

---

### Step 4: Start Frontend Application

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

* **Public Storefront**: `http://localhost:3000`
* **Admin Login Portal**: `http://localhost:3000/admin/login`
* **Admin Dashboard**: `http://localhost:3000/admin`
* **API Documentation**: `http://localhost:8000/docs`
* **Health Check**: `http://localhost:8000/health`

---

## 🧪 Automated Testing

### Backend Test Suite (41 Tests)
Runs in isolated async database environments:
```bash
cd backend
pytest tests/ -v
```
* Status: **41 of 41 passed**

### Frontend Test Suite (23 Tests)
```bash
cd frontend
npm run test
```
* Unit tests: **23 of 23 passed**
* TypeScript verification: `npm run typecheck` (0 errors)
* Production build: `npm run build` (Clean production bundle compile)


---

## 🔒 Security & Data Integrity
* **Password Hashing**: Argon2 cryptographic password verification via `pwdlib`.
* **Session Management**: Dual JWT token pair (`access_token` & `refresh_token`) with active database verification.
* **Storefront Boundary**: Draft and archived products are strictly excluded at the database query level (`WHERE Product.status = 'published'`).
* **Relational Safety**: Deleting categories with associated products is blocked by the backend service.
