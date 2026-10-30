# Management and Maintenance Scripts

This directory contains utility and administration scripts for database seeding, migrations, and operational maintenance.

## Scripts Overview

### `seed_admin.py`
Securely bootstraps an initial administrator account.

**Security Constraints**:
- Never creates default/hardcoded passwords (e.g. `admin123` is blocked).
- Requires explicit CLI prompt or environment variables (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).
- Validates password strength (minimum 10 characters).
- Hashes password using Argon2 via `pwdlib`.
- Safe to re-run: exits idempotently if the administrator account already exists.

**Usage**:
```bash
# Interactive mode (prompts for email and masked password)
python scripts/seed_admin.py

# Non-interactive / CI / Container execution
SEED_ADMIN_EMAIL="admin@pjjewellery.com" SEED_ADMIN_PASSWORD="YourStrongSecurePassword123!" python scripts/seed_admin.py
```
