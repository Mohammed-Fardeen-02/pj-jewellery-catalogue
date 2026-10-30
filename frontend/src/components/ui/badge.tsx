import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "outline" | "success" | "neutral";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#24211E] text-white",
    gold: "bg-[#F7F1E8] text-[#987642] border border-[#E8E1D8]",
    outline: "border border-[#E8E1D8] text-[#716B64]",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    neutral: "bg-[#F6F3EE] text-[#716B64]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
