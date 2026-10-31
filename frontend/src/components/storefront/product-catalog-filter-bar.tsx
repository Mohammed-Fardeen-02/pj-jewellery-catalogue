"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Gem } from "lucide-react";
import type { CategoryPublicResponse } from "@/features/categories/types/category.types";
import { cn } from "@/lib/utils/cn";

interface ProductCatalogFilterBarProps {
  categories: CategoryPublicResponse[];
  totalCount: number;
}

export function ProductCatalogFilterBar({
  categories,
  totalCount,
}: ProductCatalogFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = React.useState(currentSearch);

  // Sync state if URL changes externally
  React.useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 border-b border-[#E8E1D8] pb-6">
      {/* Top Search Input Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B08D57]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by gemstone, metal, diamond, collection, or SKU..."
            className="w-full pl-10 pr-20 py-2.5 text-xs bg-white border border-[#DCD3C7] focus:border-[#B08D57] focus:outline-none text-[#24211E] placeholder:text-[#9A9388] transition-colors shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 text-[#9A9388] hover:text-[#24211E] transition-colors"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold bg-[#24211E] text-white hover:bg-[#B08D57] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <span className="text-xs text-[#716B64] italic self-center">
          Single-Brand Private Collection &middot; {totalCount} available
        </span>
      </div>

      {/* Category Badges Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Link
          href={
            currentSearch
              ? `/products?search=${encodeURIComponent(currentSearch)}`
              : "/products"
          }
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 border shrink-0 flex items-center gap-1.5 shadow-2xs",
            !currentCategory
              ? "bg-[#1A1816] text-[#FAF8F4] border-[#B08D57]"
              : "bg-white text-[#524B43] border-[#E8E1D8] hover:border-[#B08D57]"
          )}
        >
          <Gem className="w-3 h-3 text-[#B08D57]" />
          <span>All Pieces</span>
        </Link>

        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          const href = currentSearch
            ? `/products?category=${cat.slug}&search=${encodeURIComponent(currentSearch)}`
            : `/products?category=${cat.slug}`;

          return (
            <Link
              key={cat.id}
              href={href}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-200 border shrink-0 flex items-center gap-1.5 shadow-2xs",
                isActive
                  ? "bg-[#1A1816] text-[#FAF8F4] border-[#B08D57]"
                  : "bg-white text-[#524B43] border-[#E8E1D8] hover:border-[#B08D57]"
              )}
            >
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
