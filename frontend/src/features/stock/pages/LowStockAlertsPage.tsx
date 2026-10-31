"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Loader2,
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
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Pagination } from "@/components/ui/pagination";
import { useLowStockAlerts } from "../hooks/useStock";

export function LowStockAlertsPage() {
  const { alerts, totalAlerts, depletedCount, lowCount, loading, refetch } = useLowStockAlerts();

  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState<"all" | "depleted" | "low">("all");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(15);

  const filtered = React.useMemo(() => {
    return alerts.filter((item) => {
      if (filterType === "depleted" && item.stock_quantity > 0) return false;
      if (filterType === "low" && item.stock_quantity <= 0) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesCategory = item.category_name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSku && !matchesCategory) return false;
      }

      return true;
    });
  }, [alerts, filterType, search]);

  const paginated = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  return (
    <div className="space-y-6">
      {/* Return Link & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/stock"
          className="inline-flex items-center gap-1.5 text-xs text-[#716B64] hover:text-[#24211E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storage Vault</span>
        </Link>
      </div>

      <PageHeader
        title="Inventory Shortage & Low Stock Alerts"
        subtitle="Pieces matching or falling below the minimum replenishment safety threshold defined in the product master catalogue."
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/stock">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Vault
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Alerts
            </Button>
            <Link href="/admin/stock/adjust">
              <Button size="sm" className="gap-1.5 bg-[#24211E] text-white">
                <PackagePlus className="w-3.5 h-3.5" />
                Adjust / Restock
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#E8E1D8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#716B64]">
              Total Alert Pieces
            </span>
            <div className="text-2xl font-serif text-[#24211E] font-medium mt-0.5">
              {totalAlerts}
            </div>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>

        <div className="p-4 bg-white border border-[#E8E1D8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#716B64]">
              Completely Depleted (0)
            </span>
            <div className="text-2xl font-serif text-red-700 font-medium mt-0.5">
              {depletedCount}
            </div>
          </div>
          <span className="px-2 py-0.5 text-xs font-bold font-mono bg-red-100 text-red-800 rounded">
            Depleted
          </span>
        </div>

        <div className="p-4 bg-white border border-[#E8E1D8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#716B64]">
              Low Stock Warnings
            </span>
            <div className="text-2xl font-serif text-amber-800 font-medium mt-0.5">
              {lowCount}
            </div>
          </div>
          <span className="px-2 py-0.5 text-xs font-bold font-mono bg-amber-100 text-amber-800 rounded">
            Replenish
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border border-[#E8E1D8] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716B64]" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search piece by title, SKU, or category..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { key: "all", label: "All Attention Needed", count: totalAlerts },
            { key: "depleted", label: "Depleted (0)", count: depletedCount },
            { key: "low", label: "Low Inventory", count: lowCount },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setFilterType(item.key as any);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                filterType === item.key
                  ? "bg-[#24211E] text-white shadow-xs"
                  : "bg-[#FAF8F4] text-[#716B64] hover:text-[#24211E] border border-[#E8E1D8]"
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Shortage Alerts Matrix Table */}
      <Card className="bg-white border-[#E8E1D8] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <LoadingSpinner className="py-8" />
            <p className="text-xs text-[#716B64] mt-2">Checking inventory safety thresholds...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No Depleted or Low Stock Items"
              description="All jewellery pieces in the vault are currently stocked at or above safety replenishment levels."
            />
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] border-t border-[#E8E1D8]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-[#FAF8F4] shadow-2xs">
                <tr className="border-b border-[#E8E1D8] bg-[#FAF8F4] text-[#716B64] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6 font-semibold">SKU Identifier</th>
                  <th className="py-3 px-6 font-semibold">Jewellery Piece</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Current Stock</th>
                  <th className="py-3 px-6 font-semibold">Min Threshold</th>
                  <th className="py-3 px-6 font-semibold">Shortage Deficiency</th>
                  <th className="py-3 px-6 font-semibold text-right">Replenishment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE2]">
                {paginated.map((item) => {
                  const isOut = item.stock_quantity <= 0;
                  const shortageUnits = item.shortage || Math.max(1, item.low_stock_threshold - item.stock_quantity);

                  return (
                    <tr key={item.product_id} className="hover:bg-[#FAF8F4]/70 transition-colors">
                      {/* SKU */}
                      <td className="py-4 px-6 font-mono font-medium text-[#24211E]">
                        {item.sku}
                      </td>

                      {/* Title */}
                      <td className="py-4 px-6">
                        <div className="font-serif font-medium text-[#24211E]">{item.title}</div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-[#716B64]">
                        {item.category_name || "--"}
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-6">
                        <span
                          className={`font-mono font-bold text-xs px-2.5 py-1 border ${
                            isOut
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {item.stock_quantity} units
                        </span>
                      </td>

                      {/* Min Qty */}
                      <td className="py-4 px-6 font-mono text-[#716B64]">
                        {item.low_stock_threshold} units
                      </td>

                      {/* Shortage */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-200">
                          -{shortageUnits} units
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link href={`/admin/stock/adjust?product_id=${item.product_id}`}>
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 text-xs bg-[#24211E] text-white hover:bg-black"
                          >
                            <PackagePlus className="w-3.5 h-3.5 text-[#B08D57]" />
                            Replenish Stock
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > limit && (
          <div className="p-4 border-t border-[#E8E1D8]">
            <Pagination
              page={page}
              total={filtered.length}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
