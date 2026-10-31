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
  product_id?: string;
  storage_path: string;
  image_url?: string;
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
  keywords?: string[];
  attributes: JewelleryAttributes;
  status?: "draft" | "published" | "archived";
  is_published: boolean;
  is_active?: boolean;
  video_url?: string | null;
  price?: number;
  compare_at_price?: number | null;
  discount_percentage?: number | null;
  stock_quantity?: number;
  low_stock_threshold?: number;
  primary_image?: ProductImage | null;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export type { ProductPublicResponse } from "@/features/products/types/product.types";

export interface StockTransaction {
  id: string;
  product_id: string;
  product_title?: string;
  product_sku?: string;
  transaction_type: "stock_in" | "stock_out" | "adjustment";
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id?: string | null;
  reason: string;
  notes?: string | null;
  created_at: string;
}

export interface StockAdjustmentPayload {
  transaction_type: "stock_in" | "stock_out" | "adjustment";
  quantity: number;
  reason: string;
  notes?: string;
  reference_id?: string;
}

export interface ProductStockStatusSummary {
  product_id: string;
  title: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  status: "in_stock" | "low_stock" | "out_of_stock" | string;
  primary_image_url?: string | null;
}

export interface StockOverviewResponse {
  total_inventory_units: number;
  total_products_tracked: number;
  low_stock_count: number;
  out_of_stock_count: number;
  low_stock_items: ProductStockStatusSummary[];
}

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_title: string;
  product_sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_reference?: string | null;
  status: string;
  notes?: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreatePayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  payment_method?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

export interface DailyStat {
  date: string;
  orders_count: number;
  revenue: number;
}

export interface CatalogueOverviewMetrics {
  total_products: number;
  published_products: number;
  draft_products: number;
  archived_products: number;
  active_products: number;
  inactive_products: number;
  total_categories: number;
  active_categories: number;
}

export interface InventoryMetrics {
  total_stock_units: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface CommerceMetrics {
  date_range: string;
  start_date: string;
  end_date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface DashboardAnalyticsResponse {
  catalogue: CatalogueOverviewMetrics;
  inventory: InventoryMetrics;
  commerce: CommerceMetrics;
  daily_trends: DailyStat[];
  recent_orders: Order[];
  recent_stock_transactions: StockTransaction[];
  low_stock_alerts: ProductStockStatusSummary[];
}
