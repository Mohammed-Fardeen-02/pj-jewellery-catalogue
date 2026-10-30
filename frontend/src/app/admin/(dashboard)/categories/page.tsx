"use client";

import * as React from "react";
import { Plus, Search, Eye, Edit2, Trash2, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  categoryApi,
  CategoryFormModal,
  ViewCategoryModal,
  type CategoryResponse,
  type CategoryCreatePayload,
} from "@/features/categories";
import { useAuth } from "@/features/auth";

export default function AdminCategoriesPage() {
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [categories, setCategories] = React.useState<CategoryResponse[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");

  // Modals state
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryResponse | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isActionLoading, setIsActionLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const activeParam =
        statusFilter === "all" ? undefined : statusFilter === "active";
      const res = await categoryApi.listAdmin(token || undefined, {
        page,
        limit: 20,
        search: search.trim() || undefined,
        is_active: activeParam,
      });
      setCategories(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [token, page, search, statusFilter]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleOpenView = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (payload: CategoryCreatePayload) => {
    setIsActionLoading(true);
    try {
      if (selectedCategory) {
        await categoryApi.update(selectedCategory.id, payload, token || undefined);
      } else {
        await categoryApi.create(payload, token || undefined);
      }
      setIsFormOpen(false);
      setSelectedCategory(null);
      await fetchCategories();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    setIsActionLoading(true);
    try {
      await categoryApi.delete(selectedCategory.id, token || undefined);
      setIsDeleteOpen(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setIsActionLoading(false);
    }
  };

  const hasAssociatedProducts = (selectedCategory?.product_count || 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories Master"
        subtitle="Classification hierarchy for fine jewellery collections, pieces, and storefront routing."
        action={
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Category
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E8E1D8]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#716B64] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search category name or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 border border-[#E8E1D8] bg-[#FAF8F4] p-1 rounded">
            <Filter className="w-3.5 h-3.5 text-[#716B64] ml-1.5" />
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                statusFilter === "all"
                  ? "bg-white text-[#24211E] shadow-sm"
                  : "text-[#716B64] hover:text-[#24211E]"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("active");
                setPage(1);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                statusFilter === "active"
                  ? "bg-white text-[#24211E] shadow-sm"
                  : "text-[#716B64] hover:text-[#24211E]"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("inactive");
                setPage(1);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                statusFilter === "inactive"
                  ? "bg-white text-[#24211E] shadow-sm"
                  : "text-[#716B64] hover:text-[#24211E]"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner className="p-0" />
              <span className="text-xs text-[#716B64]">Loading category catalogue...</span>
            </div>
          ) : errorMessage ? (
            <div className="p-8 text-center text-xs text-red-600 bg-red-50/50">
              {errorMessage}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No categories found"
                description={
                  search || statusFilter !== "all"
                    ? "Try adjusting your search query or status filter."
                    : "Get started by registering your first fine jewellery category."
                }
                action={
                  <Button size="sm" onClick={handleOpenCreate}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Category
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F4] border-b border-[#E8E1D8] text-[11px] uppercase tracking-wider text-[#716B64]">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Category Name</th>
                    <th className="py-3 px-6 font-semibold">URL Slug</th>
                    <th className="py-3 px-6 font-semibold">Description</th>
                    <th className="py-3 px-6 font-semibold">Associated Pieces</th>
                    <th className="py-3 px-6 font-semibold">Status</th>
                    <th className="py-3 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE2]">
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-[#FAF8F4]/60 transition-colors"
                    >
                      <td className="py-4 px-6 font-serif text-sm font-medium text-[#24211E]">
                        {category.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-[#716B64]">
                        {category.slug}
                      </td>
                      <td className="py-4 px-6 text-[#716B64] max-w-xs truncate">
                        {category.description || "--"}
                      </td>
                      <td className="py-4 px-6 font-mono text-[#24211E]">
                        {category.product_count} pieces
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={category.is_active ? "success" : "outline"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenView(category)}
                          className="h-7 w-7 p-0 text-[#716B64] hover:text-[#24211E]"
                          aria-label="View category"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(category)}
                          className="h-7 w-7 p-0 text-[#716B64] hover:text-[#24211E]"
                          aria-label="Edit category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDelete(category)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          aria-label="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Category Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory}
        isLoading={isActionLoading}
      />

      {/* View Category Modal */}
      <ViewCategoryModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        category={selectedCategory}
        onEdit={(cat) => handleOpenEdit(cat)}
      />

      {/* Delete Confirmation Alert Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Jewellery Category"
        message={`Are you sure you want to permanently delete category '${selectedCategory?.name}'?`}
        confirmLabel="Yes, Delete Category"
        variant="danger"
        isLoading={isActionLoading}
        blockedNotice={
          hasAssociatedProducts
            ? `Cannot delete '${selectedCategory?.name}' because ${selectedCategory?.product_count} product(s) are currently associated with it. Please reassign or delete those pieces first.`
            : undefined
        }
      />
    </div>
  );
}
