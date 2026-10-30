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

## 🚀 Quick Start Guide

### Prerequisites
* [Docker & Docker Compose](https://www.docker.com/)
* [Node.js 20+](https://nodejs.org/) and `npm`

---

### 1. Start Backend & Database (Docker)

```bash
cd backend

# 1. Start FastAPI and PostgreSQL containers
docker compose up -d

# 2. Run database migrations
docker compose exec api alembic upgrade head

# 3. Seed catalogue (Categories & Products)
docker compose exec api python scripts/seed_catalogue.py

# 4. Seed / Synchronize Super Administrator account from .env
docker compose exec api python scripts/seed_admin.py
```

* **API Base URL**: `http://localhost:8000`
* **Swagger API Documentation**: `http://localhost:8000/docs`
* **ReDoc Documentation**: `http://localhost:8000/redoc`
* **Health Check**: `http://localhost:8000/health`
* **Super Admin Login**:
  * **Email**: `admin@pjjewellery.com`
  * **Password**: `Admin@PJ2026!Secured`
  * **Role**: `super_admin`

---

### 2. Start Frontend Application

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

---

## 🧪 Automated Testing

### Backend Test Suite (34 Tests)
Runs in isolated in-memory SQLite and PostgreSQL environments:
```bash
cd backend
docker compose exec api pytest
```
* Status: **34 of 34 passed**
* Linter check: `docker compose exec api ruff check app tests` (0 warnings/errors)

### Frontend Test Suite (17 Tests)
```bash
cd frontend
npm run test
```
* Unit tests: **17 of 17 passed**
* TypeScript verification: `npm run typecheck` (0 errors)
* ESLint verification: `npm run lint` (0 errors)
* Production build: `npm run build` (20 static pages compiled)

---

## 🔒 Security & Data Integrity
* **Password Hashing**: Argon2 cryptographic password verification via `pwdlib`.
* **Session Management**: Dual JWT token pair (`access_token` & `refresh_token`) with active database verification.
* **Storefront Boundary**: Draft and archived products are strictly excluded at the database query level (`WHERE Product.status = 'published'`).
* **Relational Safety**: Deleting categories with associated products is blocked by the backend service.
