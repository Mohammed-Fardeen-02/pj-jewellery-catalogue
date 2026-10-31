"use client";

import * as React from "react";
import Image from "next/image";
import { Check, ChevronDown, Loader2, Package, Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { StockAdjustableItem } from "../types/stock.types";

interface ProductSearchSelectProps {
  products: StockAdjustableItem[];
  selectedProduct: StockAdjustableItem | null;
  onSelect: (product: StockAdjustableItem | null) => void;
  isLoading?: boolean;
}

export function ProductSearchSelect({
  products,
  selectedProduct,
  onSelect,
  isLoading = false,
}: ProductSearchSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return products.slice(0, 30);
    const q = search.toLowerCase();
    return products
      .filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
        );
      })
      .slice(0, 30);
  }, [products, search]);

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#716B64]">
        Target Jewellery Piece <span className="text-red-500">*</span>
      </label>

      {/* Selected Product Card or Search Input Trigger */}
      {selectedProduct ? (
        <div className="flex items-center justify-between p-3.5 bg-[#FAF8F4] border-2 border-[#B08D57] rounded-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-white rounded border border-[#E8E1D8] overflow-hidden flex items-center justify-center shrink-0">
              {selectedProduct.primary_image?.image_url || selectedProduct.images?.[0]?.image_url ? (
                <Image
                  src={selectedProduct.primary_image?.image_url || selectedProduct.images![0].image_url}
                  alt={selectedProduct.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <Sparkles className="w-5 h-5 text-[#B08D57]" />
              )}
            </div>
            <div>
              <h4 className="font-serif text-sm font-medium text-[#24211E]">
                {selectedProduct.title}
              </h4>
              <div className="flex items-center gap-3 text-[11px] text-[#716B64] mt-0.5">
                <span className="font-mono text-[#24211E] font-medium">SKU: {selectedProduct.sku}</span>
                {selectedProduct.category?.name && (
                  <span>&middot; {selectedProduct.category.name}</span>
                )}
                <span>
                  &middot; Current Vault:{" "}
                  <strong className="text-[#24211E] font-mono">
                    {selectedProduct.stock_quantity}
                  </strong>{" "}
                  units
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelect(null)}
            className="p-1.5 text-[#716B64] hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-[#E8E1D8] transition-colors"
            title="Change selected piece"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716B64]" />
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search jewellery piece by title, SKU, or category..."
              className="pl-9 pr-9 h-11 text-xs bg-white"
            />
            {isLoading ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B08D57] animate-spin" />
            ) : (
              <ChevronDown
                onClick={() => setIsOpen((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716B64] cursor-pointer"
              />
            )}
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E8E1D8] shadow-xl max-h-72 overflow-y-auto z-50 divide-y divide-[#F0EAE2]">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#716B64]">
                  {search ? `No piece matching "${search}" found in master catalogue.` : "No pieces available."}
                </div>
              ) : (
                filtered.map((product) => {
                  const stockNum = Number(product.stock_quantity ?? 0);
                  const threshold = Number(product.low_stock_threshold || 5);
                  const isOut = stockNum <= 0;
                  const isLow = stockNum > 0 && stockNum <= threshold;
                  const imgUrl = product.primary_image?.image_url || product.images?.[0]?.image_url;

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelect(product);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className="p-3 hover:bg-[#FAF8F4] cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-[#FAF8F4] rounded border border-[#E8E1D8] overflow-hidden flex items-center justify-center shrink-0">
                          {imgUrl ? (
                            <Image src={imgUrl} alt={product.title} fill sizes="40px" className="object-cover" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-[#B08D57]" />
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-medium text-[#24211E]">{product.title}</p>
                          <p className="font-mono text-[10px] text-[#716B64]">
                            {product.sku} {product.category?.name ? `· ${product.category.name}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block font-mono font-bold text-xs px-2 py-0.5 border ${
                            isOut
                              ? "bg-red-50 text-red-700 border-red-200"
                              : isLow
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {stockNum} units
                        </span>
                        <span className="block text-[9px] text-[#9E988F] mt-0.5">
                          Min: {threshold}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
