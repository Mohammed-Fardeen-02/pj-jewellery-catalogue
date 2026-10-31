"use client";

import * as React from "react";
import { categoryApi } from "../api/category.api";
import type { CategoryResponse, CategoryCreatePayload } from "../types/category.types";
import { useAuth } from "@/features/auth";

export interface UseCategoriesOptions {
  autoLoad?: boolean;
  isActive?: boolean;
  limit?: number;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { autoLoad = true, isActive, limit = 100 } = options;
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [categories, setCategories] = React.useState<CategoryResponse[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (token) {
        try {
          const res = await categoryApi.listAdmin(token, {
            limit,
            is_active: isActive,
          });
          setCategories(res.items);
          setTotal(res.total);
          return;
        } catch {
          // If admin listing fails with 401/unauthorized, fallback seamlessly to public categories
        }
      }

      // Public categories fallback (no auth token required)
      const publicCats = await categoryApi.listPublic();
      const mapped: CategoryResponse[] = publicCats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        is_active: true,
        product_count: c.product_count ?? 0,
        created_at: "",
        updated_at: "",
      }));
      setCategories(mapped);
      setTotal(mapped.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load categories";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token, limit, isActive]);

  React.useEffect(() => {
    if (autoLoad) {
      fetchCategories();
    }
  }, [autoLoad, fetchCategories]);

  const createCategory = React.useCallback(
    async (payload: CategoryCreatePayload): Promise<CategoryResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const newCat = await categoryApi.create(payload, token || undefined);
        // Prepend new category and increment total
        setCategories((prev) => [newCat, ...prev]);
        setTotal((prev) => prev + 1);
        return newCat;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create category";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  return {
    categories,
    total,
    isLoading,
    error,
    refresh: fetchCategories,
    createCategory,
  };
}
