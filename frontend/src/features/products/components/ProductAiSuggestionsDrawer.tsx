"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sparkles,
  X,
  Check,
  CheckCheck,
  Wand2,
  RefreshCw,
  Info,
  ShieldCheck,
  Layers,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiSuggestResponse } from "../api/ai.api";
import type { CategoryResponse } from "@/features/categories/types/category.types";

export interface AiSuggestedFields {
  title?: string;
  description?: string;
  categoryId?: string;
  designStyle?: string;
  gemstoneType?: string;
  metalType?: string;
  collection?: string;
  tags?: string[];
  keywords?: string[];
}

interface ProductAiSuggestionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  imageUrl?: string | null;
  suggestions: AiSuggestResponse | null;
  onRetry: () => void;
  onApply: (fields: AiSuggestedFields) => void;
  availableCategories: CategoryResponse[];
}

export function ProductAiSuggestionsDrawer({
  isOpen,
  onClose,
  isLoading,
  imageUrl,
  suggestions,
  onRetry,
  onApply,
  availableCategories,
}: ProductAiSuggestionsDrawerProps) {
  // Checkbox selection state for which fields the user wants to apply
  const [selectedFields, setSelectedFields] = React.useState<Record<string, boolean>>({
    title: true,
    description: true,
    category: true,
    designStyle: true,
    gemstoneType: true,
    metalType: true,
    collection: true,
    tags: true,
  });

  // Reset checkboxes when new suggestions arrive
  React.useEffect(() => {
    if (suggestions) {
      setSelectedFields({
        title: true,
        description: true,
        category: true,
        designStyle: true,
        gemstoneType: true,
        metalType: true,
        collection: true,
        tags: true,
      });
    }
  }, [suggestions]);

  if (!isOpen) return null;

  const toggleField = (field: string) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Resolve matching category ID from availableCategories
  const matchedCategory = suggestions
    ? availableCategories.find(
        (c) =>
          c.slug.toLowerCase() === suggestions.category_slug.toLowerCase() ||
          c.name.toLowerCase().includes(suggestions.category_name.toLowerCase())
      )
    : null;

  const handleApplySelected = () => {
    if (!suggestions) return;
    const fieldsToApply: AiSuggestedFields = {};

    if (selectedFields.title) fieldsToApply.title = suggestions.title;
    if (selectedFields.description) fieldsToApply.description = suggestions.description;
    if (selectedFields.category && matchedCategory) fieldsToApply.categoryId = matchedCategory.id;
    if (selectedFields.designStyle) fieldsToApply.designStyle = suggestions.design_style;
    if (selectedFields.gemstoneType) fieldsToApply.gemstoneType = suggestions.gemstone_type;
    if (selectedFields.metalType) fieldsToApply.metalType = suggestions.metal_type;
    if (selectedFields.collection) fieldsToApply.collection = suggestions.collection;
    if (selectedFields.tags) {
      fieldsToApply.tags = suggestions.tags;
      fieldsToApply.keywords = suggestions.keywords;
    }

    onApply(fieldsToApply);
    onClose();
  };

  const handleApplyAll = () => {
    if (!suggestions) return;
    onApply({
      title: suggestions.title,
      description: suggestions.description,
      categoryId: matchedCategory?.id,
      designStyle: suggestions.design_style,
      gemstoneType: suggestions.gemstone_type,
      metalType: suggestions.metal_type,
      collection: suggestions.collection,
      tags: suggestions.tags,
      keywords: suggestions.keywords,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dim backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white border-l border-[#E8E1D8] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E1D8] bg-[#FAF8F4] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1A1816] text-[#B08D57] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-[#24211E]">
                  AI Vision Suggestions
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-[#716B64]">
                  NVIDIA Llama 3.2 Vision Gemology
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[#716B64] hover:text-[#24211E] p-1 transition-colors focus:outline-none"
              aria-label="Close AI suggestions drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Image Preview & Status */}
            {imageUrl && (
              <div className="flex items-center gap-4 p-3 bg-[#FAF8F4] border border-[#E8E1D8]">
                <div className="relative w-16 h-16 bg-white border border-[#E8E1D8] shrink-0 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Analyzed Piece"
                    fill
                    sizes="64px"
                    unoptimized={imageUrl.startsWith("/images/") || imageUrl.endsWith(".svg")}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#B08D57] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-[#B08D57]" />
                    Visual Scan Source
                  </span>
                  <p className="text-xs text-[#24211E] font-medium truncate mt-0.5">
                    Primary Jewellery Reference
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="py-16 text-center space-y-4">
                <div className="inline-block animate-spin text-[#B08D57]">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-[#24211E]">
                    Analyzing Precious Attributes...
                  </h4>
                  <p className="text-xs text-[#716B64] max-w-xs mx-auto">
                    NVIDIA Vision model is inspecting metal luster, stone cut, setting geometry, and styling.
                  </p>
                </div>
              </div>
            )}

            {/* Error or Empty State */}
            {!isLoading && !suggestions && (
              <div className="py-12 text-center space-y-3 bg-[#FAF8F4] p-6 border border-dashed border-[#E8E1D8]">
                <Wand2 className="w-8 h-8 text-[#B08D57] mx-auto opacity-70" />
                <h4 className="font-serif text-sm text-[#24211E]">No Suggestions Ready</h4>
                <p className="text-xs text-[#716B64]">
                  Upload or select a primary piece image to trigger automated luxury cataloguing suggestions.
                </p>
                <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5 mt-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Analyze Image Now
                </Button>
              </div>
            )}

            {/* Suggestions Checklist */}
            {!isLoading && suggestions && (
              <div className="space-y-4">
                {/* Confidence Summary Banner */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 text-xs rounded-xs flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[11px] uppercase tracking-wider">
                      Gemological Analysis
                    </span>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{suggestions.confidence_summary}</p>
                  </div>
                </div>

                <div className="text-[11px] text-[#716B64] italic">
                  Select the suggested values you wish to populate. Price, purity, and weights are omitted for manual entry.
                </div>

                {/* Field 1: Title */}
                <div
                  onClick={() => toggleField("title")}
                  className={`p-3 border transition-colors cursor-pointer rounded-xs ${
                    selectedFields.title
                      ? "border-[#B08D57] bg-white ring-1 ring-[#B08D57]/30"
                      : "border-[#E8E1D8] bg-[#FAF8F4]/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B64]">
                      Product Title
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedFields.title}
                      onChange={() => {}}
                      className="accent-[#B08D57] w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                  <p className="font-serif text-sm text-[#24211E] font-medium mt-1">
                    {suggestions.title}
                  </p>
                </div>

                {/* Field 2: Description */}
                <div
                  onClick={() => toggleField("description")}
                  className={`p-3 border transition-colors cursor-pointer rounded-xs ${
                    selectedFields.description
                      ? "border-[#B08D57] bg-white ring-1 ring-[#B08D57]/30"
                      : "border-[#E8E1D8] bg-[#FAF8F4]/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B64]">
                      Editorial Description
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedFields.description}
                      onChange={() => {}}
                      className="accent-[#B08D57] w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-[#24211E] mt-1 leading-relaxed">
                    {suggestions.description}
                  </p>
                </div>

                {/* Field 3: Category */}
                <div
                  onClick={() => toggleField("category")}
                  className={`p-3 border transition-colors cursor-pointer rounded-xs ${
                    selectedFields.category
                      ? "border-[#B08D57] bg-white ring-1 ring-[#B08D57]/30"
                      : "border-[#E8E1D8] bg-[#FAF8F4]/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B64]">
                      Category
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedFields.category}
                      onChange={() => {}}
                      className="accent-[#B08D57] w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Layers className="w-3.5 h-3.5 text-[#B08D57]" />
                    <span className="text-xs font-semibold text-[#24211E]">
                      {matchedCategory?.name || suggestions.category_name}
                    </span>
                    {matchedCategory ? (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Exact active match
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200">
                        Suggested
                      </span>
                    )}
                  </div>
                </div>

                {/* Field 4 & 5: Style & Collection */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => toggleField("designStyle")}
                    className={`p-3 border transition-colors cursor-pointer rounded-xs ${
                      selectedFields.designStyle
                        ? "border-[#B08D57] bg-white ring-1 ring-[#B08D57]/30"
                        : "border-[#E8E1D8] bg-[#FAF8F4]/50 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B64]">
                        Design Style
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedFields.designStyle}
                        onChange={() => {}}
                        className="accent-[#B08D57] w-3.5 h-3.5"
                      />
                    </div>
                    <p className="text-xs font-medium text-[#24211E] mt-1 truncate">
                      {suggestions.design_style}
                    </p>
                  </div>

                  <div
                    onClick={() => toggleField("collection")}
                    className={`p-3 border transition-colors cursor-pointer rounded-xs ${
                      selectedFields.collection
                        ? "border-[#B08D57] bg-white ring-1 ring-[#B08D57]/30"
                        : "border-[#E8E1D8] bg-[#FAF8F4]/50 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B64]">
                        Collection
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedFields.collection}
                        onChange={() => {}}
                        className="accent-[#B08D57] w-3.5 h-3.5"
                      />
                    </div>
                    <p className="text-xs font-medium text-[#24211E] mt-1 truncate">
                      {suggestions.collection}
                    </p>
                  </div>
                </div>

                {/* Field 6 & 7: Gemstone & Metal */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => toggleField("gemstoneType")}
                    className={`p-3 border transition-colors cursor-pointer rounded-xs ${
                      selectedFields.gemstoneType
                        ? "border-[#B08D57] bg-white ring-1 ring-[#B08D57]/30"
                        : "border-[#E8E1D8] bg-[#FAF8F4]/50 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B64]">
                        Gemstone
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedFields.gemstoneType}
                        onChange={() => {}}
                        className="accent-[#B08D57] w-3.5 h-3.5"
                      />
                    </div>
                    <p className="text-xs font-medium text-[#24211E] mt-1 truncate">
                      {suggestions.gemstone_type}
                    </p>
                  </div>

                  <div
                    onClick={() => toggleField("metalType")}
                    className={`p-3 border transition-colors cursor-pointer rounded-xs ${
                      selectedFields.metalType
                        ? "border-[#B08D57] bg-white ring-1 ring-[#B08D57]/30"
                        : "border-[#E8E1D8] bg-[#FAF8F4]/50 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B64]">
                        Metal Type
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedFields.metalType}
                        onChange={() => {}}
                        className="accent-[#B08D57] w-3.5 h-3.5"
                      />
                    </div>
                    <p className="text-xs font-medium text-[#24211E] mt-1 truncate">
                      {suggestions.metal_type}
                    </p>
                  </div>
                </div>

                {/* Field 8: Tags & Keywords */}
                <div
                  onClick={() => toggleField("tags")}
                  className={`p-3 border transition-colors cursor-pointer rounded-xs ${
                    selectedFields.tags
                      ? "border-[#B08D57] bg-white ring-1 ring-[#B08D57]/30"
                      : "border-[#E8E1D8] bg-[#FAF8F4]/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#716B64]">
                      Tags & SEO Keywords
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedFields.tags}
                      onChange={() => {}}
                      className="accent-[#B08D57] w-3.5 h-3.5"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[#FAF8F4] border border-[#E8E1D8] text-[#716B64]"
                      >
                        <Tag className="w-2.5 h-2.5 text-[#B08D57]" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[#E8E1D8] bg-[#FAF8F4] space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="w-1/3 text-xs"
              >
                Dismiss
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleApplySelected}
                disabled={!suggestions || isLoading}
                className="w-1/3 text-xs gap-1 border-[#B08D57] text-[#24211E] hover:bg-[#FAF8F4]"
              >
                <Check className="w-3.5 h-3.5 text-[#B08D57]" />
                Apply Picked
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyAll}
                disabled={!suggestions || isLoading}
                className="w-1/3 text-xs gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Apply All
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
