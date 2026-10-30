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

## 4. How to Run the Backend

You can run the backend in either of **two effortless ways**:

### Option 1: Zero-Config Local Setup (Recommended & Fastest)
*No PostgreSQL installation or Docker required. Uses high-performance async SQLite out of the box with zero setup.*

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Copy environment settings (pre-configured with local DB)
cp .env.example .env

# 3. Start the server
uvicorn app.main:app --reload --port 8000
# Or: python run.py
```

- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Pre-seeded Admin User**: `admin@pjjewellery.com` / `Admin123456!`

---

### Option 2: Run with Docker Compose (Full PostgreSQL Stack)
*Starts PostgreSQL 16 Alpine and the FastAPI backend together inside Docker with automatic health checks.*

```bash
# 1. Start all containers in detached mode
docker compose up -d --build

# 2. Run initial database migration & seed admin inside Docker
docker compose exec api alembic upgrade head
docker compose exec -e SEED_ADMIN_EMAIL="admin@pjjewellery.com" -e SEED_ADMIN_PASSWORD="Admin123456!" api python scripts/seed_admin.py

# 3. View real-time logs
docker compose logs -f api

# Stop all containers
docker compose down
```

---

## 5. Database Management (Alembic)

To apply or verify database migrations:
```bash
python -m alembic upgrade head
```

---

## 6. Testing & Code Quality

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

## 7. Foundation Status & Known Limitations

### Implemented Foundation Features:
- [x] Versioned API router under `/api/v1`.
- [x] Process health probe (`GET /health`) and liveness probe (`GET /api/v1/health/live`).
- [x] Safe database readiness probe (`GET /api/v1/health/ready`) that catches connectivity failures and returns HTTP 503 without leaking hostnames, credentials, or stack traces.
- [x] Standardized error handling envelope for domain exceptions, validation errors (422), and internal exceptions (500).
- [x] Request correlation ID (`X-Request-ID`) propagation and safe duration logging.
- [x] Administrator login (`POST /api/v1/auth/login`) with Argon2 password hashing via `pwdlib`.
- [x] JWT token pair issuance (access token and refresh token) with explicit claims (`sub`, `type`, `iat`, `exp`, `jti`).
- [x] Profile endpoint (`GET /api/v1/auth/me`) with `get_current_user` and database active-status verification.
- [x] Token refresh endpoint (`POST /api/v1/auth/refresh`).
- [x] SQLAlchemy 2.0 Async ORM models for `User`, `Category`, `Product`, and `ProductImage` with Alembic migration metadata discovery.
- [x] Production Dockerfile with non-root security user and Docker Compose setup with PostgreSQL 16.

### Planned for Subsequent Milestones:
- [ ] **Full Catalogue CRUD**: Category and product administration routes return explicit `501 Not Implemented` with documentation.
- [ ] **Persistent Refresh Token Revocation / Blacklist**: Storing refresh token JTIs in Redis or database table for instant revocation upon logout.
- [ ] **Cloud Media Storage**: AWS S3 / Cloudflare R2 presigned URLs for jewellery high-resolution imagery.
- [ ] **AI-Powered Search & Semantic Tagging**: Vector embeddings and LLM jewellery attributes extraction.
- [ ] **Brand Master**: Intentionally omitted at this stage because PJ is a single-brand catalogue.
