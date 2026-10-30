"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./button";

export interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
  limitOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export function Pagination({
  page,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
  className = "",
  itemLabel = "items",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Generate visible page numbers with smart ellipsis
  const pageNumbers = React.useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-[#5C554E] ${className}`}
    >
      {/* Items count summary */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-[#24211E]">{from}</strong> to{" "}
          <strong className="text-[#24211E]">{to}</strong> of{" "}
          <strong className="text-[#24211E]">{total}</strong> {itemLabel}
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-[#E8E1D8] pl-3">
            <span className="text-stone-400">Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-7 px-2 border border-[#E8E1D8] bg-white rounded text-xs text-[#24211E] focus:outline-none focus:border-[#B08D57] cursor-pointer"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0 border-[#E8E1D8] text-[#24211E] hover:border-[#B08D57] hover:text-[#B08D57] disabled:opacity-40"
          aria-label="First page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0 border-[#E8E1D8] text-[#24211E] hover:border-[#B08D57] hover:text-[#B08D57] disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-stone-400 select-none">
                  ...
                </span>
              );
            }
            const isCurrent = p === page;
            return (
              <Button
                key={p}
                variant={isCurrent ? "secondary" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                className={`h-8 min-w-[32px] px-2 text-xs ${
                  isCurrent
                    ? "bg-[#B08D57] text-white border-[#B08D57] hover:bg-[#977846]"
                    : "border-[#E8E1D8] text-[#24211E] hover:border-[#B08D57] hover:text-[#B08D57]"
                }`}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0 border-[#E8E1D8] text-[#24211E] hover:border-[#B08D57] hover:text-[#B08D57] disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0 border-[#E8E1D8] text-[#24211E] hover:border-[#B08D57] hover:text-[#B08D57] disabled:opacity-40"
          aria-label="Last page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
