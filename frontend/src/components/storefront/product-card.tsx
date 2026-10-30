import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.is_primary) || product.images[0]
      : null;

  const imageSrc = primaryImage?.storage_path || "/images/placeholder-ring.svg";
  const imageAlt = primaryImage?.alt_text || product.title;

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
        {!product.is_published && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/90 text-[10px]">
              Draft
            </Badge>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] tracking-widest text-[#B08D57] uppercase font-semibold">
              {product.category?.name || "Bespoke Jewellery"}
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
          <div>
            {product.price ? (
              <span className="text-sm font-medium text-[#24211E] font-sans">
                ${product.price.toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-[#716B64] italic">Price upon enquiry</span>
            )}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="text-[11px] uppercase tracking-wider text-[#B08D57] group-hover:text-[#24211E] font-medium transition-colors"
          >
            Discover &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
