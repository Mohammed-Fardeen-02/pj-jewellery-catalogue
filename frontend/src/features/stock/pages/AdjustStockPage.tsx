"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Loader2,
  PackageMinus,
  PackagePlus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSearchSelect } from "../components/ProductSearchSelect";
import { useStockAdjustments } from "../hooks/useStock";
import { productApi, type ProductResponse } from "@/features/products";
import { useAuth } from "@/features/auth";
import type { StockAdjustableItem, StockTransactionType } from "../types/stock.types";

const REASON_PRESETS: Record<StockTransactionType, Array<{ label: string; value: string }>> = {
  stock_in: [
    { label: "Supplier Inward Delivery", value: "Supplier Inward Delivery" },
    { label: "Master Atelier Restock", value: "Master Atelier Restock" },
    { label: "Opening Inventory Verification", value: "Opening Inventory Verification" },
    { label: "Client Return to Vault", value: "Client Return to Vault" },
    { label: "Exhibition Return", value: "Exhibition Return" },
  ],
  stock_out: [
    { label: "Boutique Exhibition Loan", value: "Boutique Exhibition Loan" },
    { label: "Private Client Viewing", value: "Private Client Viewing" },
    { label: "Gemological Testing / Assay", value: "Gemological Testing / Assay" },
    { label: "Craftsmanship Defect / Scrapping", value: "Craftsmanship Defect / Scrapping" },
    { label: "Vault Audit Discrepancy", value: "Vault Audit Discrepancy" },
  ],
  adjustment: [
    { label: "Quarterly Physical Audit Calibration", value: "Quarterly Physical Audit Calibration" },
    { label: "Inventory Reconciliation", value: "Inventory Reconciliation" },
    { label: "Initial Stock Count Setup", value: "Initial Stock Count Setup" },
  ],
};

export function AdjustStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("product_id");

  const { tokens } = useAuth();
  const token = tokens?.access_token;
  const { executeAdjustment, submitting, error, setError } = useStockAdjustments();

  const [products, setProducts] = React.useState<StockAdjustableItem[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<StockAdjustableItem | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Form Fields
  const [type, setType] = React.useState<StockTransactionType>("stock_in");
  const [quantity, setQuantity] = React.useState<string>("1");
  const [reason, setReason] = React.useState<string>("Supplier Inward Delivery");
  const [customReason, setCustomReason] = React.useState<string>("");
  const [referenceId, setReferenceId] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");

  // Load all products for the searchable dropdown
  React.useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true);
      try {
        const res = await productApi.listAdmin(token || undefined, { limit: 100 });
        const items = res.items || [];
        setProducts(items);

        // Pre-select if product_id is in query param
        if (preselectedId) {
          const match = items.find((p) => p.id === preselectedId);
          if (match) setSelectedProduct(match);
        }
      } catch (err) {
        console.error("Failed to load products for stock adjustment:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, [token, preselectedId]);

  // Handle transaction mode change
  const handleTypeChange = (newType: StockTransactionType) => {
    setType(newType);
    setReason(REASON_PRESETS[newType][0].value);
    setCustomReason("");
  };

  // Calculations
  const currentStock = Number(selectedProduct?.stock_quantity ?? 0);
  const inputQty = parseInt(quantity, 10) || 0;
  const projectedBalance =
    type === "stock_in"
      ? currentStock + inputQty
      : type === "stock_out"
      ? Math.max(0, currentStock - inputQty)
      : inputQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError("Please search and select a jewellery piece first.");
      return;
    }
    if (inputQty <= 0) {
      setError("Adjustment quantity must be greater than 0 units.");
      return;
    }
    if (type === "stock_out" && inputQty > currentStock) {
      setError(`Cannot stock out ${inputQty} units; only ${currentStock} units available in vault.`);
      return;
    }

    const effectiveReason = customReason.trim() || reason.trim();
    if (!effectiveReason) {
      setError("Please specify a reason or audit event.");
      return;
    }

    const result = await executeAdjustment(selectedProduct.id, {
      transaction_type: type,
      quantity: inputQty,
      reason: effectiveReason,
      reference_id: referenceId.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (result) {
      setSuccessMessage(
        `Successfully posted adjustment! Vault balance for "${selectedProduct.title}" is now ${result.new_stock} units.`
      );
      setTimeout(() => {
        router.push("/admin/stock");
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Return Link */}
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
        title="Post Vault Stock Adjustment"
        subtitle="Search a fine jewellery piece, record stock movements (Stock In / Stock Out / Calibration), and automatically update real-time vault balances."
      />

      {successMessage ? (
        <Card className="bg-emerald-50 border-emerald-200 p-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-serif text-lg text-emerald-900 font-medium">
            Vault Ledger Updated
          </h3>
          <p className="text-sm text-emerald-800">{successMessage}</p>
          <div className="pt-2">
            <Link href="/admin/stock">
              <Button size="sm" className="bg-emerald-800 hover:bg-emerald-900 text-white">
                Return to Vault Inventory &rarr;
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white border-[#E8E1D8] shadow-xs">
            <CardHeader className="pb-4 border-b border-[#E8E1D8] bg-[#FAF8F4]">
              <CardTitle className="font-serif text-base text-[#24211E] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#B08D57]" />
                Stock Adjustment Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Product Search & Dropdown */}
              <ProductSearchSelect
                products={products}
                selectedProduct={selectedProduct}
                onSelect={(p) => {
                  setSelectedProduct(p);
                  setError(null);
                }}
                isLoading={isLoadingProducts}
              />

              {/* Transaction Mode Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#716B64] mb-2">
                  Transaction Movement Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("stock_in")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 border text-xs font-semibold uppercase tracking-wider transition-all ${
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
                    onClick={() => handleTypeChange("stock_out")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 border text-xs font-semibold uppercase tracking-wider transition-all ${
                      type === "stock_out"
                        ? "bg-[#24211E] text-white border-[#24211E] shadow-xs"
                        : "bg-white text-[#716B64] border-[#E8E1D8] hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <PackageMinus className="w-4 h-4 text-amber-500" />
                    Stock Out (-)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange("adjustment")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 border text-xs font-semibold uppercase tracking-wider transition-all ${
                      type === "adjustment"
                        ? "bg-[#24211E] text-white border-[#24211E] shadow-xs"
                        : "bg-white text-[#716B64] border-[#E8E1D8] hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 text-[#B08D57]" />
                    Set Balance (=)
                  </button>
                </div>
              </div>

              {/* Quantity & Projected Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Adjustment Units Quantity" required>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                    className="font-mono text-center font-bold text-base h-11"
                  />
                </FormField>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#716B64] font-medium mb-1.5">
                    Projected Vault Standing
                  </label>
                  <div
                    className={`h-11 px-4 flex items-center justify-between border font-mono text-sm font-bold ${
                      type === "stock_in"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : projectedBalance <= 0
                        ? "bg-red-50 text-red-800 border-red-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    <span className="text-xs font-sans font-normal opacity-80">
                      {currentStock} units &rarr;
                    </span>
                    <span>{projectedBalance} units</span>
                  </div>
                </div>
              </div>

              {/* Reason Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#716B64]">
                  Movement Reason / Audit Event <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REASON_PRESETS[type].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        setReason(preset.value);
                        setCustomReason("");
                      }}
                      className={`text-left p-2.5 text-xs border transition-all ${
                        reason === preset.value && !customReason
                          ? "bg-[#24211E] text-white border-[#24211E] font-medium"
                          : "bg-[#FAF8F4] text-[#716B64] border-[#E8E1D8] hover:bg-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <Input
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Or enter custom audit rationale (e.g. VIP Exhibition Paris, Quality Re-evaluation)..."
                    className="text-xs h-10"
                  />
                </div>
              </div>

              {/* Reference ID & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="PO / Reference ID (Optional)">
                  <Input
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="e.g. PO-2026-8819, BATCH-X"
                    className="h-10 text-xs font-mono"
                  />
                </FormField>

                <FormField label="Vault Keeper Provenance Notes (Optional)">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional remarks recorded into chronological audit log..."
                    rows={2}
                    className="text-xs"
                  />
                </FormField>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/stock">
              <Button type="button" variant="outline" size="sm" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !selectedProduct}
              className="gap-2 bg-[#24211E] text-white hover:bg-black h-10 px-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#B08D57]" />
                  Posting Ledger Movement...
                </>
              ) : (
                "Post Vault Stock Adjustment"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
