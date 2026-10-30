"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Edit2,
  ExternalLink,
  Gem,
  Scale,
  Sparkles,
  Calendar,
  Layers,
  Video,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductResponse } from "../types/product.types";

export interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse | null;
  onEdit: (product: ProductResponse) => void;
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
}) => {
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [product, isOpen]);

  if (!product) return null;

  const displayImages = product.images.slice(0, 5);
  const activeImage = displayImages[activeImageIndex] || product.primary_image;
  const attributes = product.attributes as Record<string, string | number | undefined>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jewellery Piece Specification"
      subtitle={`SKU: ${product.sku} • Atelier Piece Record`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          {product.is_published && product.is_active ? (
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="text-xs text-[#B08D57] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>View in Public Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="text-[11px] text-[#716B64] italic">
              Hidden from storefront (
              {!product.is_published ? "Not Published" : "Marked Inactive"}
              )
            </span>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Piece
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-xs text-[#716B64]">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E8E1D8]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#B08D57]">
                {product.category?.name || "Uncategorized"}
              </span>
              <span className="text-neutral-300">&bull;</span>
              <span className="font-mono text-[11px] text-[#716B64]">{product.sku}</span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-[#24211E]">
              {product.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={
                product.status === "published"
                  ? "gold"
                  : product.status === "draft"
                  ? "outline"
                  : "default"
              }
            >
              {product.status.toUpperCase()}
            </Badge>
            <Badge variant={product.is_active ? "success" : "outline"}>
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Media & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Media Gallery Carousel (Up to 5 images & video) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative aspect-square w-full bg-[#FAF8F4] border border-[#E8E1D8] rounded overflow-hidden flex items-center justify-center">
              {activeImage?.image_url ? (
                <Image
                  src={activeImage.image_url}
                  alt={activeImage.alt_text || product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-center p-6 text-[#716B64]">
                  <Sparkles className="w-8 h-8 text-[#B08D57] mx-auto mb-2 opacity-50" />
                  <span className="text-xs">No image provided</span>
                </div>
              )}
            </div>

            {/* Thumbnail row (max 5) */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-[#B08D57] ring-1 ring-[#B08D57]"
                        : "border-[#E8E1D8] hover:border-[#B08D57]/60"
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || "Thumbnail"}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Video Showcase Section */}
            {product.video_url && (
              <div className="pt-2 border-t border-[#E8E1D8] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#24211E]">
                  <Video className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Product Video Showcase</span>
                </div>
                <div className="aspect-video w-full bg-black rounded overflow-hidden">
                  <video
                    src={product.video_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Piece Specifications & Attributes */}
          <div className="lg:col-span-7 space-y-5">
            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#716B64]">
                Description & Craftsmanship
              </span>
              <p className="text-[#24211E] bg-[#FAF8F4]/50 border border-[#E8E1D8] p-3 rounded leading-relaxed text-xs">
                {product.description || "No editorial description available."}
              </p>
            </div>

            {/* Attributes Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#716B64]">
                Fine Jewellery Attributes
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-[#FAF8F4] border border-[#E8E1D8] rounded space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#716B64]">
                    <Sparkles className="w-3 h-3 text-[#B08D57]" />
                    <span>Metal & Purity</span>
                  </div>
                  <p className="font-medium text-[#24211E]">
                    {attributes.metal_type || "--"}{" "}
                    {attributes.purity ? `(${attributes.purity})` : ""}
                  </p>
                </div>

                <div className="p-2.5 bg-[#FAF8F4] border border-[#E8E1D8] rounded space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#716B64]">
                    <Scale className="w-3 h-3 text-[#B08D57]" />
                    <span>Weight Specs</span>
                  </div>
                  <p className="font-medium text-[#24211E]">
                    Gross: {attributes.gross_weight ? `${attributes.gross_weight}g` : "--"} | Net:{" "}
                    {attributes.net_weight ? `${attributes.net_weight}g` : "--"}
                  </p>
                </div>

                <div className="p-2.5 bg-[#FAF8F4] border border-[#E8E1D8] rounded space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#716B64]">
                    <Gem className="w-3 h-3 text-[#B08D57]" />
                    <span>Gemstone</span>
                  </div>
                  <p className="font-medium text-[#24211E]">
                    {attributes.gemstone_type || "Solitaire Metal"}{" "}
                    {attributes.stone_weight ? `(${attributes.stone_weight} ct)` : ""}
                  </p>
                </div>

                <div className="p-2.5 bg-[#FAF8F4] border border-[#E8E1D8] rounded space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#716B64]">
                    <Layers className="w-3 h-3 text-[#B08D57]" />
                    <span>Collection / Style</span>
                  </div>
                  <p className="font-medium text-[#24211E]">
                    {attributes.collection || attributes.design_style || "Signature Atelier"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags and Keywords */}
            {product.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#716B64]">
                  Tags & Metadata
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-[#FAF8F4] border border-[#E8E1D8] text-[#716B64] rounded text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-2 border-t border-[#E8E1D8] flex items-center justify-between text-[11px] text-[#716B64]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#B08D57]" />
                Registered: {new Date(product.created_at).toLocaleDateString()}
              </span>
              <span>Updated: {new Date(product.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
