"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sparkles,
  Wand2,
  UploadCloud,
  Check,
  CheckCheck,
  ShieldCheck,
  RotateCcw,
  Layers,
  Tag,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ManagedImageItem } from "@/components/ui/multi-image-uploader";
import type { AiSuggestResponse } from "../api/ai.api";
import type { CategoryResponse } from "@/features/categories/types/category.types";
import type { AiSuggestedFields } from "./ProductAiSuggestionsDrawer";
import { cn } from "@/lib/utils/cn";

export interface ProductAiSidebarCardProps {
  primaryImage: ManagedImageItem | null;
  onUploadPrimaryImage: (file: File) => void;
  isLoading: boolean;
  onAnalyze: () => void;
  suggestions: AiSuggestResponse | null;
  onApplySuggestions: (fields: AiSuggestedFields) => void;
  onClearSuggestions: () => void;
  availableCategories: CategoryResponse[];
}

export const ProductAiSidebarCard: React.FC<ProductAiSidebarCardProps> = ({
  primaryImage,
  onUploadPrimaryImage,
  isLoading,
  onAnalyze,
  suggestions,
  onApplySuggestions,
  onClearSuggestions,
  availableCategories,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Field selection state for which fields the user wants to populate
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

  const toggleField = (field: string) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPrimaryImage(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUploadPrimaryImage(file);
    }
  };

  // Find category matching suggestion
  const matchedCategory = suggestions
    ? availableCategories.find(
        (c) =>
          c.slug.toLowerCase() === suggestions.category_slug?.toLowerCase() ||
          c.name.toLowerCase().includes(suggestions.category_name?.toLowerCase()) ||
          suggestions.category_name?.toLowerCase().includes(c.name.toLowerCase())
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

    onApplySuggestions(fieldsToApply);
  };

  const handleApplyAll = () => {
    if (!suggestions) return;
    onApplySuggestions({
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
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-24 self-start space-y-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
      />

      <div className="bg-white border border-[#E8E1D8] shadow-sm overflow-hidden rounded-xs">
        {/* Card Header */}
        <div className="p-4 bg-gradient-to-r from-[#1A1816] to-[#2B2622] text-[#FAF8F4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium tracking-wide text-white">
                AI Vision Assistant
              </h3>
              <p className="text-[10px] text-[#A8A29A]">
                NVIDIA Llama-3.2 Vision Model
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#A8A29A] hover:text-white transition-colors p-1"
            title={isExpanded ? "Collapse card" : "Expand card"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Primary Image Upload / Preview Zone */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#716B64]">
                  Piece Primary Image
                </label>
                {primaryImage && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                    Photo Attached
                  </span>
                )}
              </div>

              {primaryImage ? (
                <div className="relative group border border-[#E8E1D8] bg-[#FAF8F4] p-2 rounded">
                  <div className="relative w-full h-44 bg-neutral-900 overflow-hidden flex items-center justify-center">
                    <Image
                      src={primaryImage.image_url}
                      alt="Primary jewellery piece"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-[#716B64] hover:text-[#24211E] underline cursor-pointer"
                    >
                      Change Photo
                    </button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onAnalyze}
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="h-7 text-xs gap-1.5 border-[#B08D57] text-[#8C6D37] hover:bg-[#FAF6F0]"
                    >
                      <Wand2 className="w-3 h-3 text-[#B08D57]" />
                      {suggestions ? "Re-Analyze" : "Analyze Piece"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed p-6 text-center cursor-pointer transition-colors rounded",
                    dragOver
                      ? "border-[#B08D57] bg-[#FAF6F0]"
                      : "border-[#D6CEC4] bg-[#FAF8F4] hover:border-[#B08D57] hover:bg-[#FAF6F0]"
                  )}
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white border border-[#E8E1D8] flex items-center justify-center text-[#B08D57]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-[#24211E]">
                    Upload Primary Photo
                  </p>
                  <p className="text-[11px] text-[#716B64] mt-0.5">
                    Drag &amp; drop or click to browse
                  </p>
                  <p className="text-[10px] text-[#888177] mt-1.5">
                    Auto-triggers gemological suggestions
                  </p>
                </div>
              )}
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-4 bg-[#FAF8F4] border border-[#B08D57]/40 rounded text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#B08D57] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-serif text-[#24211E] font-medium">
                  Inspecting Fine Jewellery Piece...
                </p>
                <p className="text-[10px] text-[#716B64]">
                  Analyzing gemstone facets, precious metal tones &amp; silhouette narrative.
                </p>
              </div>
            )}

            {/* Suggestions View */}
            {suggestions && !isLoading && (
              <div className="space-y-3 pt-2 border-t border-[#E8E1D8]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#716B64]">
                    AI Extraction Results
                  </span>
                  <button
                    type="button"
                    onClick={onClearSuggestions}
                    className="text-[10px] text-[#888177] hover:text-rose-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Match Banner */}
                <div className="p-2.5 bg-gradient-to-r from-[#FAF8F4] to-[#F5EFE6] border border-[#B08D57]/30 rounded">
                  <p className="text-[11px] text-[#524B43] leading-relaxed">
                    <strong className="text-[#24211E] font-medium">
                      Haute Joaillerie Match:
                    </strong>{" "}
                    {suggestions.confidence_summary || "Gemological details extracted from piece photo."}
                  </p>
                </div>

                {/* Suggestions List with Checkboxes */}
                <div className="space-y-2.5 text-xs">
                  {/* Title */}
                  <div
                    onClick={() => toggleField("title")}
                    className={cn(
                      "p-2.5 rounded border transition-colors cursor-pointer",
                      selectedFields.title
                        ? "bg-[#FAF8F4] border-[#B08D57]/50"
                        : "bg-white border-[#E8E1D8] opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-semibold text-[#716B64] flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-[#B08D57]" /> Piece Title
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedFields.title}
                        onChange={() => {}}
                        className="rounded accent-[#B08D57]"
                      />
                    </div>
                    <p className="font-serif text-xs font-medium text-[#24211E]">
                      {suggestions.title}
                    </p>
                  </div>

                  {/* Category */}
                  <div
                    onClick={() => toggleField("category")}
                    className={cn(
                      "p-2.5 rounded border transition-colors cursor-pointer",
                      selectedFields.category
                        ? "bg-[#FAF8F4] border-[#B08D57]/50"
                        : "bg-white border-[#E8E1D8] opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-semibold text-[#716B64] flex items-center gap-1.5">
                        <FolderTree className="w-3 h-3 text-[#B08D57]" /> Category
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedFields.category}
                        onChange={() => {}}
                        className="rounded accent-[#B08D57]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[11px] bg-white border-[#B08D57]/40 text-[#8C6D37]">
                        {suggestions.category_name}
                      </Badge>
                      {matchedCategory ? (
                        <span className="text-[10px] text-emerald-700 font-medium">✓ Found in Master</span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-medium">(New Category)</span>
                      )}
                    </div>
                  </div>

                  {/* Editorial Narrative */}
                  <div
                    onClick={() => toggleField("description")}
                    className={cn(
                      "p-2.5 rounded border transition-colors cursor-pointer",
                      selectedFields.description
                        ? "bg-[#FAF8F4] border-[#B08D57]/50"
                        : "bg-white border-[#E8E1D8] opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-semibold text-[#716B64]">
                        Editorial Description
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedFields.description}
                        onChange={() => {}}
                        className="rounded accent-[#B08D57]"
                      />
                    </div>
                    <p className="text-[11px] text-[#524B43] line-clamp-3">
                      {suggestions.description}
                    </p>
                  </div>

                  {/* Specifications (Metal, Gemstone, Style, Collection) */}
                  <div
                    onClick={() => toggleField("designStyle")}
                    className={cn(
                      "p-2.5 rounded border transition-colors cursor-pointer",
                      selectedFields.designStyle
                        ? "bg-[#FAF8F4] border-[#B08D57]/50"
                        : "bg-white border-[#E8E1D8] opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-semibold text-[#716B64] flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-[#B08D57]" /> Attributes &amp; Style
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedFields.designStyle}
                        onChange={() => {}}
                        className="rounded accent-[#B08D57]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div>
                        <span className="text-[#888177]">Metal:</span>{" "}
                        <span className="font-medium text-[#24211E]">{suggestions.metal_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[#888177]">Gemstone:</span>{" "}
                        <span className="font-medium text-[#24211E]">{suggestions.gemstone_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[#888177]">Style:</span>{" "}
                        <span className="font-medium text-[#24211E]">{suggestions.design_style || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[#888177]">Collection:</span>{" "}
                        <span className="font-medium text-[#24211E]">{suggestions.collection || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {suggestions.tags && suggestions.tags.length > 0 && (
                    <div
                      onClick={() => toggleField("tags")}
                      className={cn(
                        "p-2.5 rounded border transition-colors cursor-pointer",
                        selectedFields.tags
                          ? "bg-[#FAF8F4] border-[#B08D57]/50"
                          : "bg-white border-[#E8E1D8] opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-semibold text-[#716B64] flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-[#B08D57]" /> Tags &amp; Keywords
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedFields.tags}
                          onChange={() => {}}
                          className="rounded accent-[#B08D57]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestions.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-white border border-[#E8E1D8] text-[9px] text-[#524B43] rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Strict Boundary Disclaimer */}
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 text-amber-900 rounded text-[10px] flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Artisan Safeguard:</strong> Price, purity, and gram weights are omitted by AI and must be manually configured in the form.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleApplySelected}
                    className="w-full gap-1.5"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Populate Selected Fields
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyAll}
                    className="w-full text-xs text-[#716B64] hover:text-[#24211E]"
                  >
                    Populate All Fields
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Entry Fallback Helper */}
            {!suggestions && !isLoading && (
              <div className="p-3 bg-[#FAF8F4] border border-[#E8E1D8] rounded text-[11px] text-[#716B64] space-y-1">
                <p className="font-medium text-[#24211E]">Manual Registration</p>
                <p>
                  You may choose to bypass AI suggestions at any time and register all catalogue fields manually on the left.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
