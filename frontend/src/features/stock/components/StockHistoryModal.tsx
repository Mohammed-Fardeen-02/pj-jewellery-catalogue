"use client";

import * as React from "react";
import { History, Loader2, PackageMinus, PackagePlus, ShoppingBag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { stockApi } from "../api/stock.api";
import type { StockTransactionResponse } from "../types/stock.types";

interface StockHistoryModalProps {
  product: { id: string; title: string; sku: string; stock_quantity: number } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockHistoryModal({ product, isOpen, onClose }: StockHistoryModalProps) {
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [history, setHistory] = React.useState<StockTransactionResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !product) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    stockApi
      .getStockHistory(product.id, 100, token)
      .then((data) => {
        if (isMounted) setHistory(data);
      })
      .catch((err: any) => {
        if (isMounted) {
          console.error("Failed to load stock audit history:", err);
          setError(err?.message || "Failed to load stock audit trail.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, product, token]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#E8E1D8] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E1D8] bg-[#FAF8F4]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#B08D57]" />
            <div>
              <h3 className="font-serif text-base text-[#24211E]">Inventory Audit Ledger</h3>
              <p className="text-[11px] text-[#716B64]">
                Provenance tracking: <span className="font-medium text-[#24211E]">{product.title}</span>{" "}
                (<span className="font-mono">{product.sku}</span>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#716B64] hover:text-[#24211E] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="px-6 py-2.5 bg-[#F7F4EF] border-b border-[#E8E1D8] flex items-center justify-between text-xs">
          <span className="text-[#716B64]">Current Vault Standing:</span>
          <span className="font-mono font-bold text-[#24211E]">
            {product.stock_quantity} units available
          </span>
        </div>

        {/* Content Table / Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#716B64]">
              <Loader2 className="w-6 h-6 animate-spin text-[#B08D57] mx-auto mb-2" />
              Retrieving ledger records from vault database...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#716B64]">
              No inventory transactions recorded yet for this piece.
            </div>
          ) : (
            <div className="divide-y divide-[#E8E1D8] border border-[#E8E1D8]">
              {history.map((tx) => {
                const isStockIn = tx.transaction_type === "stock_in";
                const isOrder = tx.reason.toLowerCase().includes("order");
                return (
                  <div key={tx.id} className="p-3.5 hover:bg-[#FAF8F4] transition-colors text-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              isStockIn
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : isOrder
                                ? "bg-purple-50 text-purple-800 border border-purple-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isStockIn ? (
                              <PackagePlus className="w-3 h-3 text-emerald-600" />
                            ) : isOrder ? (
                              <ShoppingBag className="w-3 h-3 text-purple-600" />
                            ) : (
                              <PackageMinus className="w-3 h-3 text-amber-600" />
                            )}
                            {isStockIn ? "Stock In" : isOrder ? "Customer Acquisition" : "Stock Out"}
                          </span>

                          <span className="font-semibold text-[#24211E]">{tx.reason}</span>
                        </div>

                        {tx.notes && (
                          <p className="text-[11px] text-[#716B64] italic">“{tx.notes}”</p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-[#9E988F]">
                          <span>{new Date(tx.created_at).toLocaleString()}</span>
                          {tx.reference_id && (
                            <span>Ref: <strong className="font-mono text-[#716B64]">{tx.reference_id}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-sm font-bold">
                          {isStockIn ? (
                            <span className="text-emerald-700">+{tx.quantity}</span>
                          ) : (
                            <span className="text-amber-800">-{tx.quantity}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#716B64] font-mono mt-0.5">
                          {tx.previous_stock} &rarr; <strong className="text-[#24211E]">{tx.new_stock}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8E1D8] bg-[#FAF8F4] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Ledger
          </Button>
        </div>
      </div>
    </div>
  );
}
