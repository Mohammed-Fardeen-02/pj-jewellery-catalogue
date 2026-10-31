"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, Edit2, Trash2, Sparkles, Filter, Boxes, Archive, Globe, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Pagination } from "@/components/ui/pagination";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  productApi,
  ViewProductModal,
  type ProductResponse,
  type ProductStatus,
} from "@/features/products";
import { StockAdjustmentModal } from "@/features/stock";
import { categoryApi, type CategoryResponse } from "@/features/categories";
import { useAuth } from "@/features/auth";

export default function AdminProductsPage() {
  const router = useRouter();
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [products, setProducts] = React.useState<ProductResponse[]>([]);
  const [categories, setCategories] = React.useState<CategoryResponse[]>([]);
  const [total, setTotal] = React.useState(0);
  const [statusCounts, setStatusCounts] = React.useState({
    draft: 0,
    published: 0,
    archived: 0,
    total: 0,
  });
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ProductStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("");

  // Modals state
  const [selectedProduct, setSelectedProduct] = React.useState<ProductResponse | null>(null);
  const [adjustStockProduct, setAdjustStockProduct] = React.useState<ProductResponse | null>(null);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isActionLoading, setIsActionLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Load categories for filter dropdown
  React.useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryApi.listAdmin(token || undefined, { limit: 100 });
        setCategories(res.items);
      } catch (err) {
        console.error("Failed to load categories filter", err);
      }
    }
    loadCategories();
  }, [token]);

  // Load products list
  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await productApi.listAdmin(token || undefined, {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        category_id: categoryFilter || undefined,
      });
      setProducts(res.items);
      setTotal(res.total);
      if (res.status_counts) {
        setStatusCounts(res.status_counts);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }, [token, page, limit, search, statusFilter, categoryFilter]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleOpenView = (product: ProductResponse) => {
    setSelectedProduct(product);
    setIsViewOpen(true);
  };

  const handleOpenEdit = (product: ProductResponse) => {
    router.push(`/admin/products/${product.id}/edit`);
  };

  const handleOpenDelete = (product: ProductResponse) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleToggleActive = async (product: ProductResponse) => {
    try {
      await productApi.toggleActive(product.id, !product.is_active, token || undefined);
      await fetchProducts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to toggle active status");
    }
  };

  const handleUpdateStatus = async (product: ProductResponse, newStatus: ProductStatus) => {
    try {
      await productApi.updateStatus(product.id, newStatus, token || undefined);
      await fetchProducts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Failed to update piece status to ${newStatus}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setIsActionLoading(true);
    try {
      await productApi.delete(selectedProduct.id, token || undefined);
      setIsDeleteOpen(false);
      setSelectedProduct(null);
      await fetchProducts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jewellery Products Master"
        subtitle="Manage registered fine jewellery pieces, SKU identifiers, gemstone attributes, and Cloudinary media."
        action={
          <Button
            size="sm"
            onClick={() => router.push("/admin/products/new")}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Piece
          </Button>
        }
      />

      {/* Status Distribution Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D8] pb-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            statusFilter === "all"
              ? "bg-[#24211E] text-white font-medium"
              : "text-[#716B64] hover:bg-[#FAF8F4] hover:text-[#24211E]"
          }`}
        >
          <span>All Pieces</span>
          <span className="text-[10px] opacity-75 font-mono">({statusCounts.total})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("published");
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            statusFilter === "published"
              ? "bg-[#B08D57] text-white font-medium"
              : "text-[#716B64] hover:bg-[#FAF8F4] hover:text-[#24211E]"
          }`}
        >
          <span>Published</span>
          <span className="text-[10px] opacity-75 font-mono">({statusCounts.published})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("draft");
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            statusFilter === "draft"
              ? "bg-[#24211E] text-white font-medium"
              : "text-[#716B64] hover:bg-[#FAF8F4] hover:text-[#24211E]"
          }`}
        >
          <span>Drafts</span>
          <span className="text-[10px] opacity-75 font-mono">({statusCounts.draft})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("archived");
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            statusFilter === "archived"
              ? "bg-[#716B64] text-white font-medium"
              : "text-[#716B64] hover:bg-[#FAF8F4] hover:text-[#24211E]"
          }`}
        >
          <span>Archived</span>
          <span className="text-[10px] opacity-75 font-mono">({statusCounts.archived})</span>
        </button>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E8E1D8]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#716B64] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search piece title, SKU, or tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-64">
          <Filter className="w-3.5 h-3.5 text-[#B08D57] flex-shrink-0" />
          <CustomSelect
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((c) => ({
                value: c.id,
                label: c.name,
                badge: !c.is_active ? (
                  <span className="px-1 py-0.5 text-[9px] bg-stone-100 text-stone-500 rounded border border-stone-200">
                    Inactive
                  </span>
                ) : undefined,
              })),
            ]}
            placeholder="All Categories"
            searchable={true}
            searchPlaceholder="Filter category..."
            clearable={true}
            className="w-full"
          />
        </div>
      </div>

      {/* Products Master Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner className="p-0" />
              <span className="text-xs text-[#716B64]">Loading product pieces...</span>
            </div>
          ) : errorMessage ? (
            <div className="p-8 text-center text-xs text-red-600 bg-red-50/50">
              {errorMessage}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No jewellery pieces found"
                description={
                  search || statusFilter !== "all" || categoryFilter
                    ? "Try adjusting your search criteria or category filter."
                    : "Begin building your atelier collection by registering your first piece."
                }
                action={
                  <Button size="sm" onClick={() => router.push("/admin/products/new")}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Piece
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] border-t border-[#E8E1D8]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-[#FAF8F4] border-b border-[#E8E1D8] text-[11px] uppercase tracking-wider text-[#716B64] shadow-2xs">
                  <tr>
                    <th className="py-3 px-6 font-semibold">Media</th>
                    <th className="py-3 px-6 font-semibold">SKU Identifier</th>
                    <th className="py-3 px-6 font-semibold">Piece Title</th>
                    <th className="py-3 px-6 font-semibold">Category</th>
                    <th className="py-3 px-6 font-semibold">Price ($)</th>
                    <th className="py-3 px-6 font-semibold">Vault Stock</th>
                    <th className="py-3 px-6 font-semibold">Status</th>
                    <th className="py-3 px-6 font-semibold">Storefront Active</th>
                    <th className="py-3 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE2]">
                  {products.map((product) => {
                    const heroImage = product.primary_image || product.images[0];
                    const priceNum = Number(product.price || 0);
                    const stockNum = Number(product.stock_quantity ?? 0);
                    const isLow = stockNum > 0 && stockNum <= (product.low_stock_threshold || 5);
                    const isOut = stockNum <= 0;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-[#FAF8F4]/60 transition-colors"
                      >
                        {/* Media Thumbnail */}
                        <td className="py-3 px-6">
                          <div className="relative w-11 h-11 bg-[#FAF8F4] rounded border border-[#E8E1D8] overflow-hidden flex items-center justify-center flex-shrink-0">
                            {heroImage ? (
                              <Image
                                src={heroImage.image_url}
                                alt={product.title}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <Sparkles className="w-4 h-4 text-[#B08D57] opacity-60" />
                            )}
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-4 px-6 font-mono text-[#716B64]">
                          {product.sku}
                        </td>

                        {/* Title */}
                        <td className="py-4 px-6 font-serif text-sm font-medium text-[#24211E]">
                          {product.title}
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 text-[#716B64]">
                          {product.category?.name || "--"}
                        </td>

                        {/* Price & Discount */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#24211E]">
                              ${priceNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {product.compare_at_price && Number(product.compare_at_price) > priceNum && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="line-through text-[10px] text-[#9E988F]">
                                  ${Number(product.compare_at_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                                <span className="text-[9px] font-semibold text-emerald-700">
                                  -{Math.round(product.discount_percentage || 0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Vault Stock */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-[11px] font-semibold font-mono rounded-xs border ${
                                isOut
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : isLow
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}
                            >
                              {stockNum} units
                            </span>
                            <button
                              onClick={() => setAdjustStockProduct(product)}
                              className="text-[10px] text-[#B08D57] hover:text-[#24211E] underline font-medium"
                              title="Stock In or Stock Out"
                            >
                              Adjust
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <Badge
                            variant={
                              product.status === "published"
                                ? "gold"
                                : product.status === "draft"
                                ? "outline"
                                : "default"
                            }
                          >
                            {product.status}
                          </Badge>
                        </td>

                        {/* Active Toggle Switch */}
                        <td className="py-4 px-6">
                          <Switch
                            checked={product.is_active}
                            onCheckedChange={() => handleToggleActive(product)}
                            label={product.is_active ? "Active" : "Hidden"}
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                          {/* Quick Status Transition Actions */}
                          {product.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(product, "published")}
                              className="h-7 px-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                              title="Publish Piece to Storefront"
                            >
                              <Globe className="w-3 h-3 mr-1 text-emerald-600" />
                              Publish
                            </Button>
                          )}
                          {product.status === "published" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(product, "archived")}
                              className="h-7 px-2 text-[10px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                              title="Archive Piece"
                            >
                              <Archive className="w-3 h-3 mr-1 text-amber-700" />
                              Archive
                            </Button>
                          )}
                          {product.status === "archived" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(product, "published")}
                              className="h-7 px-2 text-[10px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300"
                              title="Unarchive & Re-publish Piece"
                            >
                              <RotateCcw className="w-3 h-3 mr-1 text-stone-600" />
                              Publish
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAdjustStockProduct(product)}
                            className="h-7 w-7 p-0 text-[#B08D57] hover:text-[#24211E] hover:bg-[#FAF8F4]"
                            title="Adjust Vault Stock"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenView(product)}
                            className="h-7 w-7 p-0 text-[#716B64] hover:text-[#24211E]"
                            aria-label="View piece specifications"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(product)}
                            className="h-7 w-7 p-0 text-[#716B64] hover:text-[#24211E]"
                            aria-label="Edit piece"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDelete(product)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            aria-label="Delete piece"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination */}
          {total > 0 && (
            <div className="border-t border-[#E8E1D8] px-4 bg-[#FAF8F4]/50">
              <Pagination
                page={page}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                limitOptions={[10, 20, 50]}
                itemLabel="pieces"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Product Modal */}
      <ViewProductModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        product={selectedProduct}
        onEdit={(p) => handleOpenEdit(p)}
      />

      {/* Delete Product Confirmation Alert Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Jewellery Piece"
        message={`Are you sure you want to permanently delete '${selectedProduct?.title}' (SKU: ${selectedProduct?.sku})? All associated Cloudinary images and video assets will be removed.`}
        confirmLabel="Yes, Delete Piece"
        variant="danger"
        isLoading={isActionLoading}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={!!adjustStockProduct}
        onClose={() => setAdjustStockProduct(null)}
        product={adjustStockProduct}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
