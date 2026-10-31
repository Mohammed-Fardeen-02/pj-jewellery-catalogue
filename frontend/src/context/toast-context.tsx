"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    (type: ToastType, title: string, message?: string, duration: number = 4500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 visible

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = React.useCallback(
    (title: string, message?: string) => showToast("success", title, message),
    [showToast]
  );
  const error = React.useCallback(
    (title: string, message?: string) => showToast("error", title, message),
    [showToast]
  );
  const warning = React.useCallback(
    (title: string, message?: string) => showToast("warning", title, message),
    [showToast]
  );
  const info = React.useCallback(
    (title: string, message?: string) => showToast("info", title, message),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Render Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xs shadow-2xl border transition-all duration-300 animate-in slide-in-from-top-3 fade-in",
              t.type === "success" && "bg-[#1A1816] text-[#FAF8F4] border-[#B08D57]/60",
              t.type === "error" && "bg-[#1A1816] text-[#FAF8F4] border-red-500/70",
              t.type === "warning" && "bg-[#1A1816] text-[#FAF8F4] border-amber-500/70",
              t.type === "info" && "bg-[#1A1816] text-[#FAF8F4] border-[#B08D57]"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
              {t.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {t.type === "info" && <Info className="w-4 h-4 text-[#B08D57]" />}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="font-serif text-xs font-semibold tracking-wide text-[#FAF8F4]">{t.title}</h5>
              {t.message && (
                <p className="font-sans text-[11px] text-[#A8A29A] mt-0.5 leading-relaxed break-words">
                  {t.message}
                </p>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-[#716B64] hover:text-white p-0.5 transition-colors focus:outline-none"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
