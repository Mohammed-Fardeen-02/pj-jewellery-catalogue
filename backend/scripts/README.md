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

### `seed_catalogue_with_media.py`
Master catalogue, media, and customer order bootstrap runner.

**Key Features & Seed Data**:
- **5 Luxury Categories**: Rings, Necklaces, Bracelets, Earrings, Pendants & Brooches (all active and indexed).
- **20 Fine Jewellery Products**: Exactly 4 products per category with realistic weights, purities (Platinum 950, 18K Yellow/White/Rose Gold), natural gemstones (Diamond, Emerald, Sapphire, South Sea Pearl, Tanzanite), and pricing.
- **100 Real High-Resolution Images**: Exactly 5 photographic shots per product (macro hero, 45° perspective, side profile/gallery, model styling, luxury box) uploaded directly to Cloudinary (`dkg4jpo87`) under `pj_jewellery/catalogue/`.
- **20 Stock Ledger Audit Records**: Initial stock transactions (`StockTransaction`) tracking starting inventory.
- **5 Customer Acquisition Orders**: Spanning the full lifecycle states (`confirmed`, `processing`, `shipped`, `delivered`, `pending`) with realistic customer info and line items.

**Usage**:
```bash
# 1. Standard run (uploads/links 100 images to Cloudinary):
python scripts/seed_catalogue_with_media.py

# 2. Clean wipe and reseed:
python scripts/seed_catalogue_with_media.py --force-reseed

# 3. Offline development (skip Cloudinary uploads, use direct CDN URLs):
python scripts/seed_catalogue_with_media.py --skip-cloudinary
```


