# PJ — AI-Powered Jewellery Catalogue (Backend Foundation)

A clean, maintainable, secure, and extensible asynchronous backend foundation for **PJ Jewellery Catalogue**, built with **Python 3.12**, **FastAPI**, **SQLAlchemy 2.0 Async ORM**, **asyncpg**, **Pydantic v2**, and **Alembic**.

---

## 1. Architectural Overview

The backend strictly follows a layered, decoupled request flow:

```
HTTP Request
     │
     ▼
API Endpoint / Router (`app/api/v1/`)
     │
     ▼
Dependencies & Auth Validation (`app/dependencies/`)
     │
     ▼
Service Layer (`app/services/`)
     │
     ▼
Repository Layer (`app/repositories/`)
     │
     ▼
Database Layer (SQLAlchemy 2.0 Async / PostgreSQL 15+)
```

### Module Responsibilities

| Directory | Primary Responsibility |
|---|---|
| `app/api/` | HTTP routing, request parsing, status codes, OpenAPI specs, and response generation. |
| `app/core/` | Centralized config (`pydantic-settings`), Argon2 security primitives, custom exceptions, and logging. |
| `app/db/` | `DeclarativeBase`, timezone-aware timestamp mixins, async engine, and session lifecycles. |
| `app/dependencies/` | Request-scoped database sessions, JWT verification, and role-based access dependencies. |
| `app/middlewares/` | Cross-cutting concerns: `X-Request-ID` correlation and sanitized request duration logging. |
| `app/models/` | SQLAlchemy 2.0 database models (`User`, `Category`, `Product`, `ProductImage`). |
| `app/repositories/` | Async query execution, data persistence, and isolation of raw SQL/ORM constructs. |
| `app/schemas/` | Pydantic v2 validation contracts for API requests and serialized responses. |
| `app/services/` | Business rules orchestration, password checks, token issuance, and transaction flow. |
| `app/utils/` | Reusable stateless helpers (URL slug generator, pagination envelope calculator). |
| `alembic/` | Asynchronous database migrations discovering metadata dynamically from `app.models`. |
| `scripts/` | Idempotent CLI maintenance tasks (e.g. secure administrator bootstrap). |
| `tests/` | Unit and integration test suites using `pytest-asyncio` and HTTPX `AsyncClient`. |

---

## 2. Technology Stack & Key Decisions

- **Python 3.12**: Modern async features, enhanced type hint syntax (`X | Y`), and performance gains.
- **FastAPI + Uvicorn**: High-throughput async ASGI web framework with automatic OpenAPI documentation.
- **Pydantic v2 & pydantic-settings**: Fast C-based validation and centralized environment variable loading.
- **SQLAlchemy 2.0 Async ORM**: Full async query compilation using modern `select()` syntax with `asyncpg`.
- **pwdlib with Argon2**: Memory-hard password hashing recommended by OWASP, avoiding legacy bcrypt limitations.
- **PyJWT**: Secure JWT handling with explicit token claims (`sub`, `type`, `iat`, `exp`, `jti`).
- **Alembic**: Migration framework configured for async execution and automatic model metadata discovery.
- **Ruff**: Extremely fast linting and formatting enforcing standard Python conventions.
- **Docker & Docker Compose**: Multi-stage, non-root containerization with PostgreSQL 16 healthchecks.

---

## 3. Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # Application factory, CORS, exception handlers, and lifespan
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py                # Aggregated v1 router
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── health.py            # Process liveness & DB readiness probes
│   │           ├── auth.py              # Login, token refresh, and /me profile
│   │           ├── categories.py        # 501 placeholders for domain milestone
│   │           ├── products.py          # 501 placeholders for domain milestone
│   │           └── brands.py            # Single-brand architecture notice
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                    # Pydantic Settings with env validation
│   │   ├── security.py                  # Argon2 hashing & PyJWT token utilities
│   │   ├── exceptions.py                # Custom domain exceptions
│   │   └── logging.py                   # Correlation ID logging setup
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py                      # DeclarativeBase & TimestampMixin
│   │   └── session.py                   # Async engine & sessionmaker
│   ├── models/
│   │   ├── __init__.py                  # Unified Base.metadata registry
│   │   ├── user.py                      # Administrator user model
│   │   ├── category.py                  # Catalogue category model
│   │   ├── product.py                   # Catalogue product model
│   │   └── product_image.py             # Product image media reference model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                      # Auth requests, responses, and tokens
│   │   ├── category.py                  # Category DTOs
│   │   ├── product.py                   # Product DTOs
│   │   └── common.py                    # Paginated & standard error envelopes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py              # Authentication & token pair issuance
│   │   ├── category_service.py          # Category orchestration skeleton
│   │   └── product_service.py           # Product orchestration skeleton
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repository.py           # User query persistence
│   │   ├── category_repository.py       # Category query persistence
│   │   └── product_repository.py        # Product query persistence
│   ├── dependencies/
│   │   ├── __init__.py
│   │   ├── database.py                  # Request-scoped get_db session dependency
│   │   └── auth.py                      # Current user & role validation dependencies
│   ├── middlewares/
│   │   ├── __init__.py
│   │   └── request_context.py           # Correlation ID & request duration middleware
│   └── utils/
│       ├── __init__.py
│       ├── pagination.py                # Pagination helper
│       └── slug.py                      # Unicode-safe slug generator
├── alembic/
│   ├── env.py                           # Async migration runner with Base.metadata
│   └── versions/                        # Migration scripts
├── tests/
│   ├── conftest.py                      # In-memory test db, client fixture, overrides
│   ├── unit/
│   │   ├── test_config.py               # Settings validation tests
│   │   ├── test_security.py             # Argon2 & JWT tests
│   │   └── test_utils.py                # Slug & pagination tests
│   └── integration/
│       ├── test_health.py               # Liveness & DB readiness tests (connected & failed)
│       ├── test_middleware.py           # Request ID propagation tests
│       └── test_error_handling.py       # Error envelopes & auth flow tests
├── scripts/
│   ├── README.md
│   └── seed_admin.py                    # Secure administrator bootstrap script
├── .env.example                         # Documented configuration template
├── .gitignore
├── .dockerignore
├── Dockerfile                           # Production Dockerfile with non-root appuser
├── docker-compose.yml                   # PostgreSQL 16 + API development stack
├── alembic.ini                          # Migration tool configuration
├── pyproject.toml                       # Python package dependencies & tool settings
└── README.md
```

---

## 4. Environment Variables Configuration (`.env`)

The backend uses `pydantic-settings` to parse and validate all environment variables from `backend/.env`.

A template with empty placeholder variables is provided in [`.env.example`](file:///backend/.env.example). Create your local configuration file by running:
```bash
cp .env.example .env
```

### Complete Environment Variables Reference

| Variable | Type | Default Value | Description |
|---|---|---|---|
| `APP_NAME` | `string` | `"PJ Jewellery Catalogue API"` | Human-readable application title. |
| `APP_ENV` | `string` | `"development"` | Environment profile (`development`, `staging`, `production`, `test`). |
| `API_V1_PREFIX` | `string` | `"/api/v1"` | URL prefix for all version 1 endpoints. |
| `DEBUG` | `boolean` | `true` (dev) / `false` (prod) | FastAPI debug and verbose error mode. Must be `false` in production. |
| `HOST` | `string` | `"0.0.0.0"` | Host IP address to bind Uvicorn server. |
| `PORT` | `integer` | `8000` | Port number to bind Uvicorn server. |
| `DATABASE_URL` | `string` | `postgresql+asyncpg://...` | Asynchronous SQLAlchemy connection string (`asyncpg` for PostgreSQL or `aiosqlite` for local SQLite). |
| `DATABASE_POOL_SIZE` | `integer` | `10` | SQLAlchemy connection pool size. |
| `DATABASE_MAX_OVERFLOW`| `integer` | `20` | Max overflow connections beyond pool size. |
| `DATABASE_POOL_TIMEOUT` | `integer` | `30` | Timeout in seconds waiting for pool connection. |
| `DATABASE_POOL_PRE_PING`| `boolean` | `true` | Tests connection validity prior to checkout. |
| `JWT_SECRET_KEY` | `string` | `""` | Cryptographic secret for signing tokens (minimum 32 chars in staging/production). |
| `JWT_ALGORITHM` | `string` | `"HS256"` | JWT signature algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `integer` | `15` | Expiration window for access tokens (minutes). |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `integer` | `7` | Expiration window for refresh tokens (days). |
| `SUPERADMIN_EMAIL` | `string` | `"admin@pjjewellery.com"` | Super admin bootstrap email for `seed_admin.py`. |
| `SUPERADMIN_PASSWORD` | `string` | `"Admin@PJ2026!Secured"` | Super admin bootstrap password (minimum 10 characters, hashed with Argon2). |
| `SUPERADMIN_FULL_NAME`| `string` | `"PJ Super Administrator"` | Super admin display name. |
| `CLOUDINARY_CLOUD_NAME`| `string` | `""` | Cloudinary account cloud name (from Cloudinary dashboard). |
| `CLOUDINARY_API_KEY` | `string` | `""` | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | `string` | `""` | Cloudinary API Secret. |
| `CLOUDINARY_FOLDER` | `string` | `"pj_jewellery"` | Root directory name for uploaded media assets in Cloudinary. |
| `FRONTEND_URL` | `string` | `"http://localhost:3000"` | Client URL for CORS policy and redirects. |
| `ALLOWED_ORIGINS` | `JSON array` | `["http://localhost:3000", ...]` | Explicit CORS allowed origins list. |
| `LOG_LEVEL` | `string` | `"INFO"` | Console log verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |

> [!NOTE]
> **Cloudinary Offline Fallback**: If `CLOUDINARY_*` keys are left blank, the application automatically operates in mock mode for offline local development and automated testing without raising errors.

---

## 5. How to Run the Backend

You can run the backend in either of **two effortless ways**:

### Option 1: Zero-Config Local Setup (Recommended & Fastest)
*No PostgreSQL installation or Docker required. Uses high-performance async SQLite out of the box with zero setup.*

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Copy environment settings
cp .env.example .env

# 3. Seed super administrator from environment
python scripts/seed_admin.py

# 4. Start the server
uvicorn app.main:app --reload --port 8000
# Or: python run.py
```

- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Default Super Admin**: `admin@pjjewellery.com` / `Admin@PJ2026!Secured`

---

### Option 2: Run with Docker Compose (Full PostgreSQL Stack)
*Starts PostgreSQL 16 Alpine and the FastAPI backend together inside Docker with automatic health checks.*

```bash
# 1. Start all containers in detached mode
docker compose up -d --build

# 2. Run initial database migration & seed admin inside Docker
docker compose exec api alembic upgrade head
docker compose exec api python scripts/seed_admin.py

# 3. View real-time logs
docker compose logs -f api

# Stop all containers
docker compose down
```

---

## 6. Database Management (Alembic)

To apply or verify database migrations:
```bash
python -m alembic upgrade head
```

---

## 7. Testing & Code Quality

### Running Tests
All tests run in-memory using `aiosqlite` and mocked dependencies for instant, zero-flakiness execution:
```bash
python -m pytest -v
```

### Running Linting & Formatting Checks
```bash
# Lint checks
python -m ruff check .

# Format checks
python -m ruff format --check .

# Auto-format
python -m ruff format .
```

---

## 8. Implementation Status

### Implemented Features:
- [x] Versioned API router under `/api/v1`.
- [x] Process health probe (`GET /health`) and liveness probe (`GET /api/v1/health/live`).
- [x] Safe database readiness probe (`GET /api/v1/health/ready`) with sanitized responses.
- [x] Standardized error handling envelope for domain exceptions, validation errors (422), and internal exceptions (500).
- [x] Request correlation ID (`X-Request-ID`) propagation and safe duration logging.
- [x] Administrator login (`POST /api/v1/auth/login`) with Argon2 password hashing via `pwdlib`.
- [x] JWT token pair issuance (access token and refresh token) with explicit claims (`sub`, `type`, `iat`, `exp`, `jti`).
- [x] Profile endpoint (`GET /api/v1/auth/me`) with `get_current_user` and database active-status verification.
- [x] Token refresh endpoint (`POST /api/v1/auth/refresh`).
- [x] Initial super administrator seeding script (`scripts/seed_admin.py`) configured via `.env`.
- [x] **Category Master**: Complete CRUD (`/api/v1/categories`), slug generation, active/inactive cascading, and validation.
- [x] **Product Master**: Complete CRUD (`/api/v1/products`), multi-image uploads (up to 5 images), video upload, and status management.
- [x] **Cloudinary Media Storage**: Asynchronous image and video upload integration with automatic local mock fallback.
- [x] **Public Storefront APIs**: Filtered endpoints (`/api/v1/public/categories`, `/api/v1/public/products`) serving only active categories and active/published items.
- [x] SQLAlchemy 2.0 Async ORM models for `User`, `Category`, `Product`, and `ProductImage` with Alembic migrations.
- [x] Production Dockerfile with non-root security user and Docker Compose setup with PostgreSQL 16.

