"use client";

import * as React from "react";
import Image from "next/image";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Gem,
  Mail,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order } from "../types/order.types";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const isPaid = order.payment_status.toLowerCase() === "paid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#E8E1D8] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E1D8] bg-[#FAF8F4]">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-[#B08D57]" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base text-[#24211E] font-medium">
                  Order {order.order_number}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase tracking-wider ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {order.payment_status}
                </Badge>
              </div>
              <p className="text-[11px] text-[#716B64]">
                Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer & Shipping Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 bg-[#FAF8F4] border border-[#E8E1D8] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#716B64]">
                <User className="w-3.5 h-3.5 text-[#B08D57]" />
                Customer Identity
              </div>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-sm text-[#24211E]">{order.customer_name}</p>
                <p className="text-[#716B64] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#9E988F]" />
                  {order.customer_email}
                </p>
                {order.customer_phone && (
                  <p className="text-[#716B64] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#9E988F]" />
                    {order.customer_phone}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping & Settlement */}
            <div className="p-4 bg-[#FAF8F4] border border-[#E8E1D8] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#716B64]">
                <MapPin className="w-3.5 h-3.5 text-[#B08D57]" />
                Delivery Destination & Payment
              </div>
              <div className="text-xs space-y-1">
                <p className="text-[#24211E] leading-relaxed">{order.shipping_address}</p>
                <div className="pt-1 flex items-center gap-2 text-[11px] text-[#716B64]">
                  <CreditCard className="w-3.5 h-3.5 text-[#9E988F]" />
                  <span>Method: <strong className="text-[#24211E]">{order.payment_method}</strong></span>
                </div>
                {order.payment_reference && (
                  <p className="text-[10px] font-mono text-[#9E988F]">
                    Tx Ref: {order.payment_reference}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#716B64] mb-2.5">
              Acquired Masterpieces ({order.items?.length || 0})
            </h4>
            <div className="border border-[#E8E1D8] divide-y divide-[#E8E1D8] overflow-hidden">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 bg-white hover:bg-[#FAF8F4] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FAF8F4] border border-[#E8E1D8] relative rounded overflow-hidden flex items-center justify-center shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#B08D57]" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-serif text-xs font-semibold text-[#24211E]">
                        {item.product_title}
                      </h5>
                      <p className="text-[10px] font-mono text-[#716B64] mt-0.5">
                        SKU: {item.product_sku}
                      </p>
                      <p className="text-[10px] text-[#716B64]">
                        ${Number(item.unit_price).toLocaleString("en-US", { minimumFractionDigits: 2 })} &times; {item.quantity} unit{item.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-semibold text-xs text-[#24211E] font-mono">
                      ${Number(item.total_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-[#E8E1D8] pt-4 flex flex-col items-end space-y-1.5 text-xs">
            <div className="flex justify-between w-60 text-[#716B64]">
              <span>Subtotal:</span>
              <span className="font-mono text-[#24211E]">
                ${Number(order.subtotal || order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between w-60 text-emerald-700">
                <span>Promotional Saving:</span>
                <span className="font-mono">
                  -${Number(order.discount_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between w-60 text-[#716B64]">
              <span>Vault Insurance &amp; Courier:</span>
              <span className="text-emerald-700 font-medium">Complimentary</span>
            </div>
            <div className="flex justify-between w-60 pt-2 border-t border-[#E8E1D8] text-sm font-semibold text-[#24211E]">
              <span>Total Settled:</span>
              <span className="font-mono text-base text-[#B08D57]">
                ${Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Notes provenance */}
          {order.notes && (
            <div className="p-3 bg-[#FAF8F4] border border-[#E8E1D8] text-xs">
              <span className="font-semibold text-[#716B64] uppercase text-[10px] tracking-wider block mb-1">
                Customer Instructions:
              </span>
              <p className="text-[#24211E] italic">“{order.notes}”</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8E1D8] bg-[#FAF8F4] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Order
          </Button>
        </div>
      </div>
    </div>
  );
}
