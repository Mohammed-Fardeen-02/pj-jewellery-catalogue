import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils/cn";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Unable to load content",
  message = "A connectivity or service error occurred while retrieving this data.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 border border-rose-200 bg-rose-50/30 my-6",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
        <AlertCircle className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="font-serif text-lg text-[#24211E] font-medium">{title}</h4>
      <p className="text-xs text-[#716B64] max-w-sm mt-1 mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
