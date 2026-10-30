import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ProductCreatePayload,
  ProductListResponse,
  ProductPublicListResponse,
  ProductPublicResponse,
  ProductResponse,
  ProductStatus,
  ProductUpdatePayload,
} from "../types/product.types";

export const productApi = {
  // Public Storefront (strictly published & active items under active categories)
  async listPublic(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_slug?: string;
    category_id?: string;
    tag?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<ProductPublicListResponse> {
    return apiClient.get<ProductPublicListResponse>(ENDPOINTS.public.products, { params });
  },

  async getPublicBySlug(slug: string): Promise<ProductPublicResponse> {
    return apiClient.get<ProductPublicResponse>(ENDPOINTS.public.productDetail(slug));
  },

  // Admin Master
  async listAdmin(
    token?: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      category_id?: string;
      status?: ProductStatus;
      is_active?: boolean;
      sort_by?: string;
      sort_order?: string;
    }
  ): Promise<ProductListResponse> {
    return apiClient.get<ProductListResponse>(ENDPOINTS.admin.products, { token, params });
  },

  async getById(id: string, token?: string): Promise<ProductResponse> {
    return apiClient.get<ProductResponse>(`${ENDPOINTS.admin.products}/${id}`, { token });
  },

  async create(payload: ProductCreatePayload, token?: string): Promise<ProductResponse> {
    return apiClient.post<ProductResponse>(ENDPOINTS.admin.products, payload, { token });
  },

  async update(id: string, payload: ProductUpdatePayload, token?: string): Promise<ProductResponse> {
    return apiClient.patch<ProductResponse>(`${ENDPOINTS.admin.products}/${id}`, payload, { token });
  },

  async delete(id: string, token?: string): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.admin.products}/${id}`, { token });
  },

  async updateStatus(id: string, status: ProductStatus, token?: string): Promise<ProductResponse> {
    return apiClient.patch<ProductResponse>(ENDPOINTS.admin.productStatus(id), { status }, { token });
  },

  async toggleActive(id: string, is_active: boolean, token?: string): Promise<ProductResponse> {
    return apiClient.patch<ProductResponse>(ENDPOINTS.admin.productActive(id), { is_active }, { token });
  },

  // Cloudinary Media Uploads (Max 5 images, Max 1 video)
  async uploadImage(
    productId: string,
    file: File,
    options?: { is_primary?: boolean; alt_text?: string },
    token?: string
  ): Promise<ProductResponse> {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.is_primary !== undefined) {
      formData.append("is_primary", String(options.is_primary));
    }
    if (options?.alt_text) {
      formData.append("alt_text", options.alt_text);
    }
    return apiClient.post<ProductResponse>(ENDPOINTS.admin.productImages(productId), formData, { token });
  },

  async deleteImage(productId: string, imageId: string, token?: string): Promise<ProductResponse> {
    return apiClient.delete<ProductResponse>(
      ENDPOINTS.admin.productImageDelete(productId, imageId),
      { token }
    );
  },

  async uploadVideo(productId: string, file: File, token?: string): Promise<ProductResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ProductResponse>(ENDPOINTS.admin.productVideo(productId), formData, { token });
  },

  async deleteVideo(productId: string, token?: string): Promise<ProductResponse> {
    return apiClient.delete<ProductResponse>(ENDPOINTS.admin.productVideo(productId), { token });
  },
};
