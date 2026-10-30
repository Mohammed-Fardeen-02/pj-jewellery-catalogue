/**
 * Core entity models aligned with backend SQLAlchemy schemas.
 */

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "admin" | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at?: string;
}

export interface JewelleryAttributes {
  metal?: string; // e.g. "18K Yellow Gold", "Platinum"
  purity?: string; // e.g. "750", "950"
  gemstone?: string; // e.g. "Natural Diamond", "Emerald"
  carat_weight?: number; // e.g. 1.25
  size?: string; // e.g. "54", "18cm"
  gross_weight_grams?: number;
  [key: string]: unknown;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  category?: Category | null;
  tags: string[];
  attributes: JewelleryAttributes;
  is_published: boolean;
  images: ProductImage[];
  price?: number; // Optional storefront display price placeholder
  created_at: string;
  updated_at: string;
}
