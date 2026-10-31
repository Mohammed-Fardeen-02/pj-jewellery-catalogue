import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Order, OrderCreatePayload } from "@/types";

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const ordersApi = {
  // Public Storefront Checkout
  async createStorefrontOrder(payload: OrderCreatePayload): Promise<Order> {
    return apiClient.post<Order>(ENDPOINTS.public.orders, payload);
  },

  // Admin Order Listing
  async listOrders(
    token?: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }
  ): Promise<OrderListResponse> {
    return apiClient.get<OrderListResponse>(ENDPOINTS.admin.orders, { token, params });
  },

  async getOrderById(id: string, token?: string): Promise<Order> {
    return apiClient.get<Order>(ENDPOINTS.admin.orderDetail(id), { token });
  },
};
