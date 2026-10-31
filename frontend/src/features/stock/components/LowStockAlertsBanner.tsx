"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LowStockItemAlert } from "../types/stock.types";

interface LowStockAlertsBannerProps {
  alerts: LowStockItemAlert[];
  onFilterLowStock?: () => void;
}

export function LowStockAlertsBanner({
  alerts,
  onFilterLowStock,
}: LowStockAlertsBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  const depletedCount = alerts.filter((a) => a.stock_quantity <= 0).length;
  const criticalCount = alerts.length;

  return (
    <div className="p-4 bg-amber-50/80 border border-amber-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-xs text-amber-700 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900">
              Vault Stock Attention Required
            </h4>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 text-amber-800">
              {criticalCount} piece{criticalCount > 1 ? "s" : ""} below minimum threshold
            </span>
            {depletedCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
                {depletedCount} depleted
              </span>
            )}
          </div>
          <p className="text-xs text-amber-800">
            Replenishment needed for:{" "}
            {alerts.slice(0, 3).map((item, idx) => (
              <span key={item.product_id}>
                <strong className="text-amber-950 font-medium">{item.title}</strong> (
                {item.stock_quantity === 0 ? "Depleted" : `${item.stock_quantity} left`},{" "}
                <span className="font-semibold text-red-600">-{item.shortage || Math.max(1, item.low_stock_threshold - item.stock_quantity)} shortage</span>)
                {idx < Math.min(alerts.length, 3) - 1 ? ", " : ""}
              </span>
            ))}
            {alerts.length > 3 && (
              <span className="text-amber-700 italic"> and {alerts.length - 3} more pieces</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        <Link href="/admin/stock/alerts">
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs gap-1.5 h-8"
          >
            <span>View Alerts Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Link href="/admin/stock/adjust">
          <Button
            size="sm"
            className="bg-amber-800 hover:bg-amber-900 text-white text-xs gap-1.5 h-8 shadow-xs"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Restock Vault</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
