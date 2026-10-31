"use client";

import * as React from "react";
import { Boxes, Loader2, PackageMinus, PackagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth";
import { stockApi } from "../api/stock.api";
import type { StockAdjustableItem, StockTransactionType } from "../types/stock.types";

interface StockAdjustmentModalProps {
  product: StockAdjustableItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockAdjustmentModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [type, setType] = React.useState<StockTransactionType>("stock_in");
  const [quantity, setQuantity] = React.useState<string>("1");
  const [reason, setReason] = React.useState<string>("Supplier Inward Delivery");
  const [referenceId, setReferenceId] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen || !product) return null;

  const currentStock = Number(product.stock_quantity ?? 0);
  const inputQty = parseInt(quantity, 10) || 0;
  const projectedBalance =
    type === "stock_in" ? currentStock + inputQty : Math.max(0, currentStock - inputQty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQty <= 0) {
      setError("Adjustment quantity must be at least 1 unit.");
      return;
    }
    if (type === "stock_out" && inputQty > currentStock) {
      setError(`Cannot stock out ${inputQty} units; only ${currentStock} available in vault.`);
      return;
    }
    if (!reason.trim()) {
      setError("Please specify a reason for this inventory movement.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await stockApi.adjustStock(
        product.id,
        {
          transaction_type: type,
          quantity: inputQty,
          reason: reason.trim(),
          reference_id: referenceId.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        token
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Stock adjustment failed:", err);
      setError(err?.message || "Failed to record stock adjustment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#E8E1D8] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E1D8] bg-[#FAF8F4]">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-serif text-base text-[#24211E]">Vault Stock Adjustment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#716B64] hover:text-[#24211E] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Piece Identity */}
          <div className="p-3 bg-[#FAF8F4] border border-[#E8E1D8] space-y-1">
            <p className="text-xs font-semibold text-[#24211E] truncate">{product.title}</p>
            <div className="flex items-center justify-between text-[11px] text-[#716B64]">
              <span className="font-mono">SKU: {product.sku}</span>
              <span>
                Current Vault Balance:{" "}
                <strong className="text-[#24211E] font-mono">{currentStock}</strong> units
              </span>
            </div>
          </div>

          {/* Adjustment Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#716B64] mb-2">
              Transaction Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("stock_in");
                  setReason("Supplier Inward Delivery");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 border text-xs font-semibold uppercase tracking-wider transition-all ${
                  type === "stock_in"
                    ? "bg-[#24211E] text-white border-[#24211E] shadow-xs"
                    : "bg-white text-[#716B64] border-[#E8E1D8] hover:bg-[#FAF8F4]"
                }`}
              >
                <PackagePlus className="w-4 h-4 text-emerald-500" />
                Stock In (+)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("stock_out");
                  setReason("Boutique Exhibition Loan");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 border text-xs font-semibold uppercase tracking-wider transition-all ${
                  type === "stock_out"
                    ? "bg-[#24211E] text-white border-[#24211E] shadow-xs"
                    : "bg-white text-[#716B64] border-[#E8E1D8] hover:bg-[#FAF8F4]"
                }`}
              >
                <PackageMinus className="w-4 h-4 text-amber-500" />
                Stock Out (-)
              </button>
            </div>
          </div>

          {/* Quantity & Balance Projection */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Units Quantity" required>
              <Input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="font-mono text-center font-bold"
              />
            </FormField>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#716B64] font-medium mb-1.5">
                New Projected Balance
              </label>
              <div
                className={`h-10 px-3 flex items-center justify-center border font-mono text-sm font-bold ${
                  type === "stock_in"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : projectedBalance <= 0
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {projectedBalance} units
              </div>
            </div>
          </div>

          {/* Reason Pre-sets / Custom */}
          <FormField label="Audit Reason / Event" required>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Master Atelier Restock, VIP Exhibition, Quality Audit"
            />
          </FormField>

          {/* Reference ID */}
          <FormField label="Reference / PO Number (Optional)">
            <Input
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. PO-2026-9041, RETURN-881"
            />
          </FormField>

          {/* Audit Notes */}
          <FormField label="Vault Keeper Notes (Optional)">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional ledger remarks for atelier provenance..."
              rows={2}
            />
          </FormField>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8E1D8]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                "Post Ledger Adjustment"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
