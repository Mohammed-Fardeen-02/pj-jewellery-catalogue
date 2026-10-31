"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Gem,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorefrontCheckoutModal } from "@/components/storefront/storefront-checkout-modal";
import { useCart } from "@/context/cart-context";
import type { Order, ProductPublicResponse } from "@/types";

interface ProductDetailViewProps {
  product: ProductPublicResponse;
}

export function ProductDetailView({ product: initialProduct }: ProductDetailViewProps) {
  const [product, setProduct] = React.useState(initialProduct);
  const [selectedMediaIndex, setSelectedMediaIndex] = React.useState<number>(0);
  const [isVideoMode, setIsVideoMode] = React.useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [selectedQuantity, setSelectedQuantity] = React.useState<number>(1);
  const { addToCart } = useCart();

  // Consolidate images
  const images = product.images && product.images.length > 0
    ? product.images
    : product.primary_image
    ? [product.primary_image]
    : [];

  const activeImage = images[selectedMediaIndex] || images[0] || null;
  const activeImageSrc =
    activeImage?.image_url || "/images/hero-jewellery.svg";

  const price = Number(product.price || 0);
  const compareAt = product.compare_at_price ? Number(product.compare_at_price) : null;
  const discountPct =
    product.discount_percentage ??
    (compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null);

  const stockQty = Number(product.stock_quantity ?? 0);
  const isOutOfStock = stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= 3;

  const handleOrderSuccess = (order: Order) => {
    // Dynamically deduct purchased quantity on current screen
    const purchasedQty = order.items.reduce((acc, item) => acc + item.quantity, 0);
    setProduct((prev: ProductPublicResponse) => ({
      ...prev,
      stock_quantity: Math.max(0, Number(prev.stock_quantity || 0) - purchasedQty),
    }));
    setSelectedQuantity(1);
  };

  const attributes = product.attributes || {};

  return (
    <div className="space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#716B64] hover:text-[#24211E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalogue
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Visual Media Presentation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/5 w-full bg-white border border-[#E8E1D8] p-4 sm:p-6 overflow-hidden shadow-sm">
            {isVideoMode && product.video_url ? (
              <div className="relative w-full h-full bg-[#1A1816] flex items-center justify-center">
                <video
                  src={product.video_url}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="relative w-full h-full bg-[#FAF8F4] overflow-hidden">
                <Image
                  src={activeImageSrc}
                  alt={activeImage?.alt_text || product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain p-4"
                />

                {/* Discount Ribbon */}
                {discountPct && discountPct > 0 && (
                  <div className="absolute top-4 left-4 bg-[#24211E] text-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wider shadow">
                    -{Math.round(discountPct)}% OFF
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Thumbnails Row (Images + Video button) */}
          <div className="flex flex-wrap items-center gap-3">
            {images.map((img: any, idx: number) => {
              const src = img.image_url || img.storage_path;
              const isSelected = !isVideoMode && selectedMediaIndex === idx;
              return (
                <button
                  key={img.id || idx}
                  onClick={() => {
                    setIsVideoMode(false);
                    setSelectedMediaIndex(idx);
                  }}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-white border transition-all overflow-hidden ${
                    isSelected
                      ? "border-[#B08D57] ring-1 ring-[#B08D57]"
                      : "border-[#E8E1D8] hover:border-[#B08D57]/60"
                  }`}
                >
                  <Image src={src} alt="Thumbnail" fill className="object-cover" />
                </button>
              );
            })}

            {/* Video Showcase Thumbnail if URL present */}
            {product.video_url && (
              <button
                onClick={() => setIsVideoMode(true)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-[#24211E] text-white border flex flex-col items-center justify-center gap-1 transition-all ${
                  isVideoMode
                    ? "border-[#B08D57] ring-1 ring-[#B08D57]"
                    : "border-[#E8E1D8] hover:border-[#B08D57]"
                }`}
              >
                <Play className="w-5 h-5 text-[#B08D57]" />
                <span className="text-[9px] uppercase tracking-wider text-[#E8D4B0] font-semibold">
                  360° Video
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Piece Specifications & Acquisition Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="gold">
                {product.category?.name || "Haute Jewellery"}
              </Badge>
              <span className="text-xs text-[#716B64] font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#24211E] font-normal leading-snug">
              {product.title}
            </h1>

            {/* Pricing Strip */}
            <div className="mt-4 flex items-baseline gap-3">
              {price > 0 ? (
                <>
                  <span className="font-serif text-3xl text-[#24211E] font-medium">
                    ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {compareAt && compareAt > price && (
                    <span className="line-through text-base text-[#9E988F] font-sans">
                      ${compareAt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {discountPct && discountPct > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Save ${(compareAt! - price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-base text-[#716B64] italic">Price available upon private enquiry</span>
              )}
            </div>

            {/* Live Inventory Health Status */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <div className="flex items-center gap-1.5 text-red-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  Currently Out of Stock &middot; Commission Only
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  Limited Vault Availability &middot; Only {stockQty} pieces remaining
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  In Stock &middot; Verified in Atelier Vault ({stockQty} units)
                </div>
              )}
            </div>
          </div>

          {/* Acquisition Call to Action */}
          <div className="p-5 bg-[#FAF8F4] border border-[#E8E1D8] space-y-4">
            {!isOutOfStock && (
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D8]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#716B64]">
                  Acquisition Quantity:
                </span>
                <div className="flex items-center border border-[#D4C9BA] bg-white">
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                    disabled={selectedQuantity <= 1}
                    className="px-3 py-1 text-xs text-[#716B64] hover:text-[#24211E] disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-4 py-1 text-xs font-mono font-bold text-[#24211E]">
                    {selectedQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity((q) => Math.min(stockQty, q + 1))}
                    disabled={selectedQuantity >= stockQty}
                    className="px-3 py-1 text-xs text-[#716B64] hover:text-[#24211E] disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                disabled={isOutOfStock}
                onClick={() => {
                  addToCart(
                    {
                      id: product.id,
                      slug: product.slug,
                      title: product.title,
                      sku: product.sku,
                      price: price,
                      image_url: activeImageSrc,
                      stock_quantity: stockQty,
                    },
                    selectedQuantity
                  );
                }}
                className="gap-2 text-xs tracking-wider uppercase font-semibold py-5 border-[#B08D57] text-[#24211E] hover:bg-white"
              >
                <ShoppingBag className="w-4 h-4 text-[#B08D57]" />
                Add to Bag
              </Button>

              <Button
                size="lg"
                disabled={isOutOfStock}
                onClick={() => setIsCheckoutOpen(true)}
                className="gap-2 text-xs tracking-wider uppercase font-semibold py-5"
              >
                <Lock className="w-4 h-4 text-[#B08D57]" />
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#716B64] pt-2 border-t border-[#E8E1D8]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B08D57]" />
                Insured Global Vault Courier
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
                Certificate of Authenticity
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-[#E8E1D8] pt-4">
              <h3 className="text-xs uppercase tracking-wider text-[#716B64] font-semibold mb-2">
                Atelier Notes &amp; Provenance
              </h3>
              <p className="text-sm text-[#24211E] leading-relaxed font-sans">
                {product.description}
              </p>
            </div>
          )}

          {/* Technical Specifications */}
          <div className="border-t border-[#E8E1D8] pt-4">
            <h3 className="text-xs uppercase tracking-wider text-[#716B64] font-semibold mb-3">
              Craftsmanship Specifications
            </h3>
            <div className="border border-[#E8E1D8] divide-y divide-[#E8E1D8] bg-white text-xs">
              <div className="grid grid-cols-2 p-2.5">
                <span className="text-[#716B64]">House Identifier</span>
                <span className="font-mono text-[#24211E]">{product.sku}</span>
              </div>
              {Boolean(attributes.metal_type) && (
                <div className="grid grid-cols-2 p-2.5">
                  <span className="text-[#716B64]">Metal Composition</span>
                  <span className="text-[#24211E]">{String(attributes.metal_type)}</span>
                </div>
              )}
              {Boolean(attributes.purity) && (
                <div className="grid grid-cols-2 p-2.5">
                  <span className="text-[#716B64]">Finishing Purity</span>
                  <span className="text-[#24211E]">{String(attributes.purity)}</span>
                </div>
              )}
              {Boolean(attributes.gemstone_type) && (
                <div className="grid grid-cols-2 p-2.5">
                  <span className="text-[#716B64]">Natural Gemstones</span>
                  <span className="text-[#24211E]">{String(attributes.gemstone_type)}</span>
                </div>
              )}
              {Boolean(attributes.stone_weight) && (
                <div className="grid grid-cols-2 p-2.5">
                  <span className="text-[#716B64]">Carat Total</span>
                  <span className="text-[#24211E]">{String(attributes.stone_weight)} ct</span>
                </div>
              )}
              {Boolean(attributes.gross_weight) && (
                <div className="grid grid-cols-2 p-2.5">
                  <span className="text-[#716B64]">Gross Weight</span>
                  <span className="text-[#24211E]">{String(attributes.gross_weight)} g</span>
                </div>
              )}
              {Boolean(attributes.occasion) && (
                <div className="grid grid-cols-2 p-2.5">
                  <span className="text-[#716B64]">Occasion Suite</span>
                  <span className="text-[#24211E]">{String(attributes.occasion)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instant Direct Checkout Modal */}
      <StorefrontCheckoutModal
        directItem={{
          id: product.id,
          slug: product.slug,
          title: product.title,
          sku: product.sku,
          price: price,
          image_url: activeImageSrc,
          stock_quantity: stockQty,
          quantity: selectedQuantity,
        }}
        isOpenOverride={isCheckoutOpen}
        onCloseOverride={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}
