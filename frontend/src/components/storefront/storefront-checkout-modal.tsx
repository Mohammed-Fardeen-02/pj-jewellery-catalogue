"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Banknote,
  Building,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ordersApi } from "@/features/orders/api/orders.api";
import { useCart, type CartItem } from "@/context/cart-context";
import type { Order } from "@/types";

interface StorefrontCheckoutModalProps {
  directItem?: CartItem | null;
  isOpenOverride?: boolean;
  onCloseOverride?: () => void;
  onOrderSuccess?: (order: Order) => void;
}

export function StorefrontCheckoutModal({
  directItem,
  isOpenOverride,
  onCloseOverride,
  onOrderSuccess,
}: StorefrontCheckoutModalProps) {
  const {
    items: cartItems,
    clearCart,
    isCheckoutOpen,
    closeCheckout,
  } = useCart();

  const isOpen = isOpenOverride !== undefined ? isOpenOverride : isCheckoutOpen;
  const handleClose = onCloseOverride || closeCheckout;

  // Checkout items: either direct piece passed in or all items in shopping cart
  const checkoutItems: CartItem[] = directItem
    ? [directItem]
    : cartItems;

  // Form Fields
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [streetAddress, setStreetAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [stateRegion, setStateRegion] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [country, setCountry] = React.useState("United States");
  const [paymentMethod, setPaymentMethod] = React.useState<"online_card" | "cod" | "wire_transfer">("online_card");
  const [notes, setNotes] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = React.useState<Order | null>(null);

  if (!isOpen) return null;

  const totalAmount = checkoutItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !streetAddress.trim() || !city.trim() || !postalCode.trim()) {
      setError("Please fill in all mandatory delivery details (Name, Email, Street, City, Postal Code).");
      return;
    }

    if (checkoutItems.length === 0) {
      setError("Your shopping selection contains no pieces.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const fullShippingAddress = `${streetAddress.trim()}, ${city.trim()}${
      stateRegion.trim() ? `, ${stateRegion.trim()}` : ""
    } ${postalCode.trim()}, ${country.trim()}`;

    try {
      const order = await ordersApi.createStorefrontOrder({
        customer_name: fullName.trim(),
        customer_email: email.trim().toLowerCase(),
        customer_phone: phone.trim() || undefined,
        shipping_address: fullShippingAddress,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        items: checkoutItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });

      setConfirmedOrder(order);
      if (!directItem) {
        clearCart();
      }
      if (onOrderSuccess) {
        onOrderSuccess(order);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while placing your order. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setConfirmedOrder(null);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#E8E1D8] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E1D8] bg-[#FAF8F4]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#B08D57]" />
            <div>
              <h3 className="font-serif text-lg font-medium text-[#24211E]">
                {confirmedOrder ? "Acquisition Confirmed" : "Private Vault Checkout"}
              </h3>
              <p className="text-[11px] text-[#716B64]">
                Atelier PJ Secure Acquisition &middot; Insured Global Transit
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#716B64] hover:text-[#24211E] transition-colors p-1.5"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          /* Confirmation State */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-widest text-[#B08D57] font-semibold">
                Order Ref: {confirmedOrder.order_number}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#24211E]">
                Thank you, {confirmedOrder.customer_name}
              </h2>
              <p className="text-xs text-[#716B64] max-w-md mx-auto leading-relaxed">
                Your order has been registered and vaulted pieces reserved. Confirmation and tracking updates will be dispatched to{" "}
                <strong className="text-[#24211E]">{confirmedOrder.customer_email}</strong>.
              </p>
            </div>

            {/* Order Summary Receipt Box */}
            <div className="p-4 bg-[#FAF8F4] border border-[#E8E1D8] text-left text-xs space-y-3 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D8]">
                <span className="text-[#716B64]">Payment Status:</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase font-semibold ${
                    confirmedOrder.payment_status === "paid"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {confirmedOrder.payment_status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#716B64]">Settlement Method:</span>
                <span className="font-medium text-[#24211E] capitalize">
                  {confirmedOrder.payment_method.replace(/_/g, " ")}
                </span>
              </div>

              {confirmedOrder.payment_reference && (
                <div className="flex items-center justify-between">
                  <span className="text-[#716B64]">Transaction Ref:</span>
                  <span className="font-mono text-[#24211E]">{confirmedOrder.payment_reference}</span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <span className="text-[#716B64]">Delivery Destination:</span>
                <span className="text-[#24211E] text-right max-w-xs font-medium">
                  {confirmedOrder.shipping_address}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E8E1D8] text-sm font-semibold">
                <span>Total Amount:</span>
                <span className="font-mono text-[#B08D57]">
                  ${Number(confirmedOrder.total_amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Pieces Recap */}
            <div className="text-left border border-[#E8E1D8] divide-y divide-[#E8E1D8] overflow-hidden">
              {confirmedOrder.items?.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between bg-white text-xs">
                  <div>
                    <p className="font-serif font-medium text-[#24211E]">{item.product_title}</p>
                    <p className="text-[10px] font-mono text-[#716B64]">SKU: {item.product_sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[#24211E]">
                      {item.quantity} &times; ${Number(item.unit_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="font-mono font-semibold text-[#B08D57]">
                      ${Number(item.total_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleDismiss} className="w-full">
              Complete &amp; Return to Boutique
            </Button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {error}
              </div>
            )}

            {/* Order Items Preview */}
            <div className="border border-[#E8E1D8] bg-[#FAF8F4] p-3 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#716B64] font-semibold block">
                Acquisition Pieces ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)} units)
              </span>
              <div className="max-h-36 overflow-y-auto divide-y divide-[#E8E1D8]">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-9 h-9 bg-white border border-[#E8E1D8] overflow-hidden shrink-0">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-[#B08D57] m-auto" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-medium text-[#24211E] truncate">{item.title}</p>
                        <p className="text-[10px] text-[#716B64] font-mono">
                          Qty: {item.quantity} &middot; SKU: {item.sku}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-[#24211E] shrink-0">
                      ${(Number(item.price || 0) * item.quantity).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 pb-1 border-b border-[#E8E1D8] text-xs font-semibold uppercase tracking-wider text-[#24211E]">
                <User className="w-3.5 h-3.5 text-[#B08D57]" />
                Customer Identity
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24211E] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Lady Vivienne Sterling"
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24211E] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. vivienne@sterling.example"
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24211E] mb-1">
                  Telephone Contact (for courier delivery dispatch)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
                />
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 pb-1 border-b border-[#E8E1D8] text-xs font-semibold uppercase tracking-wider text-[#24211E]">
                <MapPin className="w-3.5 h-3.5 text-[#B08D57]" />
                Insured Delivery Address
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24211E] mb-1">
                  Street Address &amp; Suite / Apartment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#24211E] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24211E] mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="NY"
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24211E] mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10001"
                    className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24211E] mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
                />
              </div>
            </div>

            {/* Payment Method / Settlement Channel */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 pb-1 border-b border-[#E8E1D8] text-xs font-semibold uppercase tracking-wider text-[#24211E]">
                <CreditCard className="w-3.5 h-3.5 text-[#B08D57]" />
                Settlement Channel
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`p-3 border rounded-xs cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === "online_card"
                      ? "border-[#B08D57] bg-[#FAF8F4] ring-1 ring-[#B08D57]"
                      : "border-[#E8E1D8] bg-white hover:border-[#B08D57]/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === "online_card"}
                      onChange={() => setPaymentMethod("online_card")}
                      className="text-[#B08D57] focus:ring-[#B08D57]"
                    />
                    <CreditCard className="w-4 h-4 text-[#B08D57]" />
                    <span className="text-xs font-semibold text-[#24211E]">Online Card</span>
                  </div>
                  <span className="text-[10px] text-[#716B64] mt-2 block">
                    Instant vault clearance &amp; dispatch
                  </span>
                </label>

                <label
                  className={`p-3 border rounded-xs cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === "cod"
                      ? "border-[#B08D57] bg-[#FAF8F4] ring-1 ring-[#B08D57]"
                      : "border-[#E8E1D8] bg-white hover:border-[#B08D57]/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="text-[#B08D57] focus:ring-[#B08D57]"
                    />
                    <Banknote className="w-4 h-4 text-[#B08D57]" />
                    <span className="text-xs font-semibold text-[#24211E]">Cash on Delivery</span>
                  </div>
                  <span className="text-[10px] text-[#716B64] mt-2 block">
                    Pay upon hand courier delivery
                  </span>
                </label>

                <label
                  className={`p-3 border rounded-xs cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === "wire_transfer"
                      ? "border-[#B08D57] bg-[#FAF8F4] ring-1 ring-[#B08D57]"
                      : "border-[#E8E1D8] bg-white hover:border-[#B08D57]/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === "wire_transfer"}
                      onChange={() => setPaymentMethod("wire_transfer")}
                      className="text-[#B08D57] focus:ring-[#B08D57]"
                    />
                    <Building className="w-4 h-4 text-[#B08D57]" />
                    <span className="text-xs font-semibold text-[#24211E]">Bank Wire</span>
                  </div>
                  <span className="text-[10px] text-[#716B64] mt-2 block">
                    Atelier treasury wire instructions
                  </span>
                </label>
              </div>
            </div>

            {/* Bespoke Instructions */}
            <div>
              <label className="block text-xs font-medium text-[#24211E] mb-1">
                Bespoke Notes / Engraving Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please engrave initials 'PJ &hearts; 2026' on inner shank"
                className="w-full px-3 py-2 text-xs border border-[#D4C9BA] bg-white text-[#24211E] focus:outline-none focus:border-[#B08D57]"
              />
            </div>

            {/* Total Strip & Authorize */}
            <div className="pt-4 border-t border-[#E8E1D8] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#716B64] block">Final Settlement</span>
                <span className="font-serif text-2xl font-medium text-[#24211E]">
                  ${totalAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="gap-2 text-xs tracking-widest uppercase font-semibold px-6 py-5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Securing Vault...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#B08D57]" />
                    Authorize Order
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
