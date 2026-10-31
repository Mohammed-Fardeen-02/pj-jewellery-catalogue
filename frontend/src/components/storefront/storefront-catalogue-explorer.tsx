"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, Sparkles, Gem, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import type { CategoryPublicResponse } from "@/features/categories/types/category.types";
import type { ProductPublicResponse } from "@/features/products/types/product.types";
import { cn } from "@/lib/utils/cn";

interface StorefrontCatalogueExplorerProps {
  categories: CategoryPublicResponse[];
  initialProducts: ProductPublicResponse[];
}

export function StorefrontCatalogueExplorer({
  categories,
  initialProducts,
}: StorefrontCatalogueExplorerProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Filter products locally in real-time
  const filteredProducts = React.useMemo(() => {
    return initialProducts.filter((product) => {
      // Category match
      if (selectedCategorySlug !== "all") {
        const prodCatSlug = product.category?.slug;
        if (prodCatSlug !== selectedCategorySlug) {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (product.title || "").toLowerCase().includes(query);
        const skuMatch = (product.sku || "").toLowerCase().includes(query);
        const descMatch = (product.description || "").toLowerCase().includes(query);
        const catMatch = (product.category?.name || "").toLowerCase().includes(query);

        // Attributes match
        const attrs = product.attributes || {};
        const metalMatch = String(attrs.metal_type || "").toLowerCase().includes(query);
        const gemMatch = String(attrs.gemstone_type || "").toLowerCase().includes(query);
        const styleMatch = String(attrs.design_style || "").toLowerCase().includes(query);
        const collectionMatch = String(attrs.collection || "").toLowerCase().includes(query);

        // Tags match
        const tagMatch = (product.tags || []).some((t: string) => t.toLowerCase().includes(query));

        return (
          titleMatch ||
          skuMatch ||
          descMatch ||
          catMatch ||
          metalMatch ||
          gemMatch ||
          styleMatch ||
          collectionMatch ||
          tagMatch
        );
      }

      return true;
    });
  }, [initialProducts, selectedCategorySlug, searchQuery]);

  const scrollBadges = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const clearFilters = () => {
    setSelectedCategorySlug("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-8">
      {/* Search Bar & Header Strip */}
      <div className="bg-white border border-[#E8E1D8] p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold block mb-0.5">
              Live Catalogue Search
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#24211E]">
              Explore Atelier Pieces
            </h2>
          </div>

          {/* Prominent Search Input */}
          <div className="relative flex-1 sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B08D57]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diamonds, sapphires, gold, rings, or SKU..."
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#FAF8F4] border border-[#DCD3C7] focus:border-[#B08D57] focus:bg-white focus:outline-none text-[#24211E] placeholder:text-[#9A9388] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9A9388] hover:text-[#24211E] transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Compact Badges Row - Scrollable Left to Right */}
        <div className="pt-2 border-t border-[#F0EBE3] flex items-center gap-2">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollBadges("left")}
            className="hidden sm:flex shrink-0 w-7 h-7 rounded-full border border-[#E8E1D8] bg-[#FAF8F4] text-[#716B64] hover:text-[#24211E] hover:border-[#B08D57] items-center justify-center transition-colors shadow-2xs"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Horizontal Badge Track */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {/* All Pieces Badge */}
            <button
              type="button"
              onClick={() => setSelectedCategorySlug("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 flex items-center gap-1.5 shadow-2xs",
                selectedCategorySlug === "all"
                  ? "bg-[#1A1816] text-[#FAF8F4] border-[#B08D57] ring-1 ring-[#B08D57]/40"
                  : "bg-white text-[#524B43] border-[#E8E1D8] hover:border-[#B08D57] hover:text-[#1A1816]"
              )}
            >
              <Gem className="w-3 h-3 text-[#B08D57]" />
              <span>All Jewellery</span>
              <span className="text-[10px] opacity-70 ml-0.5">({initialProducts.length})</span>
            </button>

            {/* Category Badges */}
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              const count = initialProducts.filter((p) => p.category?.slug === cat.slug).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 flex items-center gap-1.5 shadow-2xs",
                    isSelected
                      ? "bg-[#1A1816] text-[#FAF8F4] border-[#B08D57] ring-1 ring-[#B08D57]/40"
                      : "bg-white text-[#524B43] border-[#E8E1D8] hover:border-[#B08D57] hover:text-[#1A1816]"
                  )}
                >
                  <span>{cat.name}</span>
                  {count > 0 && <span className="text-[10px] opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollBadges("right")}
            className="hidden sm:flex shrink-0 w-7 h-7 rounded-full border border-[#E8E1D8] bg-[#FAF8F4] text-[#716B64] hover:text-[#24211E] hover:border-[#B08D57] items-center justify-center transition-colors shadow-2xs"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-[#716B64] pt-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#24211E]">{filteredProducts.length}</strong> of {initialProducts.length} pieces
            </span>
            {(selectedCategorySlug !== "all" || searchQuery.trim()) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[#B08D57] hover:underline flex items-center gap-1 text-[11px]"
              >
                <X className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>

          <Link
            href="/products"
            className="text-xs uppercase tracking-widest text-[#716B64] hover:text-[#B08D57] font-semibold transition-colors hidden sm:inline"
          >
            Full Catalogue Index &rarr;
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E1D8] p-8 space-y-3">
          <Gem className="w-8 h-8 text-[#B08D57] mx-auto opacity-60" />
          <h3 className="font-serif text-xl text-[#24211E]">No Jewellery Pieces Found</h3>
          <p className="text-xs text-[#716B64] max-w-sm mx-auto">
            {searchQuery
              ? `No masterpieces match your search "${searchQuery}". Try searching for diamonds, emeralds, or clear your query.`
              : "No pieces available in this category currently."}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#24211E] text-white hover:bg-[#B08D57] transition-colors"
          >
            Show All Pieces
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
