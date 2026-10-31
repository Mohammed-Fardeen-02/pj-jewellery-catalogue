export type StockTransactionType = "stock_in" | "stock_out" | "adjustment";

export interface StockAdjustmentPayload {
  transaction_type: StockTransactionType;
  quantity: number;
  reason: string;
  notes?: string;
  reference_id?: string;
}

export interface StockTransactionResponse {
  id: string;
  product_id: string;
  product_title?: string;
  product_sku?: string;
  transaction_type: StockTransactionType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id?: string | null;
  reason: string;
  notes?: string | null;
  created_at: string;
}

export interface LowStockItemAlert {
  product_id: string;
  title: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  shortage: number;
  status: "out_of_stock" | "low_stock" | string;
  category_name?: string | null;
  primary_image_url?: string | null;
}

export interface StockOverviewResponse {
  total_stock_units: number;
  total_inventory_units?: number;
  total_products: number;
  total_products_tracked?: number;
  in_stock_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  low_stock_items: LowStockItemAlert[];
}

export type StockFilterStatus = "all" | "in_stock" | "low_stock" | "out_of_stock";

export interface StockAdjustableItem {
  id: string;
  title: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold?: number;
  price?: number;
  category?: { id: string; name: string } | null;
  primary_image?: { image_url: string } | null;
  images?: Array<{ image_url: string }>;
}
