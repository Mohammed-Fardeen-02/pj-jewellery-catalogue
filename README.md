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

# 3. Seed catalogue (Rings, Necklaces, Bracelets, Earrings, Products)
docker compose exec api python scripts/seed_catalogue.py

# 4. (Optional) Seed initial administrator account
docker compose exec api python scripts/seed_admin.py
```

* **API Base URL**: `http://localhost:8000`
* **Swagger API Documentation**: `http://localhost:8000/docs`
* **ReDoc Documentation**: `http://localhost:8000/redoc`
* **Health Check**: `http://localhost:8000/health`

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
