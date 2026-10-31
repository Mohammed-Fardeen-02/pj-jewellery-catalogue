export type ProductStatus = "draft" | "published" | "archived";

export interface ProductImageResponse {
  id: string;
  image_url: string;
  public_id?: string | null;
  alt_text?: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface ProductCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProductResponse {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description?: string | null;
  category_id?: string | null;
  category?: ProductCategorySummary | null;
  tags: string[];
  keywords: string[];
  attributes: Record<string, unknown>;
  status: ProductStatus;
  is_published: boolean;
  is_active: boolean;
  price: number;
  compare_at_price?: number | null;
  discount_percentage?: number | null;
  stock_quantity: number;
  low_stock_threshold?: number;
  video_url?: string | null;
  primary_image?: ProductImageResponse | null;
  images: ProductImageResponse[];
  created_at: string;
  updated_at: string;
}

export interface ProductPublicResponse {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description?: string | null;
  category?: ProductCategorySummary | null;
  tags: string[];
  attributes: Record<string, unknown>;
  price: number;
  compare_at_price?: number | null;
  discount_percentage?: number | null;
  stock_quantity: number;
  video_url?: string | null;
  primary_image?: ProductImageResponse | null;
  images: ProductImageResponse[];
  created_at: string;
}

export interface ProductImageCreate {
  image_url: string;
  public_id?: string;
  alt_text?: string;
  display_order?: number;
  is_primary?: boolean;
}

export interface ProductCreatePayload {
  title: string;
  sku?: string;
  slug?: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  keywords?: string[];
  attributes?: Record<string, unknown>;
  status?: ProductStatus;
  is_active?: boolean;
  price?: number;
  compare_at_price?: number;
  discount_percentage?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  video_url?: string;
  images?: ProductImageCreate[];
}

export interface ProductUpdatePayload {
  title?: string;
  sku?: string;
  slug?: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  keywords?: string[];
  attributes?: Record<string, unknown>;
  status?: ProductStatus;
  is_active?: boolean;
  price?: number;
  compare_at_price?: number;
  discount_percentage?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  video_url?: string;
  images?: ProductImageCreate[];
}

export interface ProductListResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  status_counts: {
    draft: number;
    published: number;
    archived: number;
    total: number;
  };
}

export interface ProductPublicListResponse {
  items: ProductPublicResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
