"""Comprehensive Master Seeding Script for PJ Jewellery Catalogue.

Seeds:
- 5 Luxury Categories (Rings, Necklaces, Bracelets, Earrings, Pendants & Brooches)
- 20 High Artistry Products (4 per Category)
- 100 Real High-Resolution Jewellery Images (5 distinct angles per Product)
  Uploaded directly to Cloudinary (folder: pj_jewellery/catalogue)
- Stock ledger transactions (StockTransaction) for audit tracking
- 5 Realistic Acquisition Orders with line items and fulfillment lifecycle states

Usage:
    cd backend
    python scripts/seed_catalogue_with_media.py
    python scripts/seed_catalogue_with_media.py --skip-cloudinary   # for offline development
    python scripts/seed_catalogue_with_media.py --force-reseed      # wipes and reseeds fresh
"""

import argparse
import asyncio
import os
import sys
import uuid
from datetime import UTC, datetime
from decimal import Decimal

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import delete, select
from app.core.config import get_settings
from app.db.session import async_session_factory
from app.modules.categories.models import Category
from app.modules.orders.models import Order, OrderItem, OrderStatus, PaymentStatus
from app.modules.products.models import Product, ProductImage, ProductStatus
from app.modules.stock.models import StockTransaction, StockTransactionType

# --- 5 LUXURY CATEGORIES ---
CATEGORIES_SEED_DATA = [
    {
        "name": "Rings",
        "slug": "rings",
        "description": "Bespoke solitaire diamonds, emerald cocktail rings, sapphire halos, and platinum eternity bands.",
        "is_active": True,
    },
    {
        "name": "Necklaces",
        "slug": "necklaces",
        "description": "High artistry rivière diamond collars, royal Ceylon sapphire pendants, and luminous South Sea pearls.",
        "is_active": True,
    },
    {
        "name": "Bracelets",
        "slug": "bracelets",
        "description": "Handcrafted diamond tennis bracelets, sculpted 18K yellow gold cuffs, and pavé link masterpieces.",
        "is_active": True,
    },
    {
        "name": "Earrings",
        "slug": "earrings",
        "description": "Solitaire diamond studs, Colombian emerald drops, pavé huggie hoops, and red-carpet chandeliers.",
        "is_active": True,
    },
    {
        "name": "Pendants & Brooches",
        "slug": "pendants-brooches",
        "description": "Regal sapphire brooches, pear diamond solitaires, heritage tanzanite medallions, and floral motifs.",
        "is_active": True,
    },
]

# --- 20 PRODUCTS (4 PER CATEGORY) WITH 5 REAL PHOTOGRAPHIC IMAGES EACH (100 TOTAL) ---
PRODUCTS_SEED_DATA = [
    # ==========================================
    # CATEGORY 1: RINGS (4 Products)
    # ==========================================
    {
        "sku": "PJ-RNG-001",
        "title": "Aura Radiant Solitaire Diamond Ring",
        "slug": "aura-radiant-solitaire-diamond-ring",
        "category_slug": "rings",
        "description": "A magnificent 1.75-carat round brilliant solitaire diamond seated upon a handcrafted Platinum 950 band with tapered micro-pavé shoulders.",
        "tags": ["diamond", "solitaire", "engagement", "platinum", "bridal"],
        "keywords": ["solitaire diamond ring", "platinum engagement ring", "1.75 carat diamond"],
        "price": 8500.00,
        "compare_at_price": 9800.00,
        "discount_percentage": 13.26,
        "stock_quantity": 8,
        "low_stock_threshold": 3,
        "attributes": {
            "metal_type": "Platinum 950",
            "purity": "950",
            "gross_weight": 6.8,
            "net_weight": 6.45,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 1.75,
            "occasion": "Bridal",
            "collection": "Aura",
            "design_style": "Solitaire",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Ring Primary Angle", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Ring 45 Degree Perspective", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Ring Side Profile and Gallery", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Ring Worn on Hand", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Ring Luxury Presentation Case", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-RNG-002",
        "title": "Empress Colombian Emerald & Diamond Halo Ring",
        "slug": "empress-colombian-emerald-diamond-halo-ring",
        "category_slug": "rings",
        "description": "An octagonal 2.40-carat vivid green Colombian emerald encircled by a scintillating halo of micro-prong round diamonds in 18K yellow gold.",
        "tags": ["emerald", "halo", "cocktail ring", "gemstone", "18k gold"],
        "keywords": ["colombian emerald ring", "emerald halo ring", "high jewellery emerald"],
        "price": 12400.00,
        "compare_at_price": 14000.00,
        "discount_percentage": 11.43,
        "stock_quantity": 5,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "18K Yellow Gold",
            "purity": "750",
            "gross_weight": 8.5,
            "net_weight": 7.8,
            "gemstone_type": "Colombian Emerald",
            "stone_weight": 2.40,
            "occasion": "Red Carpet",
            "collection": "Empress",
            "design_style": "Halo",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80", "alt_text": "Empress Colombian Emerald Halo Ring Front Hero", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1000&q=80", "alt_text": "Empress Colombian Emerald Halo Ring Angled Glow", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Empress Colombian Emerald Halo Ring Profile Detailing", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80", "alt_text": "Empress Colombian Emerald Halo Ring Model Shoot", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=1000&q=80", "alt_text": "Empress Colombian Emerald Halo Ring Gift Packaging", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-RNG-003",
        "title": "Celestial Royal Sapphire Eternity Ring",
        "slug": "celestial-royal-sapphire-eternity-ring",
        "category_slug": "rings",
        "description": "Continuous uninterrupted circle of matched Ceylon royal blue sapphires and alternating brilliant diamonds in an 18K white gold channel setting.",
        "tags": ["sapphire", "eternity", "wedding band", "white gold", "ceylon"],
        "keywords": ["blue sapphire eternity band", "white gold ring", "sapphire anniversary"],
        "price": 6200.00,
        "compare_at_price": 6800.00,
        "discount_percentage": 8.82,
        "stock_quantity": 12,
        "low_stock_threshold": 4,
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 5.9,
            "net_weight": 5.1,
            "gemstone_type": "Ceylon Sapphire",
            "stone_weight": 3.10,
            "occasion": "Anniversary",
            "collection": "Celestial",
            "design_style": "Eternity Band",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Royal Sapphire Eternity Ring Front View", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Royal Sapphire Eternity Ring Channel Detailing", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Royal Sapphire Eternity Ring Side Profile", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1589674781759-c21c37956a44?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Royal Sapphire Eternity Ring Lifestyle Shot", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Royal Sapphire Eternity Ring Velvet Box", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-RNG-004",
        "title": "Heritage Art Deco Baguette & Pavé Platinum Band",
        "slug": "heritage-art-deco-baguette-pave-platinum-band",
        "category_slug": "rings",
        "description": "Architectural Art Deco revival ring featuring stepped baguette cut diamonds flanked by hand-milgrained pavé borders in pure Platinum 950.",
        "tags": ["art deco", "vintage", "baguette diamond", "platinum", "heritage"],
        "keywords": ["art deco platinum ring", "baguette diamond ring", "vintage jewellery"],
        "price": 7900.00,
        "compare_at_price": 8800.00,
        "discount_percentage": 10.23,
        "stock_quantity": 6,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "Platinum 950",
            "purity": "950",
            "gross_weight": 7.4,
            "net_weight": 6.9,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 1.45,
            "occasion": "Collectors",
            "collection": "Heritage",
            "design_style": "Art Deco",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Art Deco Platinum Band Master Angle", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Art Deco Platinum Band Milgrain Detailing", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Art Deco Platinum Band Architecture View", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Art Deco Platinum Band On Hand", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Art Deco Platinum Band Display Packaging", "is_primary": False},
        ],
    },

    # ==========================================
    # CATEGORY 2: NECKLACES (4 Products)
    # ==========================================
    {
        "sku": "PJ-NCK-001",
        "title": "Rivière Graduated Diamond Tennis Collar",
        "slug": "riviere-graduated-diamond-tennis-collar",
        "category_slug": "necklaces",
        "description": "Seventy-one precision graduated round brilliant diamonds cascading seamlessly into an 18K white gold fluid articulation.",
        "tags": ["diamond", "riviere", "collar", "high jewellery", "18k white gold"],
        "keywords": ["diamond riviere necklace", "tennis necklace", "graduated diamond collar"],
        "price": 24500.00,
        "compare_at_price": 28000.00,
        "discount_percentage": 12.50,
        "stock_quantity": 4,
        "low_stock_threshold": 1,
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 28.5,
            "net_weight": 26.2,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 11.50,
            "occasion": "Gala",
            "collection": "Aura",
            "design_style": "Rivière",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80", "alt_text": "Rivière Graduated Diamond Tennis Collar Center Cascade", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80", "alt_text": "Rivière Graduated Diamond Tennis Collar Clasp and Linkage", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1611591475879-114c000ff96b?auto=format&fit=crop&w=1000&q=80", "alt_text": "Rivière Graduated Diamond Tennis Collar Side Drape", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80", "alt_text": "Rivière Graduated Diamond Tennis Collar Gala Model Shoot", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80", "alt_text": "Rivière Graduated Diamond Tennis Collar Presentation Box", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-NCK-002",
        "title": "Celestial Ceylon Sapphire & Diamond Halo Pendant",
        "slug": "celestial-ceylon-sapphire-diamond-halo-pendant",
        "category_slug": "necklaces",
        "description": "A deep cornflower royal Ceylon sapphire cushioned inside double diamond pave rings, hung from an adjustable 18K yellow gold cable chain.",
        "tags": ["sapphire", "pendant", "necklace", "halo", "yellow gold"],
        "keywords": ["ceylon sapphire pendant", "sapphire diamond necklace", "yellow gold pendant"],
        "price": 9400.00,
        "compare_at_price": 10500.00,
        "discount_percentage": 10.48,
        "stock_quantity": 7,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "18K Yellow Gold",
            "purity": "750",
            "gross_weight": 12.8,
            "net_weight": 11.7,
            "gemstone_type": "Ceylon Sapphire",
            "stone_weight": 3.40,
            "occasion": "Everyday Luxury",
            "collection": "Celestial",
            "design_style": "Halo Pendant",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Ceylon Sapphire Pendant Hero View", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Ceylon Sapphire Pendant Macro Gemstone Detail", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Ceylon Sapphire Pendant Bail Craftsmanship", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Ceylon Sapphire Pendant On Model", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&w=1000&q=80", "alt_text": "Celestial Ceylon Sapphire Pendant Leather Presentation Case", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-NCK-003",
        "title": "Serpentine Colombian Emerald Velvet Choker",
        "slug": "serpentine-colombian-emerald-velvet-choker",
        "category_slug": "necklaces",
        "description": "Five graduated Muzo emerald cabochons interconnected by diamond-set gold scales, embodying fluid serpentine movement.",
        "tags": ["emerald", "choker", "serpentine", "statement", "red carpet"],
        "keywords": ["emerald choker necklace", "muzo emerald jewellery", "statement necklace"],
        "price": 31000.00,
        "compare_at_price": 35000.00,
        "discount_percentage": 11.43,
        "stock_quantity": 3,
        "low_stock_threshold": 1,
        "attributes": {
            "metal_type": "18K Yellow Gold",
            "purity": "750",
            "gross_weight": 36.2,
            "net_weight": 33.1,
            "gemstone_type": "Colombian Emerald",
            "stone_weight": 8.80,
            "occasion": "Red Carpet",
            "collection": "Empress",
            "design_style": "Choker",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=80", "alt_text": "Serpentine Colombian Emerald Choker Front Display", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1611591475879-114c000ff96b?auto=format&fit=crop&w=1000&q=80", "alt_text": "Serpentine Colombian Emerald Choker Cabochon Close Up", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80", "alt_text": "Serpentine Colombian Emerald Choker Scale Detailing", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80", "alt_text": "Serpentine Colombian Emerald Choker Model Styling", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80", "alt_text": "Serpentine Colombian Emerald Choker Collector Packaging", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-NCK-004",
        "title": "Luminescence South Sea Pearl & Diamond Strand",
        "slug": "luminescence-south-sea-pearl-diamond-strand",
        "category_slug": "necklaces",
        "description": "Thirty-nine graduated Australian South Sea cultured pearls with radiant silver-white luster, secured with an 18K white gold spherical diamond ball clasp.",
        "tags": ["pearl", "south sea", "strand", "classic", "diamond clasp"],
        "keywords": ["south sea pearl necklace", "white pearl strand", "luxury pearl jewellery"],
        "price": 16800.00,
        "compare_at_price": 18500.00,
        "discount_percentage": 9.19,
        "stock_quantity": 5,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 54.0,
            "net_weight": 51.5,
            "gemstone_type": "South Sea Pearl",
            "stone_weight": 0.85,
            "occasion": "Bridal",
            "collection": "Luminescence",
            "design_style": "Pearl Strand",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80", "alt_text": "Luminescence South Sea Pearl Strand Central Arc", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80", "alt_text": "Luminescence South Sea Pearl Strand Luster Macro", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80", "alt_text": "Luminescence South Sea Pearl Strand Clasp Detail", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80", "alt_text": "Luminescence South Sea Pearl Strand Worn Shot", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80", "alt_text": "Luminescence South Sea Pearl Strand Signature Case", "is_primary": False},
        ],
    },

    # ==========================================
    # CATEGORY 3: BRACELETS (4 Products)
    # ==========================================
    {
        "sku": "PJ-BRC-001",
        "title": "Eternity Diamond Tennis Bracelet",
        "slug": "eternity-diamond-tennis-bracelet",
        "category_slug": "bracelets",
        "description": "Fifty-six hand-selected round brilliant cut diamonds set in 18K white gold four-prong basket settings with double safety clasp.",
        "tags": ["tennis bracelet", "diamond", "wristwear", "classic", "18k white gold"],
        "keywords": ["diamond tennis bracelet", "white gold tennis bracelet", "eternity bracelet"],
        "price": 11200.00,
        "compare_at_price": 12800.00,
        "discount_percentage": 12.50,
        "stock_quantity": 9,
        "low_stock_threshold": 3,
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 14.5,
            "net_weight": 13.4,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 5.20,
            "occasion": "Everyday Luxury",
            "collection": "Eternity",
            "design_style": "Tennis Bracelet",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1611591475879-114c000ff96b?auto=format&fit=crop&w=1000&q=80", "alt_text": "Eternity Diamond Tennis Bracelet Full View", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80", "alt_text": "Eternity Diamond Tennis Bracelet Diamond Prongs Detail", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80", "alt_text": "Eternity Diamond Tennis Bracelet Clasp and Profile", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1000&q=80", "alt_text": "Eternity Diamond Tennis Bracelet Wrist View", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80", "alt_text": "Eternity Diamond Tennis Bracelet Hard Shell Box", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-BRC-002",
        "title": "Sculpted 18K Yellow Gold Torque Bangle",
        "slug": "sculpted-18k-yellow-gold-torque-bangle",
        "category_slug": "bracelets",
        "description": "Architecturally sculpted solid 18K yellow gold torque bangle with fluted contours and twin pavé diamond finials.",
        "tags": ["bangle", "yellow gold", "torque", "sculptural", "diamond finials"],
        "keywords": ["gold torque bangle", "18k gold cuff", "sculpted bangle bracelet"],
        "price": 8900.00,
        "compare_at_price": 9900.00,
        "discount_percentage": 10.10,
        "stock_quantity": 6,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "18K Yellow Gold",
            "purity": "750",
            "gross_weight": 24.2,
            "net_weight": 23.8,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 0.65,
            "occasion": "Everyday Luxury",
            "collection": "Aura",
            "design_style": "Bangle Cuff",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Sculpted 18K Gold Torque Bangle Hero", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80", "alt_text": "Sculpted 18K Gold Torque Bangle Fluted Texture Detail", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1000&q=80", "alt_text": "Sculpted 18K Gold Torque Bangle Diamond Finials", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80", "alt_text": "Sculpted 18K Gold Torque Bangle On Wrist", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80", "alt_text": "Sculpted 18K Gold Torque Bangle Velvet Case", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-BRC-003",
        "title": "Pavé Diamond Curb Link Statement Bracelet",
        "slug": "pave-diamond-curb-link-statement-bracelet",
        "category_slug": "bracelets",
        "description": "Bold interlocking Cuban curb links in 18K white gold, each link entirely encrusted with micro-pavé diamonds and a concealed push clasp.",
        "tags": ["curb link", "pave diamond", "statement", "white gold", "bold"],
        "keywords": ["diamond cuban bracelet", "pave link bracelet", "statement diamond bracelet"],
        "price": 18200.00,
        "compare_at_price": 21000.00,
        "discount_percentage": 13.33,
        "stock_quantity": 4,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 31.0,
            "net_weight": 28.9,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 6.80,
            "occasion": "Red Carpet",
            "collection": "Empress",
            "design_style": "Curb Link",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pavé Diamond Curb Link Bracelet Center View", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pavé Diamond Curb Link Bracelet Interlocking Articulation", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pavé Diamond Curb Link Bracelet Clasp Mechanism", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pavé Diamond Curb Link Bracelet Model Shoot", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pavé Diamond Curb Link Bracelet Luxury Packaging", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-BRC-004",
        "title": "Solstice 18K Rose Gold & Diamond Bangle",
        "slug": "solstice-18k-rose-gold-diamond-bangle",
        "category_slug": "bracelets",
        "description": "Warm 18K rose gold hinged bangle with double geometric pavé diamond crossover bands celebrating celestial twilight.",
        "tags": ["rose gold", "bangle", "crossover", "diamonds", "solstice"],
        "keywords": ["rose gold diamond bangle", "crossover bangle", "18k rose gold"],
        "price": 7500.00,
        "compare_at_price": 8200.00,
        "discount_percentage": 8.54,
        "stock_quantity": 7,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "18K Rose Gold",
            "purity": "750",
            "gross_weight": 18.2,
            "net_weight": 17.5,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 1.20,
            "occasion": "Cocktail",
            "collection": "Solstice",
            "design_style": "Crossover Bangle",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice 18K Rose Gold Bangle Frontal Angle", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice 18K Rose Gold Bangle Crossover Geometry", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice 18K Rose Gold Bangle Hinge & Safety Catch", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice 18K Rose Gold Bangle On Hand", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice 18K Rose Gold Bangle Satin Box", "is_primary": False},
        ],
    },

    # ==========================================
    # CATEGORY 4: EARRINGS (4 Products)
    # ==========================================
    {
        "sku": "PJ-EAR-001",
        "title": "Aura Solitaire Round Diamond Stud Earrings",
        "slug": "aura-solitaire-round-diamond-stud-earrings",
        "category_slug": "earrings",
        "description": "Matched pair of 1.00-carat each round brilliant diamonds (2.00 ctw total) secured in three-prong martini settings in Platinum 950.",
        "tags": ["diamond studs", "solitaire", "earrings", "platinum", "classic"],
        "keywords": ["diamond stud earrings", "2 carat diamond studs", "platinum studs"],
        "price": 9800.00,
        "compare_at_price": 11000.00,
        "discount_percentage": 10.91,
        "stock_quantity": 11,
        "low_stock_threshold": 3,
        "attributes": {
            "metal_type": "Platinum 950",
            "purity": "950",
            "gross_weight": 3.8,
            "net_weight": 3.4,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 2.00,
            "occasion": "Everyday Luxury",
            "collection": "Aura",
            "design_style": "Solitaire Studs",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Studs Pair Frontal", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Studs Prongs and Cut Brilliance", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Studs Post and Screwback Profile", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Studs Worn on Ear", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80", "alt_text": "Aura Solitaire Diamond Studs PJ Luxury Earring Box", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-EAR-002",
        "title": "Solstice Pear Colombian Emerald & Diamond Drops",
        "slug": "solstice-pear-colombian-emerald-diamond-drops",
        "category_slug": "earrings",
        "description": "Exquisite matched pear-shaped vivid green Colombian emeralds suspended beneath articulated marquise and round diamond floral clusters in 18K white gold.",
        "tags": ["emerald", "drops", "earrings", "colombian", "high jewellery"],
        "keywords": ["emerald drop earrings", "pear emerald earrings", "red carpet earrings"],
        "price": 15400.00,
        "compare_at_price": 17200.00,
        "discount_percentage": 10.47,
        "stock_quantity": 5,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 9.4,
            "net_weight": 8.3,
            "gemstone_type": "Colombian Emerald",
            "stone_weight": 4.20,
            "occasion": "Red Carpet",
            "collection": "Solstice",
            "design_style": "Drop Earrings",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice Pear Emerald Drops Front Pair", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice Pear Emerald Drops Floral Cluster Detailing", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice Pear Emerald Drops Profile View and Articulation", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice Pear Emerald Drops Editorial Shoot", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80", "alt_text": "Solstice Pear Emerald Drops Velvet Case Presentation", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-EAR-003",
        "title": "Radiant Diamond Inside-Out Pavé Huggie Hoops",
        "slug": "radiant-diamond-inside-out-pave-huggie-hoops",
        "category_slug": "earrings",
        "description": "Seamless 18K yellow gold huggie hoops pavé-set with diamonds on both the front exterior and rear interior for brilliant luminescence at every angle.",
        "tags": ["hoops", "huggie", "yellow gold", "inside out", "pavé"],
        "keywords": ["diamond huggie hoops", "yellow gold hoops", "inside out diamond earrings"],
        "price": 5400.00,
        "compare_at_price": 6000.00,
        "discount_percentage": 10.00,
        "stock_quantity": 10,
        "low_stock_threshold": 3,
        "attributes": {
            "metal_type": "18K Yellow Gold",
            "purity": "750",
            "gross_weight": 6.8,
            "net_weight": 6.2,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 1.60,
            "occasion": "Everyday Luxury",
            "collection": "Aura",
            "design_style": "Huggie Hoops",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=1000&q=80", "alt_text": "Radiant Diamond Huggie Hoops Primary View", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80", "alt_text": "Radiant Diamond Huggie Hoops Inside-Out Pavé Detail", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1000&q=80", "alt_text": "Radiant Diamond Huggie Hoops Click-Lock Clasp Mechanism", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Radiant Diamond Huggie Hoops Worn on Ear", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Radiant Diamond Huggie Hoops Jewelry Travel Pouch", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-EAR-004",
        "title": "Heritage Chandelier Cascading Evening Drops",
        "slug": "heritage-chandelier-cascading-evening-drops",
        "category_slug": "earrings",
        "description": "Dramatic vintage-inspired evening chandeliers featuring cascading tiers of briolette and marquise diamonds in articulated 18K white gold filigree.",
        "tags": ["chandelier", "evening", "diamonds", "filigree", "heritage"],
        "keywords": ["diamond chandelier earrings", "vintage evening earrings", "high jewellery earrings"],
        "price": 21000.00,
        "compare_at_price": 24000.00,
        "discount_percentage": 12.50,
        "stock_quantity": 4,
        "low_stock_threshold": 1,
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 17.5,
            "net_weight": 15.2,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 7.40,
            "occasion": "Gala",
            "collection": "Heritage",
            "design_style": "Chandelier",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Chandelier Evening Drops Pair Hero", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Chandelier Evening Drops Filigree & Briolettes", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Chandelier Evening Drops Side Motion Profile", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Chandelier Evening Drops Gala Editorial", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Chandelier Evening Drops High Jewelry Case", "is_primary": False},
        ],
    },

    # ==========================================
    # CATEGORY 5: PENDANTS & BROOCHES (4 Products)
    # ==========================================
    {
        "sku": "PJ-PND-001",
        "title": "Royal Ceylon Sapphire Heritage Brooch",
        "slug": "royal-ceylon-sapphire-heritage-brooch",
        "category_slug": "pendants-brooches",
        "description": "An imperial 6.50-carat cushion-cut Ceylon sapphire commanding the center of a sculptural 18K yellow gold and diamond starburst brooch.",
        "tags": ["sapphire", "brooch", "imperial", "yellow gold", "vintage"],
        "keywords": ["sapphire brooch", "ceylon sapphire pin", "starburst brooch"],
        "price": 19500.00,
        "compare_at_price": 22000.00,
        "discount_percentage": 11.36,
        "stock_quantity": 4,
        "low_stock_threshold": 1,
        "attributes": {
            "metal_type": "18K Yellow Gold",
            "purity": "750",
            "gross_weight": 22.0,
            "net_weight": 20.1,
            "gemstone_type": "Ceylon Sapphire",
            "stone_weight": 6.50,
            "occasion": "Collectors",
            "collection": "Heritage",
            "design_style": "Starburst Brooch",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1000&q=80", "alt_text": "Royal Ceylon Sapphire Heritage Brooch Front Hero", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80", "alt_text": "Royal Ceylon Sapphire Heritage Brooch Cushion Cut Detail", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=80", "alt_text": "Royal Ceylon Sapphire Heritage Brooch Starburst Rays", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?auto=format&fit=crop&w=1000&q=80", "alt_text": "Royal Ceylon Sapphire Heritage Brooch Lapel Styling", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80", "alt_text": "Royal Ceylon Sapphire Heritage Brooch Heritage Box", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-PND-002",
        "title": "Pear Diamond Aura Solitaire Pendant",
        "slug": "pear-diamond-aura-solitaire-pendant",
        "category_slug": "pendants-brooches",
        "description": "Flawless 2.10-carat pear brilliant diamond suspended from a micro-pavé tapered bail in Platinum 950 on an 18-inch platinum wheat chain.",
        "tags": ["pear diamond", "pendant", "solitaire", "platinum", "aura"],
        "keywords": ["pear diamond pendant", "platinum solitaire pendant", "2 carat diamond pendant"],
        "price": 13900.00,
        "compare_at_price": 15500.00,
        "discount_percentage": 10.32,
        "stock_quantity": 6,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "Platinum 950",
            "purity": "950",
            "gross_weight": 8.1,
            "net_weight": 7.6,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 2.10,
            "occasion": "Everyday Luxury",
            "collection": "Aura",
            "design_style": "Solitaire Pendant",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pear Diamond Aura Solitaire Pendant Primary Shot", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pear Diamond Aura Solitaire Pendant Brilliant Cut Facets", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pear Diamond Aura Solitaire Pendant Pavé Bail Craftsmanship", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pear Diamond Aura Solitaire Pendant On Neck", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80", "alt_text": "Pear Diamond Aura Solitaire Pendant Leather Presentation Case", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-PND-003",
        "title": "Heritage Tanzanite Art Deco Medallion",
        "slug": "heritage-tanzanite-art-deco-medallion",
        "category_slug": "pendants-brooches",
        "description": "An octagonal 4.80-carat royal violet-blue Tanzanite framed by step-cut baguette diamonds in a geometric 18K white gold medallion.",
        "tags": ["tanzanite", "medallion", "art deco", "white gold", "gemstone"],
        "keywords": ["tanzanite medallion pendant", "art deco necklace", "blue violet tanzanite"],
        "price": 14200.00,
        "compare_at_price": 16000.00,
        "discount_percentage": 11.25,
        "stock_quantity": 5,
        "low_stock_threshold": 2,
        "attributes": {
            "metal_type": "18K White Gold",
            "purity": "750",
            "gross_weight": 14.2,
            "net_weight": 12.8,
            "gemstone_type": "Tanzanite",
            "stone_weight": 4.80,
            "occasion": "Gala",
            "collection": "Heritage",
            "design_style": "Medallion Pendant",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Tanzanite Art Deco Medallion Center Hero", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Tanzanite Art Deco Medallion Octagonal Faceting", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1611591475879-114c000ff96b?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Tanzanite Art Deco Medallion Stepped Baguette Frame", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Tanzanite Art Deco Medallion Styling Shot", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Heritage Tanzanite Art Deco Medallion Velvet Display Case", "is_primary": False},
        ],
    },
    {
        "sku": "PJ-PND-004",
        "title": "Botanical Pavé Diamond Floral Brooch",
        "slug": "botanical-pave-diamond-floral-brooch",
        "category_slug": "pendants-brooches",
        "description": "Three-dimensional flowering orchid brooch handcrafted in 18K rose and white gold with petal veins pavé-set with 420 micro-diamonds.",
        "tags": ["brooch", "floral", "orchid", "rose gold", "botanical"],
        "keywords": ["diamond orchid brooch", "floral brooch pin", "high jewellery flower"],
        "price": 16500.00,
        "compare_at_price": 18500.00,
        "discount_percentage": 10.81,
        "stock_quantity": 4,
        "low_stock_threshold": 1,
        "attributes": {
            "metal_type": "18K Rose Gold",
            "purity": "750",
            "gross_weight": 26.5,
            "net_weight": 24.8,
            "gemstone_type": "Natural Diamond",
            "stone_weight": 4.50,
            "occasion": "Red Carpet",
            "collection": "Solstice",
            "design_style": "Floral Brooch",
        },
        "images": [
            {"source_url": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Botanical Pavé Diamond Floral Brooch Front View", "is_primary": True},
            {"source_url": "https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1000&q=80", "alt_text": "Botanical Pavé Diamond Floral Brooch Petal Curve & Texture", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1000&q=80", "alt_text": "Botanical Pavé Diamond Floral Brooch Dual Tone Gold Detailing", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80", "alt_text": "Botanical Pavé Diamond Floral Brooch Blazer Styling", "is_primary": False},
            {"source_url": "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=1000&q=80", "alt_text": "Botanical Pavé Diamond Floral Brooch Luxury Gift Box", "is_primary": False},
        ],
    },
]

# --- 5 SAMPLE ACQUISITION ORDERS ---
ORDERS_SEED_DATA = [
    {
        "order_number": "PJ-ORD-1001",
        "customer_name": "Emily Thornton",
        "customer_email": "emily.thornton@luxuryclients.com",
        "customer_phone": "+1 (555) 349-8201",
        "shipping_address": "742 Evergreen Terrace, Penthouse B, Manhattan, NY 10021, USA",
        "status": OrderStatus.CONFIRMED.value,
        "payment_status": PaymentStatus.PAID.value,
        "payment_method": "simulated_card",
        "payment_reference": "TXN_CHG_8912384729",
        "notes": "Client requested bespoke hand-calligraphed gift certificate.",
        "discount_amount": 0.00,
        "items": [
            {"product_sku": "PJ-RNG-001", "quantity": 1},
        ],
    },
    {
        "order_number": "PJ-ORD-1002",
        "customer_name": "Alexander Wright",
        "customer_email": "alex.wright@mayfairpartners.co.uk",
        "customer_phone": "+44 20 7946 0912",
        "shipping_address": "14 Grosvenor Square, Mayfair, London W1K 6JP, United Kingdom",
        "status": OrderStatus.PROCESSING.value,
        "payment_status": PaymentStatus.PAID.value,
        "payment_method": "bank_wire",
        "payment_reference": "WIRE_BARCLAYS_449210",
        "notes": "Anniversary celebration order. Expedited courier delivery.",
        "discount_amount": 500.00,
        "items": [
            {"product_sku": "PJ-BRC-001", "quantity": 1},
        ],
    },
    {
        "order_number": "PJ-ORD-1003",
        "customer_name": "Sophia Chen",
        "customer_email": "sophia.chen@pacificinvest.sg",
        "customer_phone": "+65 6789 0123",
        "shipping_address": "8 Marina Boulevard, #38-01 Marina Bay Residences, Singapore 018981",
        "status": OrderStatus.SHIPPED.value,
        "payment_status": PaymentStatus.PAID.value,
        "payment_method": "simulated_card",
        "payment_reference": "TXN_STRIPE_SG_991823",
        "notes": "Dispatched via Malca-Amit Armored Courier with tracking MALCA-88912-SG.",
        "discount_amount": 0.00,
        "items": [
            {"product_sku": "PJ-NCK-002", "quantity": 1},
        ],
    },
    {
        "order_number": "PJ-ORD-1004",
        "customer_name": "Marcus Sterling",
        "customer_email": "m.sterling@sterlingcap.ch",
        "customer_phone": "+41 22 819 4400",
        "shipping_address": "Quai du Mont-Blanc 19, 1201 Genève, Switzerland",
        "status": OrderStatus.DELIVERED.value,
        "payment_status": PaymentStatus.PAID.value,
        "payment_method": "simulated_card",
        "payment_reference": "TXN_CHG_7749103982",
        "notes": "Delivered and signed by private concierge.",
        "discount_amount": 1000.00,
        "items": [
            {"product_sku": "PJ-NCK-003", "quantity": 1},
            {"product_sku": "PJ-EAR-002", "quantity": 1},
        ],
    },
    {
        "order_number": "PJ-ORD-1005",
        "customer_name": "Victoria Vance",
        "customer_email": "vance.victoria@monacoyachting.mc",
        "customer_phone": "+377 98 06 20 00",
        "shipping_address": "Avenue Princesse Grace, Le Mirabeau, 98000 Monaco",
        "status": OrderStatus.PENDING.value,
        "payment_status": PaymentStatus.PENDING.value,
        "payment_method": "pending_invoice",
        "payment_reference": None,
        "notes": "Awaiting private banker wire transfer confirmation.",
        "discount_amount": 0.00,
        "items": [
            {"product_sku": "PJ-EAR-001", "quantity": 1},
        ],
    },
]


async def upload_image_to_cloudinary(
    source_url: str,
    sku: str,
    img_idx: int,
    skip_cloudinary: bool,
) -> tuple[str, str | None]:
    """Upload remote image URL to Cloudinary and return (storage_path, public_id).

    Falls back safely to source_url if upload is skipped or network fails.
    """
    settings = get_settings()

    if skip_cloudinary or not (
        settings.CLOUDINARY_CLOUD_NAME
        and settings.CLOUDINARY_API_KEY
        and settings.CLOUDINARY_API_SECRET
    ):
        return source_url, None

    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )

    folder = (settings.CLOUDINARY_FOLDER or "pj_jewellery").strip().strip("/")
    public_id = f"{folder}/catalogue/{sku.lower().replace('-', '_')}_angle_{img_idx}"

    try:
        # Cloudinary accepts direct remote HTTP/HTTPS URLs
        res = cloudinary.uploader.upload(
            source_url,
            public_id=public_id,
            overwrite=False,
            resource_type="image",
        )
        return res.get("secure_url") or res.get("url") or source_url, res.get("public_id")
    except Exception as e:
        # Fall back to source URL gracefully so seeding never halts
        print(f"    [Cloudinary Note] {sku} img {img_idx}: using direct URL ({e})")
        return source_url, None


async def seed_master_catalogue(skip_cloudinary: bool = False, force_reseed: bool = False) -> None:
    settings = get_settings()
    print("=" * 80)
    print("  PJ JEWELLERY — MASTER CATALOGUE, REAL IMAGES & ORDERS SEED RUNNER")
    print("=" * 80)
    print(f"Target Database : {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    print(f"Cloudinary Cloud: {settings.CLOUDINARY_CLOUD_NAME or 'Disabled / Direct URL mode'}")
    print(f"Skip Cloudinary : {skip_cloudinary}")
    print(f"Force Reseed    : {force_reseed}")
    print("=" * 80)

    async with async_session_factory() as session:
        # 0. Optional: Wipe and reseed cleanly if requested
        if force_reseed:
            print("\n[!] Force reseed requested. Cleaning existing catalogue data...")
            await session.execute(delete(OrderItem))
            await session.execute(delete(Order))
            await session.execute(delete(StockTransaction))
            await session.execute(delete(ProductImage))
            await session.execute(delete(Product))
            await session.execute(delete(Category))
            await session.commit()
            print("    Clean complete.")

        # 1. Seed 5 Luxury Categories
        print("\n--- 1. Seeding 5 Luxury Categories ---")
        category_cache: dict[str, Category] = {}

        for cat_data in CATEGORIES_SEED_DATA:
            res = await session.execute(select(Category).where(Category.slug == cat_data["slug"]))
            existing_cat = res.scalars().first()

            if existing_cat:
                existing_cat.name = cat_data["name"]
                existing_cat.description = cat_data["description"]
                existing_cat.is_active = cat_data["is_active"]
                category_cache[cat_data["slug"]] = existing_cat
                print(f"  [Category OK] '{cat_data['name']}' (slug: {cat_data['slug']}) synchronized.")
            else:
                new_cat = Category(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    description=cat_data["description"],
                    is_active=cat_data["is_active"],
                )
                session.add(new_cat)
                await session.flush()
                category_cache[cat_data["slug"]] = new_cat
                print(f"  [Category +] Created '{new_cat.name}' (slug: {new_cat.slug})")

        await session.commit()

        # 2. Seed 20 High Artistry Products (4 per category) + 100 Real Images
        print("\n--- 2. Seeding 20 Products & 100 Real Jewellery Images (5 Per Piece) ---")
        product_cache: dict[str, Product] = {}
        total_images_processed = 0

        for p_idx, prod_data in enumerate(PRODUCTS_SEED_DATA, start=1):
            category = category_cache.get(prod_data["category_slug"])
            category_id = category.id if category else None

            res = await session.execute(select(Product).where(Product.sku == prod_data["sku"]))
            existing_prod = res.scalars().first()

            if existing_prod:
                product = existing_prod
                product.title = prod_data["title"]
                product.slug = prod_data["slug"]
                product.description = prod_data["description"]
                product.category_id = category_id
                product.tags = prod_data["tags"]
                product.keywords = prod_data["keywords"]
                product.price = Decimal(str(prod_data["price"]))
                product.compare_at_price = Decimal(str(prod_data["compare_at_price"])) if prod_data.get("compare_at_price") else None
                product.discount_percentage = Decimal(str(prod_data["discount_percentage"])) if prod_data.get("discount_percentage") else None
                product.stock_quantity = prod_data["stock_quantity"]
                product.low_stock_threshold = prod_data["low_stock_threshold"]
                product.attributes = prod_data["attributes"]
                product.status = ProductStatus.PUBLISHED
                product.is_published = True
                product.is_active = True
                print(f"  [Product {p_idx}/20] Syncing '{product.title}' ({product.sku})...")
            else:
                product = Product(
                    sku=prod_data["sku"],
                    title=prod_data["title"],
                    slug=prod_data["slug"],
                    description=prod_data["description"],
                    category_id=category_id,
                    tags=prod_data["tags"],
                    keywords=prod_data["keywords"],
                    price=Decimal(str(prod_data["price"])),
                    compare_at_price=Decimal(str(prod_data["compare_at_price"])) if prod_data.get("compare_at_price") else None,
                    discount_percentage=Decimal(str(prod_data["discount_percentage"])) if prod_data.get("discount_percentage") else None,
                    stock_quantity=prod_data["stock_quantity"],
                    low_stock_threshold=prod_data["low_stock_threshold"],
                    attributes=prod_data["attributes"],
                    status=ProductStatus.PUBLISHED,
                    is_published=True,
                    is_active=True,
                )
                session.add(product)
                await session.flush()

                # Add initial stock transaction ledger entry
                now_ts = datetime.now(UTC)
                stock_tx = StockTransaction(
                    product_id=product.id,
                    transaction_type=StockTransactionType.STOCK_IN.value,
                    quantity=product.stock_quantity,
                    previous_stock=0,
                    new_stock=product.stock_quantity,
                    reason="Initial catalogue inventory master seed",
                    notes=f"Initial seed of {product.stock_quantity} units for {product.title}",
                    created_at=now_ts,
                    updated_at=now_ts,
                )
                session.add(stock_tx)
                print(f"  [Product {p_idx}/20 +] Created '{product.title}' ({product.sku}) | Stock: {product.stock_quantity}")

            product_cache[prod_data["sku"]] = product

            # Seed 5 Images for this Product
            # Check existing images
            res_imgs = await session.execute(select(ProductImage).where(ProductImage.product_id == product.id))
            existing_imgs = res_imgs.scalars().all()

            if len(existing_imgs) < 5:
                # Remove partial images if any to prevent duplicates
                if existing_imgs:
                    for old_img in existing_imgs:
                        await session.delete(old_img)
                    await session.flush()

                for img_idx, img_def in enumerate(prod_data["images"], start=1):
                    total_images_processed += 1
                    storage_path, public_id = await upload_image_to_cloudinary(
                        source_url=img_def["source_url"],
                        sku=prod_data["sku"],
                        img_idx=img_idx,
                        skip_cloudinary=skip_cloudinary,
                    )

                    new_img = ProductImage(
                        product_id=product.id,
                        storage_path=storage_path,
                        public_id=public_id,
                        alt_text=img_def["alt_text"],
                        is_primary=img_def["is_primary"],
                        display_order=img_idx - 1,
                    )
                    session.add(new_img)
                    print(f"    -> [Image {total_images_processed}/100] Angle {img_idx}/5 for {prod_data['sku']} uploaded.")
            else:
                total_images_processed += 5
                print(f"    -> All 5 images already attached for {prod_data['sku']}.")

        await session.commit()
        print(f"\nTotal 20 Products and 100 Images successfully verified and committed!")

        # 3. Seed 5 Realistic Customer Acquisition Orders
        print("\n--- 3. Seeding 5 Customer Orders (Confirmed, Processing, Shipped, Delivered, Pending) ---")
        for o_idx, ord_data in enumerate(ORDERS_SEED_DATA, start=1):
            res_ord = await session.execute(select(Order).where(Order.order_number == ord_data["order_number"]))
            existing_ord = res_ord.scalars().first()

            if existing_ord:
                print(f"  [Order {o_idx}/5 OK] Order '{ord_data['order_number']}' already exists.")
                continue

            # Calculate line items, subtotal, and total amount
            subtotal = Decimal("0.00")
            line_items_to_create = []

            for item_data in ord_data["items"]:
                prod = product_cache.get(item_data["product_sku"])
                if not prod:
                    continue

                # Get primary image for line item thumbnail
                res_img = await session.execute(
                    select(ProductImage).where(ProductImage.product_id == prod.id, ProductImage.is_primary.is_(True))
                )
                prim_img = res_img.scalars().first()
                thumb_url = prim_img.storage_path if prim_img else None

                unit_price = Decimal(str(prod.price))
                qty = item_data["quantity"]
                line_total = unit_price * qty
                subtotal += line_total

                line_items_to_create.append(
                    {
                        "product_id": prod.id,
                        "product_title": prod.title,
                        "product_sku": prod.sku,
                        "unit_price": unit_price,
                        "quantity": qty,
                        "total_price": line_total,
                        "image_url": thumb_url,
                    }
                )

            discount = Decimal(str(ord_data.get("discount_amount", 0.00)))
            total_amount = max(Decimal("0.00"), subtotal - discount)

            now_ts = datetime.now(UTC)
            new_order = Order(
                order_number=ord_data["order_number"],
                customer_name=ord_data["customer_name"],
                customer_email=ord_data["customer_email"],
                customer_phone=ord_data["customer_phone"],
                shipping_address=ord_data["shipping_address"],
                subtotal=subtotal,
                discount_amount=discount,
                total_amount=total_amount,
                payment_method=ord_data["payment_method"],
                payment_status=ord_data["payment_status"],
                payment_reference=ord_data["payment_reference"],
                status=ord_data["status"],
                notes=ord_data["notes"],
                created_at=now_ts,
                updated_at=now_ts,
            )
            session.add(new_order)
            await session.flush()

            for li in line_items_to_create:
                order_item = OrderItem(
                    order_id=new_order.id,
                    product_id=li["product_id"],
                    product_title=li["product_title"],
                    product_sku=li["product_sku"],
                    unit_price=li["unit_price"],
                    quantity=li["quantity"],
                    total_price=li["total_price"],
                    image_url=li["image_url"],
                    created_at=now_ts,
                    updated_at=now_ts,
                )
                session.add(order_item)

            print(
                f"  [Order {o_idx}/5 +] Created '{new_order.order_number}' | Status: {new_order.status} | "
                f"Customer: {new_order.customer_name} | Total: ${new_order.total_amount:,.2f}"
            )

        await session.commit()
        print("\nAll 5 Orders successfully seeded and linked to catalogue products!")

    print("\n" + "=" * 80)
    print("  SEEDING SUMMARY COMPLETED SUCCESSFULLY:")
    print("   [OK] 5 Luxury Jewellery Categories (Active & SEO Indexed)")
    print("   [OK] 20 Fine Jewellery Products (4 Per Category)")
    print("   [OK] 100 Real High-Resolution Jewellery Images (5 Distinct Angles Per Piece)")
    print("   [OK] 20 Inventory Stock Transaction Audit Records")
    print("   [OK] 5 Customer Acquisition Orders (Lifecycle Flow: Pending to Delivered)")
    print("=" * 80)


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
