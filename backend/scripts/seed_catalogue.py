"""Master catalogue and media seeding script entry point.

Delegates directly to seed_catalogue_with_media.py to seed:
- 5 Luxury Categories
- 20 Fine Jewellery Products (4 per category)
- 100 Real High-Resolution Jewellery Images (5 per product, uploaded to Cloudinary)
- 20 StockTransaction audit ledger entries
- 5 Customer Acquisition Orders
"""

import argparse
import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.seed_catalogue_with_media import seed_master_catalogue


def main():
    parser = argparse.ArgumentParser(description="Seed PJ Jewellery Master Catalogue with Media and Orders.")
    parser.add_argument(
        "--skip-cloudinary",
        action="store_true",
        help="Skip uploading to Cloudinary and use direct high-res CDN URLs.",
    )
    parser.add_argument(
        "--force-reseed",
        action="store_true",
        help="Cleanly wipe existing catalogue, images, and orders before reseeding.",
    )
    args = parser.parse_args()

    asyncio.run(seed_master_catalogue(skip_cloudinary=args.skip_cloudinary, force_reseed=args.force_reseed))


if __name__ == "__main__":
    main()
