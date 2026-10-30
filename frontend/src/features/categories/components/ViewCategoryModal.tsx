"use client";

import * as React from "react";
import { Edit2, ExternalLink, Calendar, Layers, Hash } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CategoryResponse } from "../types/category.types";

export interface ViewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryResponse | null;
  onEdit: (category: CategoryResponse) => void;
}

export const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onEdit,
}) => {
  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Category Specification"
      subtitle={`Master details for ${category.name}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Link
            href={`/categories/${category.slug}`}
            target="_blank"
            className="text-xs text-[#B08D57] hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>Preview in Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(category);
              }}
              className="gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Category
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-xs text-[#716B64]">
        {/* Header Summary */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8E1D8]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B08D57] block mb-1">
              Category Name
            </span>
            <h2 className="font-serif text-2xl font-normal text-[#24211E]">
              {category.name}
            </h2>
          </div>
          <Badge variant={category.is_active ? "success" : "outline"}>
            {category.is_active ? "Active in Catalogue" : "Archived / Inactive"}
          </Badge>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-[#FAF8F4] border border-[#E8E1D8] rounded space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#716B64]">
              <Hash className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>URL Slug</span>
            </div>
            <p className="font-mono text-sm text-[#24211E] font-medium">{category.slug}</p>
          </div>

          <div className="p-3.5 bg-[#FAF8F4] border border-[#E8E1D8] rounded space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#716B64]">
              <Layers className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>Associated Products</span>
            </div>
            <p className="font-serif text-lg text-[#24211E] font-medium">
              {category.product_count} Pieces
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#716B64]">
            Editorial Description
          </span>
          <p className="text-[#24211E] bg-[#FAF8F4]/50 border border-[#E8E1D8] p-3 rounded leading-relaxed text-xs">
            {category.description || "No description provided for this collection category."}
          </p>
        </div>

        {/* Meta Timestamps */}
        <div className="pt-4 border-t border-[#E8E1D8] grid grid-cols-2 gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-[#716B64]">
            <Calendar className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#716B64]">
            <Calendar className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Updated: {new Date(category.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
