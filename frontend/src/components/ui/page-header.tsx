import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("border-b border-[#E8E1D8] pb-6 mb-8", className)}>
      {breadcrumbs && <div className="mb-3 text-xs text-[#716B64]">{breadcrumbs}</div>}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#24211E] tracking-tight font-normal">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-[#716B64] mt-1.5 max-w-2xl">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
      </div>
    </div>
  );
}
