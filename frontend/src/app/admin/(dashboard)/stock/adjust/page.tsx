"use client";

import * as React from "react";
import { AdjustStockPage } from "@/features/stock";
import { LoadingSpinner } from "@/components/ui/loading";

export default function AdminStockAdjustPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-16 text-center">
          <LoadingSpinner className="py-8" />
          <p className="text-xs text-[#716B64] mt-2">Loading stock adjustment terminal...</p>
        </div>
      }
    >
      <AdjustStockPage />
    </React.Suspense>
  );
}
