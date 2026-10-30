import * as React from "react";
import Link from "next/link";
import type { Category } from "@/types";

export interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`group block p-7 bg-white border border-[#E8E1D8] hover:border-[#B08D57] transition-all duration-300 relative overflow-hidden ${className || ""}`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="text-[10px] tracking-widest uppercase text-[#B08D57] font-semibold block mb-2">
        Collection
      </span>
      <h3 className="font-serif text-2xl text-[#24211E] group-hover:text-[#B08D57] transition-colors">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-xs text-[#716B64] mt-2 line-clamp-2 leading-relaxed font-sans">
          {category.description}
        </p>
      )}
      <div className="mt-5 text-[11px] uppercase tracking-wider text-[#716B64] group-hover:text-[#24211E] font-medium flex items-center gap-1">
        <span>Explore Collection</span>
        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
      </div>
    </Link>
  );
}
