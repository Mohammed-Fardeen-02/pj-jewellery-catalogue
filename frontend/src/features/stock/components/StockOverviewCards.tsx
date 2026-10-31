"use client";

import * as React from "react";
import { AlertTriangle, Boxes, PackageCheck, PackageX } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { StockOverviewResponse } from "../types/stock.types";

interface StockOverviewCardsProps {
  overview: StockOverviewResponse | null;
  onFilterSelect?: (status: "all" | "in_stock" | "low_stock" | "out_of_stock") => void;
  activeFilter?: string;
}

export function StockOverviewCards({
  overview,
  onFilterSelect,
  activeFilter = "all",
}: StockOverviewCardsProps) {
  const totalUnits = overview?.total_stock_units ?? overview?.total_inventory_units ?? 0;
  const inStock = overview?.in_stock_count ?? 0;
  const lowStock = overview?.low_stock_count ?? 0;
  const outOfStock = overview?.out_of_stock_count ?? 0;
  const totalTracked = overview?.total_products ?? overview?.total_products_tracked ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Vault Units */}
      <Card
        onClick={() => onFilterSelect?.("all")}
        className={`bg-white border transition-all cursor-pointer ${
          activeFilter === "all" ? "border-[#B08D57] shadow-sm ring-1 ring-[#B08D57]/30" : "border-[#E8E1D8] hover:border-[#B08D57]"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
            Total Stock Units
          </span>
          <Boxes className="w-4 h-4 text-[#B08D57]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-serif text-[#24211E] font-medium">
            {totalUnits.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#716B64] mt-1">
            Physical units held across {totalTracked} catalogue pieces
          </p>
        </CardContent>
      </Card>

      {/* Well Stocked Pieces */}
      <Card
        onClick={() => onFilterSelect?.("in_stock")}
        className={`bg-white border transition-all cursor-pointer ${
          activeFilter === "in_stock" ? "border-emerald-600 shadow-sm ring-1 ring-emerald-600/30" : "border-[#E8E1D8] hover:border-emerald-500"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
            Well Stocked Pieces
          </span>
          <PackageCheck className="w-4 h-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-serif text-[#24211E] font-medium text-emerald-800">
            {inStock}
          </div>
          <p className="text-[11px] text-[#716B64] mt-1">
            Pieces above minimum replenishment threshold
          </p>
        </CardContent>
      </Card>

      {/* Low Stock Warnings */}
      <Card
        onClick={() => onFilterSelect?.("low_stock")}
        className={`bg-white border transition-all cursor-pointer ${
          activeFilter === "low_stock" ? "border-amber-600 shadow-sm ring-1 ring-amber-600/30" : "border-[#E8E1D8] hover:border-amber-500"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
            Low Stock Warnings
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-serif text-[#24211E] font-medium text-amber-800">
            {lowStock}
          </div>
          <p className="text-[11px] text-[#716B64] mt-1">
            Pieces requiring atelier supplier replenishment
          </p>
        </CardContent>
      </Card>

      {/* Depleted Pieces */}
      <Card
        onClick={() => onFilterSelect?.("out_of_stock")}
        className={`bg-white border transition-all cursor-pointer ${
          activeFilter === "out_of_stock" ? "border-red-600 shadow-sm ring-1 ring-red-600/30" : "border-[#E8E1D8] hover:border-red-500"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
            Depleted Pieces
          </span>
          <PackageX className="w-4 h-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-serif text-[#24211E] font-medium text-red-700">
            {outOfStock}
          </div>
          <p className="text-[11px] text-[#716B64] mt-1">
            0 inventory in vault (marked unavailable on storefront)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
