"use client";

import * as React from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/features/orders/api/orders.api";
import type { Order, Product, ProductPublicResponse } from "@/types";

interface InstantCheckoutModalProps {
  product: Product | ProductPublicResponse;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: (order: Order) => void;
}

export function InstantCheckoutModal({
  product,
  isOpen,
  onClose,
  onOrderSuccess,
}: InstantCheckoutModalProps) {
  const [quantity, setQuantity] = React.useState<number>(1);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("simulated_card");
  const [notes, setNotes] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = React.useState<Order | null>(null);

  if (!isOpen) return null;

  const price = Number(product.price || 0);
  const maxStock = Math.max(1, Number(product.stock_quantity || 1));
  const subtotal = price * quantity;

  const primaryImage =
    product.primary_image ||
    (product.images && product.images.length > 0
      ? product.images.find((img: any) => img.is_primary) || product.images[0]
      : null);
  const imageSrc =
    primaryImage?.image_url ||
    (primaryImage && "storage_path" in primaryImage ? (primaryImage as any).storage_path : null) ||
    "/images/hero-jewellery.svg";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !address.trim()) {
      setError("Please complete all required fields (Name, Email, Address).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const order = await ordersApi.createStorefrontOrder({
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim() || undefined,
        shipping_address: address.trim(),
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        items: [
          {
            product_id: product.id,
            quantity: quantity,
          },
        ],
      });

      setConfirmedOrder(order);
      if (onOrderSuccess) {
        onOrderSuccess(order);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to process acquisition order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-[#E8E1D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E1D8] bg-[#FAF8F4]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-serif text-lg text-[#24211E]">
              {confirmedOrder ? "Acquisition Confirmed" : "Private Vault Acquisition"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#716B64] hover:text-[#24211E] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-[#B08D57] font-semibold">
                Order Reference {confirmedOrder.order_number}
              </span>
              <h2 className="font-serif text-2xl text-[#24211E]">
                Payment Authorized &amp; Piece Secured
              </h2>
              <p className="text-sm text-[#716B64] max-w-md mx-auto">
                Thank you, {confirmedOrder.customer_name}. A certificate of authenticity and tracking
                receipt have been dispatched to{" "}
                <span className="font-semibold text-[#24211E]">
                  {confirmedOrder.customer_email}
                </span>
                .
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F4] border border-[#E8E1D8] text-left text-xs space-y-2 font-sans">
              <div className="flex justify-between">
                <span className="text-[#716B64]">Total Settled:</span>
                <span className="font-semibold text-[#24211E]">
                  ${Number(confirmedOrder.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716B64]">Payment Reference:</span>
                <span className="font-mono text-[#24211E]">{confirmedOrder.payment_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#716B64]">Delivery Destination:</span>
                <span className="text-[#24211E] truncate max-w-[280px]">
                  {confirmedOrder.shipping_address}
                </span>
              </div>
            </div>

            <Button onClick={onClose} className="w-full">
              Complete &amp; Return to Atelier
            </Button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
            {error && (
              <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
                {error}
              </div>
            )}

            {/* Product Summary Strip */}
            <div className="flex items-center gap-4 p-3 bg-[#FAF8F4] border border-[#E8E1D8]">
              <div className="relative w-16 h-16 bg-white border border-[#E8E1D8] overflow-hidden flex-shrink-0">
                <Image src={imageSrc} alt={product.title} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-sm text-[#24211E] truncate">{product.title}</h4>
                <p className="text-[11px] text-[#716B64] font-mono">SKU: {product.sku}</p>
                <p className="text-xs font-semibold text-[#B08D57] mt-0.5">
                  ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#716B64]">Qty:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-[#D4C9BA] bg-white px-2 py-1 text-xs text-[#24211E]"
                >
                  {Array.from({ length: Math.min(maxStock, 10) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h5 className="text-[11px] uppercase tracking-wider text-[#716B64] font-semibold border-b border-[#E8E1D8] pb-1">
                Recipient Information
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#24211E] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Lady Vivienne Montgomery"
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#24211E] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. vivienne@haute.example"
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#24211E] mb-1">Telephone Contact</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#24211E] mb-1">Settlement Channel</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white focus:outline-none focus:border-[#B08D57]"
                  >
                    <option value="simulated_card">Simulated Card (Instant Vault Release)</option>
                    <option value="wire_transfer">Atelier Wire Transfer</option>
                    <option value="direct_upi">Direct UPI / Instant Settlement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#24211E] mb-1">
                  Insured Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Suite, City, Postal Code, Country"
                  className="w-full px-3 py-2 text-xs border border-[#D4C9BA] focus:outline-none focus:border-[#B08D57] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#24211E] mb-1">Bespoke Engraving / Delivery Note</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Engrave 'Forever A&M', include gift seal"
                  className="w-full px-3 py-2 text-xs border border-[#D4C9BA] focus:outline-none focus:border-[#B08D57]"
                />
              </div>
            </div>

            {/* Total Strip */}
            <div className="pt-3 border-t border-[#E8E1D8] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#716B64] block">Total Acquisition Price</span>
                <span className="font-serif text-xl font-medium text-[#24211E]">
                  ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Securing Vault...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Authorize Acquisition
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
