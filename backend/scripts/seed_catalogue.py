"""Seed sample jewellery categories and products for testing and verification."""

import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import async_session_factory
from app.modules.categories.models import Category
from app.modules.categories.repository import CategoryRepository
from app.modules.products.models import Product, ProductImage, ProductStatus
from app.modules.products.repository import ProductRepository

SAMPLE_CATEGORIES = [
    {
        "name": "Rings",
        "slug": "rings",
        "description": "Bespoke solitaire diamonds, eternity bands, and precious gemstone rings.",
        "is_active": True,
    },
    {
        "name": "Necklaces",
        "slug": "necklaces",
        "description": "High artistry pendants, diamond collaterals, and choker masterpieces.",
        "is_active": True,
    },
    {
        "name": "Bracelets",
        "slug": "bracelets",
        "description": "Handcrafted diamond tennis bracelets and sculpted gold cuffs.",
        "is_active": True,
    },
    {
        "name": "Earrings",
        "slug": "earrings",
        "description": "Solitaire diamond studs, floral drops, and evening chandelier earrings.",
        "is_active": True,
    },
    {
        "name": "Seasonal Archive",
        "slug": "seasonal-archive",
        "description": "Private inactive collection archive.",
        "is_active": False,
    },
]

SAMPLE_PRODUCTS = [
    {
        "sku": "PJ-RNG-001",
        "title": "Aura Solitaire Diamond Ring",
        "slug": "aura-solitaire-diamond-ring",
        "description": "An exquisite 1.50-carat round brilliant solitaire diamond mounted on a hand-carved Platinum 950 band.",
        "category_slug": "rings",
        "tags": ["diamond", "solitaire", "engagement", "bridal"],
        "keywords": ["platinum ring", "1.5 carat diamond", "high jewellery"],
        "attributes": {
            "metal_type": "Platinum 950",
            "purity": "950",
            "gross_weight": 6.8,
            "net_weight": 6.5,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 1.50,
            "occasion": "Bridal",
            "collection": "Aura",
            "design_style": "Solitaire",
        },
        "status": ProductStatus.PUBLISHED,
        "images": [
            {
                "image_url": "/images/products/aura-ring-1.jpg",
                "alt_text": "Aura Solitaire Diamond Ring Top Angle",
                "is_primary": True,
                "display_order": 0,
            },
            {
                "image_url": "/images/products/aura-ring-2.jpg",
                "alt_text": "Aura Solitaire Diamond Ring Side Profile",
                "is_primary": False,
                "display_order": 1,
            },
        ],
    },
    {
        "sku": "PJ-NCK-001",
        "title": "Celestial Sapphire & Diamond Pendant",
        "slug": "celestial-sapphire-diamond-pendant",
        "description": "A deep royal blue Ceylon sapphire haloed by brilliant cut diamonds, suspended from an 18K yellow gold chain.",
        "category_slug": "necklaces",
        "tags": ["sapphire", "pendant", "necklace", "gemstone"],
        "keywords": ["blue sapphire", "yellow gold necklace", "royal blue"],
        "attributes": {
            "metal_type": "18K Yellow Gold",
            "purity": "750",
            "gross_weight": 12.2,
            "net_weight": 11.4,
            "gemstone_type": "Ceylon Sapphire",
            "stone_weight": 2.20,
            "occasion": "Gala",
            "collection": "Celestial",
            "design_style": "Halo Pendant",
        },
        "status": ProductStatus.PUBLISHED,
        "images": [
            {
                "image_url": "/images/products/celestial-pendant-1.jpg",
                "alt_text": "Celestial Sapphire Pendant Front View",
                "is_primary": True,
                "display_order": 0,
            }
        ],
    },
    {
        "sku": "PJ-BRC-001",
        "title": "Eternity Diamond Tennis Bracelet",
        "slug": "eternity-diamond-tennis-bracelet",
        "description": "Continuous line of fifty-four matched diamonds in classic 18K white gold four-prong basket settings.",
        "category_slug": "bracelets",
        "tags": ["tennis bracelet", "diamond", "wristwear", "classic"],
        "keywords": ["diamond bracelet", "18k white gold", "eternity"],
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 15.0,
            "net_weight": 14.1,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 4.50,
            "occasion": "Everyday Luxury",
            "collection": "Eternity",
            "design_style": "Tennis Bracelet",
        },
        "status": ProductStatus.PUBLISHED,
        "images": [
            {
                "image_url": "/images/products/eternity-bracelet-1.jpg",
                "alt_text": "Eternity Tennis Bracelet",
                "is_primary": True,
                "display_order": 0,
            }
        ],
    },
    {
        "sku": "PJ-EAR-001",
        "title": "Solstice Emerald Drop Earrings",
        "slug": "solstice-emerald-drop-earrings",
        "description": "Colombian pear-shaped emerald drops with radiant diamond pave tops in 18K white gold.",
        "category_slug": "earrings",
        "tags": ["emerald", "earrings", "gemstone", "bespoke"],
        "keywords": ["colombian emerald", "drop earrings"],
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 9.2,
            "net_weight": 8.1,
            "gemstone_type": "Colombian Emerald",
            "stone_weight": 3.10,
            "occasion": "Red Carpet",
            "collection": "Solstice",
            "design_style": "Drop",
        },
        "status": ProductStatus.DRAFT,
        "images": [],
    },
    {
        "sku": "PJ-RNG-002",
        "title": "Heritage Art Deco Diamond Ring",
        "slug": "heritage-art-deco-diamond-ring",
        "description": "Archived vintage geometric design with step-cut diamonds and milgrain detailing.",
        "category_slug": "rings",
        "tags": ["vintage", "art deco", "ring", "archived"],
        "keywords": ["antique ring", "art deco jewellery"],
        "attributes": {
            "metal_type": "Platinum 950",
            "purity": "950",
            "gross_weight": 7.4,
            "net_weight": 7.0,
            "gemstone_type": "Diamond",
            "stone_weight": 1.10,
            "occasion": "Collectors",
            "collection": "Heritage",
            "design_style": "Art Deco",
        },
        "status": ProductStatus.ARCHIVED,
        "images": [],
    },
]


async def seed() -> None:
    async with async_session_factory() as session:
        cat_repo = CategoryRepository(session)
        prod_repo = ProductRepository(session)

        category_map = {}

        # 1. Seed Categories
        print("--- Seeding Categories ---")
        for cat_data in SAMPLE_CATEGORIES:
            existing = await cat_repo.get_by_slug(cat_data["slug"])
            if existing:
                print(f"Category '{cat_data['name']}' already exists.")
                category_map[cat_data["slug"]] = existing[0]
            else:
                cat = Category(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    description=cat_data["description"],
                    is_active=cat_data["is_active"],
                )
                created = await cat_repo.create(cat)
                category_map[cat_data["slug"]] = created
                print(f"Created category: {created.name} ({created.slug})")

        # 2. Seed Products
        print("\n--- Seeding Products ---")
        for prod_data in SAMPLE_PRODUCTS:
            existing = await prod_repo.get_by_slug(prod_data["slug"])
            if existing:
                print(f"Product '{prod_data['title']}' already exists.")
            else:
                category = category_map.get(prod_data["category_slug"])
                category_id = category.id if category else None

                product = Product(
                    sku=prod_data["sku"],
                    title=prod_data["title"],
                    slug=prod_data["slug"],
                    description=prod_data["description"],
                    category_id=category_id,
                    tags=prod_data["tags"],
                    keywords=prod_data["keywords"],
                    attributes=prod_data["attributes"],
                    status=prod_data["status"],
                    is_published=(prod_data["status"] == ProductStatus.PUBLISHED),
                )

                for img_data in prod_data["images"]:
                    image = ProductImage(
                        storage_path=img_data["image_url"],
                        alt_text=img_data["alt_text"],
                        is_primary=img_data["is_primary"],
                        display_order=img_data["display_order"],
                    )
                    product.images.append(image)

                created = await prod_repo.create(product)
                print(
                    f"Created product: {created.title} (SKU: {created.sku}, Status: {created.status.value})"
                )

        await session.commit()
        print("\nCatalogue seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
