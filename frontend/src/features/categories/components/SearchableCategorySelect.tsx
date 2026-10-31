"use client";

import * as React from "react";
import { Plus, Tag, AlertCircle } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { CategoryFormModal } from "./CategoryFormModal";
import { CustomSelect } from "@/components/ui/custom-select";
import type { CategoryResponse, CategoryCreatePayload } from "../types/category.types";

export interface SearchableCategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  allowQuickAdd?: boolean;
  onCategoryAdded?: (category: CategoryResponse) => void;
}

export function SearchableCategorySelect({
  value,
  onChange,
  disabled = false,
  error,
  allowQuickAdd = true,
  onCategoryAdded,
}: SearchableCategorySelectProps) {
  const { categories, isLoading, refresh, createCategory } = useCategories();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const selectedCategory = categories.find((c) => c.id === value);
  const isSelectedInactive = selectedCategory && !selectedCategory.is_active;

  const options = React.useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
      hint: cat.description ? cat.description.slice(0, 40) + "..." : undefined,
      badge: !cat.is_active ? (
        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-stone-100 text-stone-500 rounded border border-stone-200">
          Inactive
        </span>
      ) : undefined,
    }));
  }, [categories]);

  const handleCreateNewCategory = async (payload: CategoryCreatePayload) => {
    const created = await createCategory(payload);
    await refresh();
    onChange(created.id);
    if (onCategoryAdded) {
      onCategoryAdded(created);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <CustomSelect
            value={value}
            onChange={onChange}
            options={options}
            placeholder={isLoading ? "Loading categories..." : "-- Select Category --"}
            searchable={true}
            searchPlaceholder="Search category name..."
            disabled={disabled || isLoading}
            clearable={true}
            actionButton={
              allowQuickAdd
                ? {
                    label: "Add New Category",
                    icon: <Plus className="w-3.5 h-3.5" />,
                    onClick: () => setIsAddModalOpen(true),
                  }
                : undefined
            }
          />
        </div>

        {allowQuickAdd && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-3 bg-[#FAF8F4] border border-[#E8E1D8] text-[#B08D57] hover:bg-[#B08D57] hover:text-white rounded text-xs font-medium flex items-center gap-1.5 transition-all flex-shrink-0 disabled:opacity-50"
            title="Create a new category in master catalog"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Category</span>
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      )}

      {/* Inactive Category Notice */}
      {isSelectedInactive && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>
            <strong>Category Inactive:</strong> The selected category is currently inactive. Products under inactive categories will not be published in the customer storefront.
          </span>
        </div>
      )}

      {/* Add Category Modal */}
      {allowQuickAdd && (
        <CategoryFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateNewCategory}
        />
      )}
    </div>
  );
}
