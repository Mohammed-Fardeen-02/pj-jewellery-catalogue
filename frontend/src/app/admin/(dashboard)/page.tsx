"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  FolderTree,
  Gem,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import type { DashboardAnalyticsResponse } from "@/types";

export default function AdminDashboardPage() {
  const { tokens } = useAuth();
  const token = tokens?.access_token;
  const [dateRange, setDateRange] = React.useState<string>("30d");
  const [data, setData] = React.useState<DashboardAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyticsApi.getDashboard(dateRange, token || undefined);
      setData(response);
    } catch (err: any) {
      console.error("Dashboard analytics error:", err);
      setError(err?.message || "Failed to retrieve dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, token]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const cat = data?.catalogue;
  const inv = data?.inventory;
  const com = data?.commerce;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Atelier Intelligence & Overview"
        subtitle="Live dynamic metrics for PJ high-jewellery master catalogue, vault inventory, customer acquisitions, and financial settlement."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/admin/analytics">
              <Button variant="outline" size="sm" className="gap-1.5 border-[#B08D57] text-[#B08D57] hover:bg-[#FAF8F4]">
                <TrendingUp className="w-3.5 h-3.5" />
                Detailed Analytics
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Jewellery Piece
              </Button>
            </Link>
          </div>
        }
      />

      {/* Date Range Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white border border-[#E8E1D8] shadow-sm">
        <div className="flex items-center gap-2 text-xs text-[#716B64] font-medium">
          <Calendar className="w-4 h-4 text-[#B08D57]" />
          <span>Analytics Time Horizon:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { key: "today", label: "Today" },
            { key: "7d", label: "Past 7 Days" },
            { key: "30d", label: "Past 30 Days" },
            { key: "ytd", label: "Year to Date" },
            { key: "all", label: "All Time" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setDateRange(item.key)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                dateRange === item.key
                  ? "bg-[#24211E] text-white shadow-xs"
                  : "bg-[#FAF8F4] text-[#716B64] hover:text-[#24211E] border border-[#E8E1D8]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !data ? (
        <div className="p-16 text-center bg-white border border-[#E8E1D8]">
          <Loader2 className="w-8 h-8 text-[#B08D57] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#716B64]">Compiling real-time atelier analytics...</p>
        </div>
      ) : error && !data ? (
        <div className="p-8 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Main Key Metric Cards (Accurate DB Counts) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Pieces */}
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
                  Total Catalogue Pieces
                </span>
                <Gem className="w-4 h-4 text-[#B08D57]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-[#24211E] font-medium">
                  {cat?.total_products ?? 0}
                </div>
                <p className="text-[11px] text-[#716B64] mt-1 flex items-center gap-1">
                  <span className="text-emerald-700 font-medium">
                    {cat?.active_products ?? 0} active
                  </span>
                  &middot; {cat?.inactive_products ?? 0} inactive
                </p>
              </CardContent>
            </Card>

            {/* Published Status */}
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
                  Published on Storefront
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-[#24211E] font-medium">
                  {cat?.published_products ?? 0}
                </div>
                <p className="text-[11px] text-[#716B64] mt-1">
                  Live for customers ({cat?.draft_products ?? 0} draft)
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
                  Gross Revenue ({dateRange})
                </span>
                <DollarSign className="w-4 h-4 text-[#B08D57]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-[#24211E] font-medium">
                  ${(com?.total_revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-[#716B64] mt-1">
                  {com?.total_orders ?? 0} customer orders (Avg: ${Number(com?.average_order_value || 0).toLocaleString()})
                </p>
              </CardContent>
            </Card>

            {/* Vault Inventory */}
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
                  Vault Stock Units
                </span>
                <PackageCheck className="w-4 h-4 text-[#B08D57]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-[#24211E] font-medium">
                  {inv?.total_stock_units ?? 0}
                </div>
                <p className="text-[11px] text-[#716B64] mt-1">
                  {inv?.low_stock_count ? (
                    <span className="text-amber-700 font-medium">
                      {inv.low_stock_count} low stock &middot; {inv.out_of_stock_count} out of stock
                    </span>
                  ) : (
                    <span className="text-emerald-700">All pieces well stocked</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Row: Daily Trends Bar Representation */}
          {data?.daily_trends && data.daily_trends.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="font-serif text-lg text-[#24211E]">
                    Acquisition &amp; Revenue Trends
                  </CardTitle>
                  <CardDescription className="text-xs text-[#716B64]">
                    Daily order volume and financial settlement over the selected horizon ({dateRange})
                  </CardDescription>
                </div>
                <TrendingUp className="w-4 h-4 text-[#B08D57]" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-36 pt-6 overflow-x-auto pb-2">
                  {data.daily_trends.map((day, idx) => {
                    const maxRev = Math.max(
                      1,
                      ...data.daily_trends.map((d) => d.revenue)
                    );
                    const heightPct = Math.max(8, Math.round((day.revenue / maxRev) * 100));
                    return (
                      <div
                        key={day.date || idx}
                        className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-1 group relative"
                      >
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#24211E] text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-10">
                          {day.date}: ${day.revenue.toLocaleString()} ({day.orders_count} orders)
                        </div>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full transition-all ${
                            day.revenue > 0
                              ? "bg-[#B08D57] group-hover:bg-[#8E6D38]"
                              : "bg-[#E8E1D8] group-hover:bg-[#D4C9BA]"
                          }`}
                        />
                        <span className="text-[9px] text-[#716B64] font-mono truncate w-full text-center">
                          {day.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Two-Column Section: Recent Orders & Stock Movements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Columns: Recent Customer Acquisitions */}
            <div className="lg:col-span-7">
              <Card className="bg-white h-full flex flex-col justify-between">
                <div>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="font-serif text-lg text-[#24211E]">
                        Recent Customer Acquisitions
                      </CardTitle>
                      <CardDescription className="text-xs text-[#716B64]">
                        Latest orders secured via public storefront checkout
                      </CardDescription>
                    </div>
                    <Link
                      href="/admin/orders"
                      className="text-xs text-[#B08D57] hover:underline font-medium flex items-center gap-1"
                    >
                      View All Orders &rarr;
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0">
                    {!data?.recent_orders || data.recent_orders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#716B64]">
                        No acquisitions recorded in this period.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E8E1D8] text-xs">
                        {data.recent_orders.map((order) => (
                          <div key={order.id} className="p-4 flex items-center justify-between hover:bg-[#FAF8F4] transition-colors">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-[#24211E]">
                                  {order.order_number}
                                </span>
                                <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-800 border-emerald-200">
                                  {order.payment_status}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-[#716B64]">
                                {order.customer_name} &middot; {order.items.length} piece(s)
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-sm text-[#24211E]">
                                ${Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                              <p className="text-[10px] text-[#716B64]">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Right 5 Columns: Recent Inventory Movements & Low Stock Alerts */}
            <div className="lg:col-span-5 space-y-6">
              {/* Stock Movement Ledger */}
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="font-serif text-lg text-[#24211E]">
                      Vault Stock Movements
                    </CardTitle>
                    <CardDescription className="text-xs text-[#716B64]">
                      Audit trail of stock in, stock out, and customer orders
                    </CardDescription>
                  </div>
                  <Link
                    href="/admin/stock"
                    className="text-xs text-[#B08D57] hover:underline font-medium flex items-center gap-1"
                  >
                    Manage Stock &rarr;
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  {!data?.recent_stock_transactions || data.recent_stock_transactions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#716B64]">
                      No recent stock adjustments recorded.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E8E1D8] text-xs">
                      {data.recent_stock_transactions.map((tx) => {
                        const isStockIn = tx.transaction_type === "stock_in";
                        return (
                          <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F4] transition-colors">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                                    isStockIn
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-50 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {isStockIn ? "+ Stock In" : "- Stock Out"}
                                </span>
                                <span className="font-medium text-[#24211E] truncate max-w-[150px]">
                                  {tx.product_title || tx.product_sku}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#716B64] mt-0.5 truncate max-w-[200px]">
                                {tx.reason}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-xs text-[#24211E]">
                                {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                              </span>
                              <span className="block text-[10px] text-[#716B64]">
                                Bal: {tx.new_stock}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              {data?.low_stock_alerts && data.low_stock_alerts.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h5 className="font-semibold text-xs uppercase tracking-wider">
                      Inventory Reorder Notice
                    </h5>
                  </div>
                  <p className="text-xs text-amber-800">
                    {data.low_stock_alerts.length} pieces require vault restocking:
                  </p>
                  <ul className="text-xs space-y-1 pl-4 list-disc text-amber-900 font-sans">
                    {data.low_stock_alerts.slice(0, 3).map((item) => (
                      <li key={item.product_id}>
                        <span className="font-medium">{item.title}</span> &middot;{" "}
                        <span className="font-semibold">
                          {item.stock_quantity === 0 ? "Out of Stock" : `${item.stock_quantity} left`}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-1">
                    <Link
                      href="/admin/stock"
                      className="text-xs font-semibold underline text-amber-900 hover:text-black"
                    >
                      Manage Pieces &amp; Restock &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
