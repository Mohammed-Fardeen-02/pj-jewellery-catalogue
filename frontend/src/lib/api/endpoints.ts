/**
 * Centralized API endpoint registry matching backend contracts.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  process.env.API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

export const API_V1_PREFIX =
  process.env.NEXT_PUBLIC_API_V1_PREFIX?.replace(/\/+$/, "") ||
  process.env.API_V1_PREFIX?.replace(/\/+$/, "") ||
  "/api/v1";

export const ENDPOINTS = {
  // System Health
  health: {
    process: "/health",
    live: `${API_V1_PREFIX}/health/live`,
    ready: `${API_V1_PREFIX}/health/ready`,
  },

  // Authentication
  auth: {
    login: `${API_V1_PREFIX}/auth/login`,
    refresh: `${API_V1_PREFIX}/auth/refresh`,
    me: `${API_V1_PREFIX}/auth/me`,
  },

  // Catalogue Management
  admin: {
    categories: `${API_V1_PREFIX}/admin/categories`,
    products: `${API_V1_PREFIX}/admin/products`,
    productImages: (id: string) => `${API_V1_PREFIX}/admin/products/${id}/images`,
    productImageDelete: (id: string, imageId: string) =>
      `${API_V1_PREFIX}/admin/products/${id}/images/${imageId}`,
    productVideo: (id: string) => `${API_V1_PREFIX}/admin/products/${id}/video`,
    productActive: (id: string) => `${API_V1_PREFIX}/admin/products/${id}/active`,
    productStatus: (id: string) => `${API_V1_PREFIX}/admin/products/${id}/status`,
    productStockAdjust: (id: string) => `${API_V1_PREFIX}/admin/products/${id}/stock/adjust`,
    productStockHistory: (id: string) => `${API_V1_PREFIX}/admin/products/${id}/stock/history`,
    stockOverview: `${API_V1_PREFIX}/admin/stock/overview`,
    orders: `${API_V1_PREFIX}/admin/orders`,
    orderDetail: (id: string) => `${API_V1_PREFIX}/admin/orders/${id}`,
    orderInvoice: (id: string) => `${API_V1_PREFIX}/admin/orders/${id}/invoice`,
    analyticsDashboard: (range: string = "30d") => `${API_V1_PREFIX}/admin/analytics/dashboard?range=${range}`,
    aiSuggest: `${API_V1_PREFIX}/admin/ai/suggest-product`,
  },

  // Public Storefront Catalogue & Checkout
  public: {
    categories: `${API_V1_PREFIX}/public/categories`,
    categoryDetail: (slug: string) => `${API_V1_PREFIX}/public/categories/${slug}`,
    products: `${API_V1_PREFIX}/public/products`,
    productDetail: (slug: string) => `${API_V1_PREFIX}/public/products/${slug}`,
    orders: `${API_V1_PREFIX}/public/orders`,
  },

  // Brand Metadata
  brands: `${API_V1_PREFIX}/brands`,
} as const;

