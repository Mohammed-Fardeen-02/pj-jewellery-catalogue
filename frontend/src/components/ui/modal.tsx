"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  className = "",
}) => {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop with luxury atelier blur */}
      <div
        className="fixed inset-0 bg-[#24211E]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white border border-[#E8E1D8] shadow-2xl rounded-sm z-10 flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E8E1D8] bg-[#FAF8F4]/80">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#24211E] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#716B64] mt-1 font-sans">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
            className="h-8 w-8 p-0 text-[#716B64] hover:text-[#24211E] hover:bg-[#E8E1D8]/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1 font-sans">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E1D8] bg-[#FAF8F4]/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
