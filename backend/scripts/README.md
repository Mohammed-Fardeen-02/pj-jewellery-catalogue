# Management and Maintenance Scripts

This directory contains utility and administration scripts for database seeding, migrations, and operational maintenance.

## Scripts Overview

### `seed_admin.py`
Securely bootstraps or updates the initial super administrator account.

**Key Features & Constraints**:
- Automatically reads credentials from `.env` via `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, and `SUPERADMIN_FULL_NAME` (with backward compatibility for `SEED_ADMIN_*`).
- Never permits trivial or insecure passwords (minimum 10 characters; blocks `admin`, `password`, etc.).
- Hashes password using production-grade **Argon2** via `pwdlib`.
- Synchronizes credentials safely if the administrator account already exists, ensuring role is set to `super_admin` and `is_active=True`.

**Usage**:
```bash
# 1. From .env variables (Recommended):
# Configure SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in backend/.env, then run:
python scripts/seed_admin.py

# Or in Docker:
docker compose exec api python scripts/seed_admin.py

# 2. Direct inline environment variable execution:
SUPERADMIN_EMAIL="admin@pjjewellery.com" SUPERADMIN_PASSWORD="Admin@PJ2026!Secured" python scripts/seed_admin.py
```

