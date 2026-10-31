"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  History,
  PackagePlus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StockOverviewCards } from "../components/StockOverviewCards";
import { LowStockAlertsBanner } from "../components/LowStockAlertsBanner";
import { StockAdjustmentModal } from "../components/StockAdjustmentModal";
import { StockHistoryModal } from "../components/StockHistoryModal";
import { useStockOverview } from "../hooks/useStock";
import type { ProductResponse } from "@/features/products";
import type { StockFilterStatus } from "../types/stock.types";

export function StockOverviewPage() {
  const {
    overview,
    products,
    allProducts,
    totalItems,
    loading,
    refreshing,
    search,
    setSearch,
    stockFilter,
    setStockFilter,
    page,
    setPage,
    limit,
    setLimit,
    refetch,
  } = useStockOverview();

  // Modals state
  const [selectedAdjustProduct, setSelectedAdjustProduct] = React.useState<ProductResponse | null>(null);
  const [selectedHistoryProduct, setSelectedHistoryProduct] = React.useState<ProductResponse | null>(null);

  const lowStockAlerts = overview?.low_stock_items || [];

  return (
    <div className="space-y-8">
      {/* Page Header with Main 'Adjust Stock' Action Button */}
      <PageHeader
        title="Vault Inventory & Storage Vault"
        subtitle="Independent stock control module: oversee bullion & gemstone inventory, record vault adjustments, monitor replenishment alerts, and audit chronological ledgers."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading || refreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Link href="/admin/stock/alerts">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-amber-300 text-amber-900 hover:bg-amber-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Alerts</span>
                {overview && (overview.low_stock_count + overview.out_of_stock_count) > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-200 text-amber-900 rounded-full font-bold">
                    {overview.low_stock_count + overview.out_of_stock_count}
                  </span>
                )}
              </Button>
            </Link>

            {/* Primary Main Navigate Button */}
            <Link href="/admin/stock/adjust">
              <Button size="sm" className="gap-2 bg-[#24211E] text-white hover:bg-black shadow-xs">
                <PackagePlus className="w-4 h-4 text-[#B08D57]" />
                <span>Adjust Stock</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Dynamic Metric Cards */}
      <StockOverviewCards
        overview={overview}
        activeFilter={stockFilter}
        onFilterSelect={(status) => setStockFilter(status as StockFilterStatus)}
      />

      {/* Low Stock Alerts Notification Banner */}
      <LowStockAlertsBanner
        alerts={lowStockAlerts}
        onFilterLowStock={() => setStockFilter("low_stock")}
      />

      {/* Search & Stock Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border border-[#E8E1D8] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716B64]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search piece by title, SKU, or category..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "all", label: "All Items", count: allProducts.length },
            { key: "in_stock", label: "In Stock", count: overview?.in_stock_count ?? 0 },
            { key: "low_stock", label: "Low Stock Alert", count: overview?.low_stock_count ?? 0 },
            { key: "out_of_stock", label: "Out of Stock", count: overview?.out_of_stock_count ?? 0 },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStockFilter(item.key as StockFilterStatus)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                stockFilter === item.key
                  ? "bg-[#24211E] text-white shadow-xs"
                  : "bg-[#FAF8F4] text-[#716B64] hover:text-[#24211E] border border-[#E8E1D8]"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  stockFilter === item.key ? "bg-white/20 text-white" : "bg-[#E8E1D8] text-[#716B64]"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Stock Table with Pagination */}
      <Card className="bg-white border-[#E8E1D8] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <LoadingSpinner className="py-8" />
            <p className="text-xs text-[#716B64] mt-2">Reading vault ledger records...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No Inventory Records Found"
              description={
                search
                  ? `No pieces matched "${search}". Try adjusting your query.`
                  : "No pieces match the selected inventory condition filter."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E1D8] bg-[#FAF8F4] text-[#716B64] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6 font-semibold">Media</th>
                  <th className="py-3 px-6 font-semibold">SKU Identifier</th>
                  <th className="py-3 px-6 font-semibold">Jewellery Piece</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Vault Balance</th>
                  <th className="py-3 px-6 font-semibold">Threshold</th>
                  <th className="py-3 px-6 font-semibold">Health Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Inventory Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE2]">
                {products.map((p) => {
                  const stock = Number(p.stock_quantity ?? 0);
                  const threshold = p.low_stock_threshold || 5;
                  const isOut = stock <= 0;
                  const isLow = stock > 0 && stock <= threshold;
                  const heroImg = p.primary_image || p.images[0];

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F4]/70 transition-colors">
                      {/* Thumbnail */}
                      <td className="py-3 px-6">
                        <div className="relative w-11 h-11 bg-[#FAF8F4] rounded border border-[#E8E1D8] overflow-hidden flex items-center justify-center flex-shrink-0">
                          {heroImg ? (
                            <Image
                              src={heroImg.image_url}
                              alt={p.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Sparkles className="w-4 h-4 text-[#B08D57] opacity-60" />
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-6 font-mono text-[#716B64]">{p.sku}</td>

                      {/* Title */}
                      <td className="py-4 px-6">
                        <div className="font-serif text-sm font-medium text-[#24211E]">{p.title}</div>
                        <span className="text-[10px] text-[#716B64]">
                          ${Number(p.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-[#716B64]">{p.category?.name || "--"}</td>

                      {/* Stock Quantity */}
                      <td className="py-4 px-6">
                        <span
                          className={`font-mono font-bold text-sm px-2.5 py-1 border ${
                            isOut
                              ? "bg-red-50 text-red-700 border-red-200"
                              : isLow
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {stock} units
                        </span>
                      </td>

                      {/* Threshold */}
                      <td className="py-4 px-6 font-mono text-[#716B64]">{threshold} units</td>

                      {/* Health Status */}
                      <td className="py-4 px-6">
                        {isOut ? (
                          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 text-[10px]">
                            Depleted (0)
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                            Low Stock Alert
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            Healthy Level
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAdjustProduct(p)}
                          className="h-8 gap-1.5 text-xs text-[#24211E] border-[#D4C9BA] hover:bg-[#FAF8F4]"
                          title="Record Stock In or Stock Out"
                        >
                          <Boxes className="w-3.5 h-3.5 text-[#B08D57]" />
                          Quick Adjust
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedHistoryProduct(p)}
                          className="h-8 gap-1.5 text-xs text-[#716B64] hover:text-[#24211E]"
                          title="View Chronological Ledger"
                        >
                          <History className="w-3.5 h-3.5" />
                          Ledger
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Universal Pagination */}
        {totalItems > limit && (
          <div className="p-4 border-t border-[#E8E1D8]">
            <Pagination
              page={page}
              total={totalItems}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              limitOptions={[10, 20, 50]}
            />
          </div>
        )}
      </Card>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        product={selectedAdjustProduct}
        isOpen={!!selectedAdjustProduct}
        onClose={() => setSelectedAdjustProduct(null)}
        onSuccess={() => {
          setSelectedAdjustProduct(null);
          refetch();
        }}
      />

      {/* Stock History Audit Modal */}
      <StockHistoryModal
        product={selectedHistoryProduct}
        isOpen={!!selectedHistoryProduct}
        onClose={() => setSelectedHistoryProduct(null)}
      />
    </div>
  );
}
