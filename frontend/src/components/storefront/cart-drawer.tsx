"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

export function CartDrawer() {
  const {
    items,
    totalItems,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openCheckout,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E8E1D8] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E1D8] bg-[#FAF8F4] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#B08D57]" />
              <div>
                <h3 className="font-serif text-lg font-medium text-[#24211E]">
                  Your Selection
                </h3>
                <p className="text-[11px] text-[#716B64] uppercase tracking-wider">
                  {totalItems} piece{totalItems !== 1 ? "s" : ""} reserved
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="text-[#716B64] hover:text-[#24211E] transition-colors p-1.5 rounded-full hover:bg-white"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#FAF8F4] border border-[#E8E1D8] rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-[#B08D57] opacity-60" />
                </div>
                <div>
                  <h4 className="font-serif text-base text-[#24211E]">
                    Your Shopping Bag is Empty
                  </h4>
                  <p className="text-xs text-[#716B64] mt-1 max-w-xs mx-auto leading-relaxed">
                    Explore our private high-jewellery vault to discover exceptional handcrafted creations.
                  </p>
                </div>
                <Button
                  onClick={closeCart}
                  size="sm"
                  className="mt-2"
                >
                  <Link href="/products" className="flex items-center gap-1.5">
                    Explore Masterpieces <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EAE2]">
                {items.map((item) => {
                  const maxStock = Math.max(1, item.stock_quantity || 1);
                  const isMaxReached = item.quantity >= maxStock;

                  return (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group"
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-20 bg-[#FAF8F4] border border-[#E8E1D8] rounded-xs overflow-hidden shrink-0 flex items-center justify-center"
                      >
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            sizes="80px"
                            unoptimized={item.image_url.startsWith("/images/") || item.image_url.endsWith(".svg")}
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Sparkles className="w-5 h-5 text-[#B08D57]" />
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="block font-serif text-sm font-medium text-[#24211E] hover:text-[#B08D57] truncate transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[10px] font-mono text-[#716B64] mt-0.5">
                          SKU: {item.sku}
                        </p>
                        <p className="text-xs font-semibold text-[#B08D57] mt-1">
                          ${Number(item.price).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>

                        {/* Quantity Controls & Remove */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center border border-[#D4C9BA] bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-[#716B64] hover:text-[#24211E] hover:bg-[#FAF8F4] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 text-xs font-mono font-medium text-[#24211E]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isMaxReached}
                              className={`px-2 py-1 text-[#716B64] transition-colors ${
                                isMaxReached
                                  ? "opacity-30 cursor-not-allowed"
                                  : "hover:text-[#24211E] hover:bg-[#FAF8F4]"
                              }`}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[11px] text-red-500 hover:text-red-700 p-1 flex items-center gap-1 transition-colors"
                            title="Remove from bag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Remove</span>
                          </button>
                        </div>

                        {isMaxReached && (
                          <p className="text-[10px] text-amber-700 mt-1">
                            Only {maxStock} piece{maxStock > 1 ? "s" : ""} available in vault.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E8E1D8] bg-[#FAF8F4] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#716B64]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#24211E]">
                    ${subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-[#716B64]">
                  <span>Insured Courier Delivery</span>
                  <span className="text-emerald-700 font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#24211E] pt-2 border-t border-[#E8E1D8]">
                  <span>Estimated Total</span>
                  <span className="font-mono text-base text-[#B08D57]">
                    ${subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <Button
                onClick={openCheckout}
                size="lg"
                className="w-full gap-2 text-xs tracking-widest uppercase py-5 font-semibold"
              >
                <Lock className="w-4 h-4 text-[#B08D57]" />
                Proceed to Checkout ({totalItems})
              </Button>

              <div className="flex items-center justify-between text-[11px] text-[#716B64] pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Insured Transit</span>
                </div>
                <button
                  onClick={clearCart}
                  className="text-[10px] text-[#716B64] hover:text-red-600 underline transition-colors"
                >
                  Empty Bag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
