"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { Product, ProductPublicResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";

export interface ProductCardProps {
  product: Product | ProductPublicResponse | any;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const primaryImage =
    product.primary_image ||
    (product.images && product.images.length > 0
      ? product.images.find((img: any) => img.is_primary) || product.images[0]
      : null);

  const imageSrc =
    primaryImage?.image_url ||
    primaryImage?.storage_path ||
    "/images/hero-jewellery.svg";
  const imageAlt = primaryImage?.alt_text || product.title;

  const price = Number(product.price || 0);
  const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null;
  const discountPct =
    product.discount_percentage ??
    (compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null);

  const stockQty = Number(product.stock_quantity ?? 0);
  const isOutOfStock = stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= (product.low_stock_threshold || 3);

  return (
    <article
      className={`group bg-white border border-[#E8E1D8] hover:border-[#B08D57] transition-all duration-300 flex flex-col ${className || ""}`}
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-4/5 overflow-hidden bg-[#FAF8F4]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Status & Discount Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {discountPct && discountPct > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#24211E] text-[#FAF8F4] shadow-sm">
              -{Math.round(discountPct)}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
              Sold Out
            </Badge>
          ) : isLowStock ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
              Only {stockQty} Left
            </Badge>
          ) : null}
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] tracking-widest text-[#B08D57] uppercase font-semibold">
              {product.category?.name || "Haute Jewellery"}
            </span>
            <span className="text-[10px] text-[#716B64] font-mono">{product.sku}</span>
          </div>

          <h3 className="font-serif text-lg text-[#24211E] group-hover:text-[#B08D57] transition-colors leading-snug line-clamp-1">
            <Link href={`/products/${product.slug}`}>{product.title}</Link>
          </h3>

          {product.description && (
            <p className="text-xs text-[#716B64] line-clamp-2 mt-1.5 leading-relaxed font-sans">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[#F0EAE2] flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              {price > 0 ? (
                <>
                  <span className="text-sm font-semibold text-[#24211E] font-sans">
                    ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {compareAtPrice && compareAtPrice > price && (
                    <span className="line-through text-xs text-[#9E988F] font-sans">
                      ${compareAtPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-[#716B64] italic">Price upon enquiry</span>
              )}
            </div>
            {!isOutOfStock && (
              <span className="text-[10px] text-emerald-700 font-medium mt-0.5">
                Available in Vault
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isOutOfStock && (
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    id: product.id,
                    slug: product.slug,
                    title: product.title,
                    sku: product.sku,
                    price: price,
                    image_url: imageSrc,
                    stock_quantity: stockQty,
                  })
                }
                className="p-1.5 text-[#716B64] hover:text-[#B08D57] hover:bg-[#FAF8F4] border border-transparent hover:border-[#E8E1D8] transition-colors rounded-xs"
                title="Add to Shopping Bag"
                aria-label={`Add ${product.title} to Shopping Bag`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            )}

            <Link
              href={`/products/${product.slug}`}
              className="text-[11px] uppercase tracking-wider text-[#B08D57] group-hover:text-[#24211E] font-medium transition-colors"
            >
              Discover &rarr;
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
