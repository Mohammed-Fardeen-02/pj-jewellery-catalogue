"use client";

import * as React from "react";
import { stockApi } from "../api/stock.api";
import { productApi, type ProductResponse } from "@/features/products";
import { useAuth } from "@/features/auth";
import type {
  StockAdjustmentPayload,
  StockFilterStatus,
  StockOverviewResponse,
  StockTransactionResponse,
  LowStockItemAlert,
} from "../types/stock.types";

export function useStockOverview() {
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [overview, setOverview] = React.useState<StockOverviewResponse | null>(null);
  const [products, setProducts] = React.useState<ProductResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = React.useState("");
  const [stockFilter, setStockFilter] = React.useState<StockFilterStatus>("all");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const fetchData = React.useCallback(async () => {
    setError(null);
    try {
      const [overviewData, productsData] = await Promise.all([
        stockApi.getOverview(token || undefined),
        productApi.listAdmin(token || undefined, { limit: 100 }),
      ]);

      const items = productsData.items || [];
      setProducts(items);

      // Normalize overview metrics dynamically
      const totalUnits =
        overviewData?.total_stock_units ??
        overviewData?.total_inventory_units ??
        items.reduce((sum, p) => sum + Number(p.stock_quantity || 0), 0);

      const outOfStock =
        overviewData?.out_of_stock_count ??
        items.filter((p) => Number(p.stock_quantity || 0) <= 0).length;

      const lowStock =
        overviewData?.low_stock_count ??
        items.filter((p) => {
          const s = Number(p.stock_quantity || 0);
          const t = Number(p.low_stock_threshold || 5);
          return s > 0 && s <= t;
        }).length;

      const wellStocked =
        overviewData?.in_stock_count ??
        items.filter((p) => {
          const s = Number(p.stock_quantity || 0);
          const t = Number(p.low_stock_threshold || 5);
          return s > t;
        }).length;

      const totalProds =
        overviewData?.total_products ??
        overviewData?.total_products_tracked ??
        items.length;

      setOverview({
        total_stock_units: totalUnits,
        total_inventory_units: totalUnits,
        total_products: totalProds,
        total_products_tracked: totalProds,
        in_stock_count: wellStocked,
        low_stock_count: lowStock,
        out_of_stock_count: outOfStock,
        low_stock_items: overviewData?.low_stock_items || [],
      });
    } catch (err: any) {
      console.error("Stock data load failed:", err);
      setError(err?.message || "Failed to load inventory data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Client-side filtering & search
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const stock = Number(p.stock_quantity ?? 0);
      const threshold = Number(p.low_stock_threshold || 5);

      if (stockFilter === "in_stock" && stock <= threshold) return false;
      if (stockFilter === "low_stock" && (stock === 0 || stock > threshold)) return false;
      if (stockFilter === "out_of_stock" && stock > 0) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCategory = p.category?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSku && !matchesCategory) return false;
      }

      return true;
    });
  }, [products, stockFilter, search]);

  // Paginated slice
  const paginatedProducts = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProducts.slice(start, start + limit);
  }, [filteredProducts, page, limit]);

  return {
    overview,
    products: paginatedProducts,
    allProducts: products,
    totalItems: filteredProducts.length,
    loading,
    refreshing,
    error,
    search,
    setSearch: (s: string) => {
      setSearch(s);
      setPage(1);
    },
    stockFilter,
    setStockFilter: (f: StockFilterStatus) => {
      setStockFilter(f);
      setPage(1);
    },
    page,
    setPage,
    limit,
    setLimit,
    refetch,
  };
}

export function useStockAdjustments() {
  const { tokens } = useAuth();
  const token = tokens?.access_token;
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const executeAdjustment = React.useCallback(
    async (
      productId: string,
      payload: StockAdjustmentPayload
    ): Promise<StockTransactionResponse | null> => {
      setSubmitting(true);
      setError(null);
      try {
        const result = await stockApi.adjustStock(productId, payload, token);
        return result;
      } catch (err: any) {
        console.error("Stock adjustment failed:", err);
        setError(err?.message || "Failed to post stock adjustment.");
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [token]
  );

  return {
    executeAdjustment,
    submitting,
    error,
    setError,
  };
}

export function useLowStockAlerts() {
  const { overview, allProducts, loading, refetch } = useStockOverview();

  const alerts = React.useMemo<LowStockItemAlert[]>(() => {
    if (overview?.low_stock_items && overview.low_stock_items.length > 0) {
      return overview.low_stock_items;
    }

    return allProducts
      .filter((p) => {
        const stock = Number(p.stock_quantity ?? 0);
        const threshold = Number(p.low_stock_threshold || 5);
        return stock <= threshold;
      })
      .map((p) => {
        const stock = Number(p.stock_quantity ?? 0);
        const threshold = Number(p.low_stock_threshold || 5);
        const heroImg = p.primary_image || p.images[0];
        return {
          product_id: p.id,
          title: p.title,
          sku: p.sku,
          stock_quantity: stock,
          low_stock_threshold: threshold,
          shortage: Math.max(0, threshold - stock),
          status: stock <= 0 ? "out_of_stock" : "low_stock",
          category_name: p.category?.name || null,
          primary_image_url: heroImg?.image_url || null,
        };
      })
      .sort((a, b) => a.stock_quantity - b.stock_quantity);
  }, [overview, allProducts]);

  const depletedCount = alerts.filter((a) => a.stock_quantity <= 0).length;
  const lowCount = alerts.filter((a) => a.stock_quantity > 0).length;

  return {
    alerts,
    totalAlerts: alerts.length,
    depletedCount,
    lowCount,
    loading,
    refetch,
  };
}
