"use client";

import * as React from "react";
import { Video, Trash2, AlertCircle } from "lucide-react";
import { Button } from "./button";

export interface VideoUploaderProps {
  videoUrl?: string | null;
  videoFile?: File | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  maxSizeInMB?: number;
  disabled?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoUrl,
  videoFile,
  onChange,
  maxSizeInMB = 100,
  disabled = false,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const allowedFormats = ["video/mp4", "video/webm", "video/quicktime"];

  const handleFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const file = files[0];

    if (!allowedFormats.includes(file.type.toLowerCase())) {
      setError(`Invalid video format '${file.name}'. Only MP4, WebM, and MOV are allowed.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
      setError(`Video file '${file.name}' exceeds the ${maxSizeInMB}MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onChange(file, previewUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = () => {
    onChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentPreview = videoUrl || (videoFile ? URL.createObjectURL(videoFile) : null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#24211E]">Product Video (Max 1 video)</span>
        <span className="text-[#716B64] text-[11px]">MP4, WebM or MOV &bull; Up to 100MB</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {currentPreview ? (
        <div className="relative border border-[#E8E1D8] rounded bg-white p-3 space-y-2">
          <div className="aspect-video w-full max-w-md bg-black rounded overflow-hidden">
            <video
              src={currentPreview}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#716B64]">
              {videoFile ? videoFile.name : "Cloudinary Hosted Video"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="h-7 text-xs text-red-600 hover:text-red-700 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Video
            </Button>
          </div>
        </div>
      ) : (
        !disabled && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files);
            }}
            className="cursor-pointer border-2 border-dashed border-[#E8E1D8] hover:border-[#B08D57] bg-[#FAF8F4]/50 hover:bg-[#FAF8F4] transition-colors rounded p-6 flex flex-col items-center justify-center text-center space-y-2"
          >
            <Video className="w-8 h-8 text-[#B08D57]" />
            <div>
              <p className="text-xs font-medium text-[#24211E]">
                Click or drag product showcase video
              </p>
              <p className="text-[11px] text-[#716B64]">
                1 video per product &bull; High-definition 360&deg; spin or model display
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => handleFile(e.target.files)}
            />
          </div>
        )
      )}
    </div>
  );
};
