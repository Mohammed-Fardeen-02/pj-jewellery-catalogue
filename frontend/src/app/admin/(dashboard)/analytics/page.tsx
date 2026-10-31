"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Calendar,
  CheckCircle2,
  DollarSign,
  Gem,
  Loader2,
  PackageCheck,
  PackageX,
  PieChart,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { useAuth } from "@/features/auth";
import { analyticsApi, type DashboardAnalyticsResponse } from "@/features/analytics";

export default function AdminAnalyticsPage() {
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [dateRange, setDateRange] = React.useState<string>("30d");
  const [data, setData] = React.useState<DashboardAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAnalytics = React.useCallback(async () => {
    setError(null);
    try {
      const response = await analyticsApi.getDashboard(dateRange, token || undefined);
      setData(response);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(err?.message || "Failed to load atelier business analytics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, token]);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics();
  };

  const cat = data?.catalogue;
  const inv = data?.inventory;
  const com = data?.commerce;

  // Max daily revenue for bar normalization
  const maxDailyRevenue = React.useMemo(() => {
    if (!data?.daily_trends || data.daily_trends.length === 0) return 1;
    return Math.max(1, ...data.daily_trends.map((d) => d.revenue));
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Atelier Intelligence & Commercial Analytics"
        subtitle="Deep financial analytics, customer acquisition performance, gemstone catalogue distribution, and vault stock turnover."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Intelligence
            </Button>
          </div>
        }
      />

      {/* Timeframe Horizon Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-[#E8E1D8] shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[#716B64] font-medium">
          <Calendar className="w-4 h-4 text-[#B08D57]" />
          <span>Analytics Timeframe Horizon:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
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
          <LoadingSpinner className="py-8" />
          <p className="text-xs text-[#716B64] mt-2">Synthesizing multi-dimensional atelier analytics...</p>
        </div>
      ) : error && !data ? (
        <div className="p-8 bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      ) : (
        <>
          {/* Main Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Revenue */}
            <Card className="bg-white border-[#E8E1D8]">
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
                  Settled from {com?.total_orders ?? 0} client checkouts
                </p>
              </CardContent>
            </Card>

            {/* Average Order Value */}
            <Card className="bg-white border-[#E8E1D8]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
                  Average Order Value (AOV)
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-[#24211E] font-medium">
                  ${Number(com?.average_order_value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-[#716B64] mt-1">
                  Average high-jewellery investment per order
                </p>
              </CardContent>
            </Card>

            {/* Total Catalogue Pieces */}
            <Card className="bg-white border-[#E8E1D8]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
                  Catalogue Master Pieces
                </span>
                <Gem className="w-4 h-4 text-[#B08D57]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-[#24211E] font-medium">
                  {cat?.total_products ?? 0}
                </div>
                <p className="text-[11px] text-[#716B64] mt-1">
                  <span className="text-emerald-700 font-medium">{cat?.published_products ?? 0} live</span> &middot; {cat?.draft_products ?? 0} draft
                </p>
              </CardContent>
            </Card>

            {/* Vault Inventory Units */}
            <Card className="bg-white border-[#E8E1D8]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
                  Vault Units Standing
                </span>
                <Boxes className="w-4 h-4 text-[#B08D57]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-[#24211E] font-medium">
                  {inv?.total_stock_units ?? 0}
                </div>
                <p className="text-[11px] text-[#716B64] mt-1">
                  {inv?.low_stock_count ? (
                    <span className="text-amber-800 font-medium">
                      {inv.low_stock_count} low stock &middot; {inv.out_of_stock_count} out of stock
                    </span>
                  ) : (
                    <span className="text-emerald-700">Healthy vault coverage</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Trends Visualization */}
          {data?.daily_trends && data.daily_trends.length > 0 && (
            <Card className="bg-white border-[#E8E1D8]">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="font-serif text-lg text-[#24211E]">
                    Acquisition &amp; Revenue Velocity
                  </CardTitle>
                  <CardDescription className="text-xs text-[#716B64]">
                    Daily financial volume ($) and order frequency over the {dateRange} horizon
                  </CardDescription>
                </div>
                <BarChart3 className="w-5 h-5 text-[#B08D57]" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-44 pt-6 overflow-x-auto pb-2">
                  {data.daily_trends.map((day, idx) => {
                    const heightPct = Math.max(10, Math.round((day.revenue / maxDailyRevenue) * 100));
                    return (
                      <div
                        key={day.date || idx}
                        className="flex-1 min-w-[32px] max-w-[54px] flex flex-col items-center gap-1.5 group relative"
                      >
                        {/* Interactive Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#24211E] text-white text-[10px] px-2.5 py-1.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                          <p className="font-semibold text-[#B08D57]">{day.date}</p>
                          <p>${day.revenue.toLocaleString()} revenue</p>
                          <p className="text-[#A8A29A]">{day.orders_count} customer orders</p>
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full transition-all duration-300 rounded-t-xs ${
                            day.revenue > 0
                              ? "bg-[#B08D57] group-hover:bg-[#8E6D38] shadow-xs"
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

          {/* Matrix Row: Catalogue Health vs Inventory Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Catalogue Distribution */}
            <Card className="bg-white border-[#E8E1D8]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base text-[#24211E]">
                  Catalogue Lifecycle Status
                </CardTitle>
                <CardDescription className="text-xs text-[#716B64]">
                  Distribution of piece publication and storefront exposure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#716B64]">Published on Storefront:</span>
                    <strong className="text-emerald-800 font-mono">{cat?.published_products ?? 0} pieces</strong>
                  </div>
                  <div className="w-full bg-[#FAF8F4] border border-[#E8E1D8] h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{
                        width: `${cat?.total_products ? ((cat.published_products / cat.total_products) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#716B64]">Draft In Atelier:</span>
                    <strong className="text-[#716B64] font-mono">{cat?.draft_products ?? 0} pieces</strong>
                  </div>
                  <div className="w-full bg-[#FAF8F4] border border-[#E8E1D8] h-2 overflow-hidden">
                    <div
                      className="bg-[#B08D57] h-full"
                      style={{
                        width: `${cat?.total_products ? ((cat.draft_products / cat.total_products) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#716B64]">Active Storefront Visibility:</span>
                    <strong className="text-[#24211E] font-mono">{cat?.active_products ?? 0} active ({cat?.inactive_products ?? 0} hidden)</strong>
                  </div>
                  <div className="w-full bg-[#FAF8F4] border border-[#E8E1D8] h-2 overflow-hidden">
                    <div
                      className="bg-[#24211E] h-full"
                      style={{
                        width: `${cat?.total_products ? ((cat.active_products / cat.total_products) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vault Inventory Breakdown */}
            <Card className="bg-white border-[#E8E1D8]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base text-[#24211E]">
                  Vault Inventory Health Ratio
                </CardTitle>
                <CardDescription className="text-xs text-[#716B64]">
                  Physical units standing against reorder thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#716B64]">Well Stocked (&gt; safety threshold):</span>
                    <strong className="text-emerald-800 font-mono">
                      {Math.max(0, (cat?.total_products || 0) - (inv?.low_stock_count || 0) - (inv?.out_of_stock_count || 0))} pieces
                    </strong>
                  </div>
                  <div className="w-full bg-[#FAF8F4] border border-[#E8E1D8] h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{
                        width: `${cat?.total_products ? (Math.max(0, (cat.total_products - (inv?.low_stock_count || 0) - (inv?.out_of_stock_count || 0))) / cat.total_products) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#716B64]">Low Stock Replenishment Warning:</span>
                    <strong className="text-amber-800 font-mono">{inv?.low_stock_count ?? 0} pieces</strong>
                  </div>
                  <div className="w-full bg-[#FAF8F4] border border-[#E8E1D8] h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full"
                      style={{
                        width: `${cat?.total_products ? ((inv?.low_stock_count || 0) / cat.total_products) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#716B64]">Completely Depleted (0 units):</span>
                    <strong className="text-red-700 font-mono">{inv?.out_of_stock_count ?? 0} pieces</strong>
                  </div>
                  <div className="w-full bg-[#FAF8F4] border border-[#E8E1D8] h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full"
                      style={{
                        width: `${cat?.total_products ? ((inv?.out_of_stock_count || 0) / cat.total_products) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
