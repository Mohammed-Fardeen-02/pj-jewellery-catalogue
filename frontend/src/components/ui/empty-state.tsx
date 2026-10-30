import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <Sparkles className="w-8 h-8 text-[#B08D57] stroke-[1.5]" />,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#E8E1D8] bg-[#FAF8F4]/50 my-6",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-white border border-[#E8E1D8] flex items-center justify-center mb-4 shadow-xs">
        {icon}
      </div>
      <h4 className="font-serif text-lg text-[#24211E] font-medium">{title}</h4>
      <p className="text-xs text-[#716B64] max-w-sm mt-1 mb-5">{description}</p>
      {action}
    </div>
  );
}
