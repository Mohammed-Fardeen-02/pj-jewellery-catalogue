"use client";

import * as React from "react";
import {
  Printer,
  X,
  Package,
  ShieldCheck,
  Truck,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  User,
  AlertTriangle,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "@/lib/utils/qrcode";
import type { Order } from "../types/order.types";

interface OrderShippingLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderShippingLabelModal({
  order,
  isOpen,
  onClose,
}: OrderShippingLabelModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const trackingNumber = `TRK-PJ-${order.order_number.replace(/[^a-zA-Z0-9]/g, "")}`;
  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/orders?track=${order.order_number}`
    : `https://pjjewellery.com/track/${order.order_number}`;

  const totalPieces = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      {/* Outer wrapper: only the label container inside will be preserved in print */}
      <div className="relative w-full max-w-2xl bg-white border border-[#E8E1D8] shadow-2xl flex flex-col my-auto overflow-hidden">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-[#FAF8F4] border-b border-[#E8E1D8]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#B08D57]" />
            <span className="font-serif text-sm font-semibold text-[#24211E]">
              Print Shipping &amp; Vault Dispatch Label
            </span>
            <span className="text-[10px] font-mono text-[#716B64] bg-white px-2 py-0.5 border border-[#E8E1D8]">
              {order.order_number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 h-8 bg-[#24211E] text-white hover:bg-[#B08D57]"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Label (4&times;6&quot;)
            </Button>
            <button
              onClick={onClose}
              className="text-[#716B64] hover:text-[#24211E] p-1.5 transition-colors"
              aria-label="Close shipping label modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===============================================================
            SHIPPING LABEL BODY (4x6 Aspect Ratio / Standard Parcel Label)
            =============================================================== */}
        <div className="p-6 bg-[#FAF8F4] overflow-y-auto max-h-[calc(90vh-60px)]">
          <div
            id="printable-shipping-label"
            className="w-full max-w-[500px] mx-auto bg-white border-2 border-[#1A1816] text-[#1A1816] font-sans shadow-sm print:border-2 print:border-black print:max-w-none print:w-full print:shadow-none"
          >
            {/* Header: Carrier Tier & Fragile Fine Jewellery Notice */}
            <div className="border-b-2 border-[#1A1816] p-3 bg-[#FAF8F4]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#1A1816] text-[#B08D57] flex items-center justify-center font-serif font-bold text-sm">
                    PJ
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-bold tracking-wider text-[#1A1816] leading-none">
                      PJ ATELIER PRIVÉ
                    </h2>
                    <p className="text-[9px] uppercase tracking-widest text-[#716B64] font-mono mt-0.5">
                      Haute Joaillerie &bull; Armored Vault Dispatch
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-[#1A1816] text-white text-[10px] font-mono font-bold px-2 py-0.5 tracking-wider">
                    PRIORITY ARMORED
                  </span>
                  <p className="text-[9px] text-[#716B64] font-mono mt-0.5">ZONE-1 EXPRESS</p>
                </div>
              </div>
            </div>

            {/* Sub-Header Bar: Courier Routing & Insurance Notice */}
            <div className="border-b border-[#1A1816] bg-[#1A1816] text-white px-3 py-1 flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#C5A265]" />
                TAMPER-EVIDENT VAULT SEAL
              </span>
              <span className="text-[#E8D5B5]">INSURED VALUE PARCEL</span>
            </div>

            {/* Sender / Return Address (SHIP FROM) */}
            <div className="border-b border-[#1A1816] p-2.5 text-[10px] bg-[#FAF8F4]/40 flex justify-between">
              <div>
                <span className="font-bold text-[#716B64] uppercase tracking-wider block text-[9px]">
                  SHIP FROM:
                </span>
                <p className="font-bold text-[#1A1816]">PJ Jewellery Central Vault &amp; Atelier</p>
                <p className="text-[#403C38]">12 Place Vendôme, Luxury District, Suite 400</p>
                <p className="text-[#403C38]">Paris / New York Hub &bull; Concierge: +1 (800) 755-3935</p>
              </div>
              <div className="text-right font-mono text-[9px] text-[#716B64]">
                <div>DATE: {new Date(order.created_at).toLocaleDateString("en-US")}</div>
                <div>WT: 0.45 KG (BOXED)</div>
              </div>
            </div>

            {/* Recipient Address (SHIP TO) - High Contrast Large Text */}
            <div className="border-b-2 border-[#1A1816] p-4 bg-white">
              <span className="text-[10px] font-bold text-[#716B64] uppercase tracking-wider block mb-1">
                DELIVER TO (RECIPIENT):
              </span>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold tracking-tight text-[#1A1816]">
                  {order.customer_name}
                </h3>
                <div className="text-xs leading-relaxed text-[#24211E] font-medium whitespace-pre-line pl-0.5">
                  {order.shipping_address}
                </div>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-[#554F47] font-mono">
                  {order.customer_phone && (
                    <span className="flex items-center gap-1 font-semibold text-[#1A1816]">
                      <Phone className="w-3 h-3 text-[#B08D57]" />
                      {order.customer_phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#9E988F]" />
                    {order.customer_email}
                  </span>
                </div>
              </div>

              {/* Delivery Instructions if provided */}
              {order.notes && (
                <div className="mt-3 p-2 bg-[#FAF8F4] border border-[#E8E1D8] text-[10px] text-[#24211E]">
                  <strong className="text-[#716B64] uppercase tracking-wider block text-[9px]">
                    Delivery Instructions:
                  </strong>
                  <span className="italic">{order.notes}</span>
                </div>
              )}
            </div>

            {/* Tracking Reference & Barcode + QR Code Section */}
            <div className="border-b-2 border-[#1A1816] p-4 bg-[#FAF8F4]/30 grid grid-cols-12 gap-3 items-center">
              {/* QR Code Container (Zero-dep Scalable SVG) */}
              <div className="col-span-4 flex flex-col items-center justify-center p-2 bg-white border border-[#1A1816]">
                <QRCodeSVG value={trackingUrl} size={110} fgColor="#1A1816" bgColor="#FFFFFF" />
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#716B64] mt-1">
                  SCAN TO TRACK
                </span>
              </div>

              {/* Barcode & Reference Info */}
              <div className="col-span-8 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-mono text-[#716B64]">
                    COURIER WAYBILL / TRACKING REF
                  </span>
                  <div className="font-mono text-sm font-bold tracking-wider text-[#1A1816]">
                    {trackingNumber}
                  </div>
                </div>

                {/* Simulated Code 128 High-Density Vector Barcode */}
                <div className="py-1">
                  <div className="h-10 w-full flex items-stretch gap-[1.5px] bg-white p-1 border border-[#E8E1D8] overflow-hidden">
                    {Array.from({ length: 48 }).map((_, idx) => {
                      const isThick = (idx * 7) % 3 === 0;
                      const isDouble = (idx * 11) % 5 === 0;
                      return (
                        <div
                          key={idx}
                          className={`h-full bg-[#1A1816] ${
                            isDouble ? "w-[3px]" : isThick ? "w-[2px]" : "w-[1px]"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-center font-mono text-[9px] tracking-widest text-[#716B64] mt-0.5">
                    *{order.order_number}*
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-[#716B64] pt-1 border-t border-[#E8E1D8]">
                  <span>METHOD: {order.payment_method.toUpperCase()}</span>
                  <span className="font-bold text-emerald-800">STATUS: VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Package Contents / Manifest Summary */}
            <div className="p-3 text-[10px] bg-white space-y-2">
              <div className="flex items-center justify-between font-mono font-bold border-b border-[#E8E1D8] pb-1">
                <span>PARCEL MANIFEST ({totalPieces} ITEM{totalPieces > 1 ? "S" : ""})</span>
                <span>ORDER: {order.order_number}</span>
              </div>

              <div className="divide-y divide-[#F0EAE2] text-[10px]">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-1 flex justify-between items-center">
                    <div className="truncate max-w-[280px]">
                      <span className="font-semibold text-[#1A1816]">{item.product_title}</span>
                      <span className="text-[#716B64] font-mono ml-1">({item.product_sku})</span>
                    </div>
                    <span className="font-mono font-medium text-[#1A1816] whitespace-nowrap">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fragile fine jewellery warning badge */}
              <div className="pt-2 flex items-center justify-between border-t-2 border-[#1A1816] text-[9px] font-mono">
                <div className="flex items-center gap-1 font-bold text-[#1A1816]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>DO NOT LEAVE UNATTENDED &bull; ADULT SIGNATURE REQUIRED</span>
                </div>
                <span className="text-[#716B64]">PJ ATELIER SEAL #0488</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden during print) */}
        <div className="no-print px-6 py-3 bg-[#FAF8F4] border-t border-[#E8E1D8] flex items-center justify-between">
          <p className="text-[11px] text-[#716B64]">
            Tip: Adjust your printer destination to thermal label printer or PDF (4&times;6&quot; or A4).
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 bg-[#24211E] text-white hover:bg-[#B08D57]"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Shipping Label
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

