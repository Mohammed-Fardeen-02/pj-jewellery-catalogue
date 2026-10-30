"use client";

import * as React from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
  disabled?: boolean;
  blockedNotice?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  disabled = false,
  blockedNotice,
}) => {
  const isDestructive = variant === "danger";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "primary"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={disabled || isLoading || Boolean(blockedNotice)}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full flex-shrink-0 ${
            isDestructive
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-amber-50 text-amber-600 border border-amber-200"
          }`}
        >
          {isDestructive ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
        <div className="space-y-3 flex-1 text-xs text-[#716B64]">
          <p className="leading-relaxed text-[#24211E] font-medium">{message}</p>

          {blockedNotice && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-[11px] leading-relaxed">
              <span className="font-semibold block mb-0.5">Action Blocked:</span>
              {blockedNotice}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
