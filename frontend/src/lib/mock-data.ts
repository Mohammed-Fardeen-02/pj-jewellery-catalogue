/**
 * DESIGN PREVIEW MOCK DATA
 *
 * Notice:
 * This file contains strictly illustrative mock records for previewing the storefront
 * and dashboard UI layout before the Catalogue Domain Milestone is integrated with the API.
 * This is decoupled from API services and will be replaced by backend queries.
 */

import type { Category, Product } from "@/types";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-001",
    name: "Rings",
    slug: "rings",
    description: "Handcrafted solitaire, eternity, and statement rings.",
    is_active: true,
  },
  {
    id: "cat-002",
    name: "Necklaces & Pendants",
    slug: "necklaces",
    description: "Delicate chains, bespoke pendants, and collar statement pieces.",
    is_active: true,
  },
  {
    id: "cat-003",
    name: "Earrings",
    slug: "earrings",
    description: "Studs, drop earrings, and chandelier silhouettes.",
    is_active: true,
  },
  {
    id: "cat-004",
    name: "Bracelets",
    slug: "bracelets",
    description: "Tennis bracelets, rigid cuffs, and articulated bangles.",
    is_active: true,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    sku: "PJ-RNG-001",
    title: "Aura Solitaire Diamond Ring",
    slug: "aura-solitaire-diamond-ring",
    description:
      "An illustrative bespoke ring design featuring an oval-cut centre stone securely nestled in four delicate platinum prongs with a tapered warm-gold band.",
    category_id: "cat-001",
    category: MOCK_CATEGORIES[0],
    tags: ["solitaire", "rings", "bridal"],
    attributes: {
      metal: "18K Yellow Gold & Platinum",
      gemstone: "Diamond (Illustrative specimen)",
      carat_weight: 1.5,
      size: "US 6.5",
    },
    is_published: true,
    price: 4850,
    images: [
      {
        id: "img-001",
        product_id: "prod-001",
        storage_path: "/images/placeholder-ring.svg",
        alt_text: "Aura Solitaire Diamond Ring preview",
        is_primary: true,
        display_order: 0,
      },
    ],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-002",
    sku: "PJ-NCK-002",
    title: "Celestial Pendant Necklace",
    slug: "celestial-pendant-necklace",
    description:
      "A delicate chain supporting a faceted radiant pendant, designed for effortless daily layering or formal evening wear.",
    category_id: "cat-002",
    category: MOCK_CATEGORIES[1],
    tags: ["necklaces", "celestial", "gold"],
    attributes: {
      metal: "18K Champagne Gold",
      gemstone: "Mixed Cut Stones",
      size: "45cm adjustable",
    },
    is_published: true,
    price: 2950,
    images: [
      {
        id: "img-002",
        product_id: "prod-002",
        storage_path: "/images/placeholder-necklace.svg",
        alt_text: "Celestial Pendant Necklace preview",
        is_primary: true,
        display_order: 0,
      },
    ],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-003",
    sku: "PJ-ERR-003",
    title: "Cascade Drop Earrings",
    slug: "cascade-drop-earrings",
    description:
      "Architectural articulated earrings with fluid movement, catching ambient light with every subtle gesture.",
    category_id: "cat-003",
    category: MOCK_CATEGORIES[2],
    tags: ["earrings", "statement", "evening"],
    attributes: {
      metal: "18K White Gold",
      gemstone: "Natural Gemstones",
    },
    is_published: true,
    price: 3600,
    images: [
      {
        id: "img-003",
        product_id: "prod-003",
        storage_path: "/images/placeholder-earrings.svg",
        alt_text: "Cascade Drop Earrings preview",
        is_primary: true,
        display_order: 0,
      },
    ],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-004",
    sku: "PJ-BRC-004",
    title: "Eternity Tennis Bracelet",
    slug: "eternity-tennis-bracelet",
    description:
      "A classic four-prong continuous line bracelet with double safety clasp and flexible low-profile links.",
    category_id: "cat-004",
    category: MOCK_CATEGORIES[3],
    tags: ["bracelets", "tennis", "classic"],
    attributes: {
      metal: "Platinum 950",
      gemstone: "Round Brilliant Cut",
      size: "17.5cm",
    },
    is_published: true,
    price: 6200,
    images: [
      {
        id: "img-004",
        product_id: "prod-004",
        storage_path: "/images/placeholder-bracelet.svg",
        alt_text: "Eternity Tennis Bracelet preview",
        is_primary: true,
        display_order: 0,
      },
    ],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];
