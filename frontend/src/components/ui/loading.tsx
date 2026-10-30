import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="relative w-8 h-8">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8E1D8] border-t-[#B08D57] animate-spin" />
      </div>
    </div>
  );
}

export { Skeleton } from "./skeleton";
