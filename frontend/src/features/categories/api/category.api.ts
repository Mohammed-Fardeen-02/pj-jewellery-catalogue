import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CategoryCreatePayload,
  CategoryListResponse,
  CategoryPublicResponse,
  CategoryResponse,
  CategoryUpdatePayload,
} from "../types/category.types";

export const categoryApi = {
  // Public Storefront
  async listPublic(params?: { search?: string; sort_by?: string; sort_order?: string }): Promise<CategoryPublicResponse[]> {
    return apiClient.get<CategoryPublicResponse[]>(ENDPOINTS.public.categories, { params });
  },

  async getPublicBySlug(slug: string): Promise<CategoryPublicResponse> {
    return apiClient.get<CategoryPublicResponse>(ENDPOINTS.public.categoryDetail(slug));
  },

  async getBySlug(slug: string): Promise<CategoryPublicResponse> {
    return this.getPublicBySlug(slug);
  },

  // Admin Master
  async listAdmin(
    token?: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      is_active?: boolean;
      sort_by?: string;
      sort_order?: string;
    }
  ): Promise<CategoryListResponse> {
    return apiClient.get<CategoryListResponse>(ENDPOINTS.admin.categories, { token, params });
  },

  async create(payload: CategoryCreatePayload, token?: string): Promise<CategoryResponse> {
    return apiClient.post<CategoryResponse>(ENDPOINTS.admin.categories, payload, { token });
  },

  async update(id: string, payload: CategoryUpdatePayload, token?: string): Promise<CategoryResponse> {
    return apiClient.patch<CategoryResponse>(`${ENDPOINTS.admin.categories}/${id}`, payload, { token });
  },

  async delete(id: string, token?: string): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.admin.categories}/${id}`, { token });
  },
};
