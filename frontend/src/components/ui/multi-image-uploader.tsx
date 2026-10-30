"use client";

import * as React from "react";
import Image from "next/image";
import { UploadCloud, Star, Trash2, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

export interface ManagedImageItem {
  id?: string;
  image_url: string;
  public_id?: string | null;
  file?: File;
  alt_text?: string | null;
  is_primary?: boolean;
  display_order?: number;
}

export interface MultiImageUploaderProps {
  images: ManagedImageItem[];
  onChange: (images: ManagedImageItem[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
  disabled?: boolean;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 5,
  maxSizeInMB = 10,
  disabled = false,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const allowedFormats = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"];

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const newFiles = Array.from(files);

    if (images.length + newFiles.length > maxImages) {
      setError(`A product can hold a maximum of ${maxImages} images. You already have ${images.length}.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const nextItems: ManagedImageItem[] = [...images];

    for (const file of newFiles) {
      if (!allowedFormats.includes(file.type.toLowerCase())) {
        setError(`Invalid format '${file.name}'. Only JPEG, PNG, WebP, and AVIF are supported.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`File '${file.name}' exceeds the ${maxSizeInMB}MB limit.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const isFirst = nextItems.length === 0;

      nextItems.push({
        image_url: previewUrl,
        file,
        alt_text: file.name.replace(/\.[^/.]+$/, ""),
        is_primary: isFirst,
        display_order: nextItems.length,
      });
    }

    onChange(nextItems);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const wasPrimary = images[index].is_primary;
    const filtered = images.filter((_, i) => i !== index);

    // If removed image was primary, set the first remaining as primary
    if (wasPrimary && filtered.length > 0) {
      filtered[0].is_primary = true;
    }

    const reordered = filtered.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));
    onChange(reordered);
  };

  const handleAltTextChange = (index: number, alt_text: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], alt_text };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#24211E]">
          Product Gallery ({images.length}/{maxImages} images)
        </span>
        <span className="text-[#716B64] text-[11px]">
          Maximum 5 images &bull; Star denotes Primary Hero image
        </span>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropzone (disabled when at limit) */}
      {images.length < maxImages && !disabled && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="cursor-pointer border-2 border-dashed border-[#E8E1D8] hover:border-[#B08D57] bg-[#FAF8F4]/50 hover:bg-[#FAF8F4] transition-colors rounded p-6 flex flex-col items-center justify-center text-center space-y-2"
        >
          <UploadCloud className="w-8 h-8 text-[#B08D57]" />
          <div>
            <p className="text-xs font-medium text-[#24211E]">
              Click or drag images to upload to Cloudinary
            </p>
            <p className="text-[11px] text-[#716B64]">
              JPEG, PNG, WebP or AVIF (Up to 10MB each)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Gallery Cards Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {images.map((item, index) => (
            <div
              key={index}
              className={`relative border rounded bg-white p-2.5 space-y-2 transition-shadow ${
                item.is_primary ? "border-[#B08D57] ring-1 ring-[#B08D57]" : "border-[#E8E1D8]"
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative w-full h-32 bg-[#FAF8F4] rounded overflow-hidden flex items-center justify-center">
                <Image
                  src={item.image_url}
                  alt={item.alt_text || "Piece preview"}
                  fill
                  className="object-cover"
                />
                {item.is_primary && (
                  <span className="absolute top-2 left-2 bg-[#B08D57] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                    Hero / Primary
                  </span>
                )}
              </div>

              {/* Alt Text Input */}
              <Input
                placeholder="Accessibility alt text..."
                value={item.alt_text || ""}
                onChange={(e) => handleAltTextChange(index, e.target.value)}
                disabled={disabled}
                className="h-7 text-[11px] px-2"
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <Button
                  type="button"
                  variant={item.is_primary ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleSetPrimary(index)}
                  disabled={disabled || item.is_primary}
                  className="h-6 text-[10px] px-2 gap-1"
                >
                  <Star className={`w-3 h-3 ${item.is_primary ? "fill-white" : ""}`} />
                  {item.is_primary ? "Primary" : "Make Primary"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  aria-label="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
