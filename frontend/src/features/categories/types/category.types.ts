export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryPublicResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count: number;
}

export interface CategoryCreatePayload {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryUpdatePayload {
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryListResponse {
  items: CategoryResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
