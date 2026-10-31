"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Layers,
  Film,
  Tag,
  AlertCircle,
  Save,
  ArrowLeft,
  DollarSign,
  PackageCheck,
  Archive,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {
  MultiImageUploader,
  type ManagedImageItem,
} from "@/components/ui/multi-image-uploader";
import { VideoUploader } from "@/components/ui/video-uploader";
import {
  categoryApi,
  SearchableCategorySelect,
  type CategoryResponse,
} from "@/features/categories";
import {
  productApi,
  type ProductCreatePayload,
  type ProductResponse,
  type ProductStatus,
} from "../index";
import { useAuth } from "@/features/auth";

export interface ProductFormProps {
  initialProduct?: ProductResponse | null;
  isEditing?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  isEditing = false,
}) => {
  const router = useRouter();
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const [categories, setCategories] = React.useState<CategoryResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!initialProduct) return;
    setIsDeleting(true);
    try {
      await productApi.delete(initialProduct.id, token || undefined);
      router.push("/admin/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete piece.");
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Form Fields
  const [title, setTitle] = React.useState(initialProduct?.title || "");
  const [slug, setSlug] = React.useState(initialProduct?.slug || "");
  const [sku, setSku] = React.useState(initialProduct?.sku || "");
  const [categoryId, setCategoryId] = React.useState<string>(
    initialProduct?.category_id || ""
  );
  const [description, setDescription] = React.useState(
    initialProduct?.description || ""
  );
  const [status, setStatus] = React.useState<ProductStatus>(
    initialProduct?.status || "draft"
  );
  const [isActive, setIsActive] = React.useState<boolean>(
    initialProduct?.is_active ?? true
  );

  // Pricing & Vault Inventory
  const [price, setPrice] = React.useState<string>(
    initialProduct?.price !== undefined ? String(initialProduct.price) : ""
  );
  const [compareAtPrice, setCompareAtPrice] = React.useState<string>(
    initialProduct?.compare_at_price ? String(initialProduct.compare_at_price) : ""
  );
  const [discountPercentage, setDiscountPercentage] = React.useState<string>(
    initialProduct?.discount_percentage ? String(initialProduct.discount_percentage) : ""
  );
  const [stockQuantity, setStockQuantity] = React.useState<string>(
    initialProduct?.stock_quantity !== undefined ? String(initialProduct.stock_quantity) : "0"
  );
  const [lowStockThreshold, setLowStockThreshold] = React.useState<string>(
    initialProduct?.low_stock_threshold !== undefined
      ? String(initialProduct.low_stock_threshold)
      : "5"
  );

  // Media
  const initialImages: ManagedImageItem[] = (initialProduct?.images || []).map(
    (img) => ({
      id: img.id,
      image_url: img.image_url,
      public_id: img.public_id,
      alt_text: img.alt_text,
      is_primary: img.is_primary,
      display_order: img.display_order,
    })
  );
  const [images, setImages] = React.useState<ManagedImageItem[]>(initialImages);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(
    initialProduct?.video_url || null
  );
  const [videoFile, setVideoFile] = React.useState<File | null>(null);

  // Attributes
  const initAttrs = (initialProduct?.attributes || {}) as Record<string, string>;
  const [metalType, setMetalType] = React.useState(initAttrs.metal_type || "");
  const [purity, setPurity] = React.useState(initAttrs.purity || "");
  const [grossWeight, setGrossWeight] = React.useState(
    initAttrs.gross_weight ? String(initAttrs.gross_weight) : ""
  );
  const [netWeight, setNetWeight] = React.useState(
    initAttrs.net_weight ? String(initAttrs.net_weight) : ""
  );
  const [gemstoneType, setGemstoneType] = React.useState(
    initAttrs.gemstone_type || ""
  );
  const [stoneWeight, setStoneWeight] = React.useState(
    initAttrs.stone_weight ? String(initAttrs.stone_weight) : ""
  );
  const [collection, setCollection] = React.useState(initAttrs.collection || "");
  const [designStyle, setDesignStyle] = React.useState(
    initAttrs.design_style || ""
  );

  // Tags & Keywords
  const [tagsInput, setTagsInput] = React.useState(
    (initialProduct?.tags || []).join(", ")
  );
  const [keywordsInput, setKeywordsInput] = React.useState(
    (initialProduct?.keywords || []).join(", ")
  );

  // Fetch active categories for dropdown
  React.useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryApi.listAdmin(token || undefined, {
          limit: 100,
        });
        setCategories(res.items);
      } catch (err) {
        console.error("Failed to load categories for dropdown", err);
      }
    }
    loadCategories();
  }, [token]);

  // Auto-slug generator when title changes in creation mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing && !slug) {
      const genSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(genSlug);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isCategoryInactive = selectedCategory && !selectedCategory.is_active;

  const handleSubmit = async (targetStatus?: ProductStatus) => {
    const finalStatus = targetStatus || status;

    if (!title.trim()) {
      setError("Product title is mandatory.");
      return;
    }

    if (images.length > 5) {
      setError("A product can hold a maximum of 5 images.");
      return;
    }

    if (finalStatus === "published" && isCategoryInactive) {
      setError(
        `Cannot publish piece under inactive category '${selectedCategory?.name}'. Please activate the category first.`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Separate existing uploaded images from pending new file uploads
      const existingImages = images.filter((img) => !img.file);
      const pendingUploads = images.filter((img) => img.file);

      // Parse tags and keywords
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      // Build attributes dict
      const attributes: Record<string, unknown> = {};
      if (metalType.trim()) attributes.metal_type = metalType.trim();
      if (purity.trim()) attributes.purity = purity.trim();
      if (grossWeight.trim()) attributes.gross_weight = Number(grossWeight);
      if (netWeight.trim()) attributes.net_weight = Number(netWeight);
      if (gemstoneType.trim()) attributes.gemstone_type = gemstoneType.trim();
      if (stoneWeight.trim()) attributes.stone_weight = Number(stoneWeight);
      if (collection.trim()) attributes.collection = collection.trim();
      if (designStyle.trim()) attributes.design_style = designStyle.trim();

      const numPrice = parseFloat(price) || 0;
      const numCompareAt = compareAtPrice ? parseFloat(compareAtPrice) : undefined;
      const numDiscount = discountPercentage
        ? parseFloat(discountPercentage)
        : numCompareAt && numCompareAt > numPrice && numCompareAt > 0
        ? Math.round(((numCompareAt - numPrice) / numCompareAt) * 100)
        : undefined;

      const payload: ProductCreatePayload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        sku: sku.trim() || undefined,
        category_id: categoryId || undefined,
        description: description.trim() || undefined,
        status: finalStatus,
        is_active: isActive,
        price: numPrice,
        compare_at_price: numCompareAt,
        discount_percentage: numDiscount,
        stock_quantity: parseInt(stockQuantity, 10) || 0,
        low_stock_threshold: parseInt(lowStockThreshold, 10) || 5,
        tags,
        keywords,
        attributes,
        video_url: videoUrl || undefined,
        images: existingImages.map((img, idx) => ({
          image_url: img.image_url,
          public_id: img.public_id || undefined,
          alt_text: img.alt_text || undefined,
          is_primary: img.is_primary || false,
          display_order: idx,
        })),
      };

      let savedProduct: ProductResponse;

      if (isEditing && initialProduct) {
        savedProduct = await productApi.update(
          initialProduct.id,
          payload,
          token || undefined
        );
        if (initialProduct.status !== finalStatus) {
          savedProduct = await productApi.updateStatus(
            initialProduct.id,
            finalStatus,
            token || undefined
          );
        }
      } else {
        savedProduct = await productApi.create(payload, token || undefined);
      }

      // 2. Upload any pending new image files directly to Cloudinary via backend endpoint
      for (const item of pendingUploads) {
        if (item.file) {
          await productApi.uploadImage(
            savedProduct.id,
            item.file,
            { is_primary: item.is_primary, alt_text: item.alt_text || undefined },
            token || undefined
          );
        }
      }

      // 3. Upload pending video file if present
      if (videoFile) {
        await productApi.uploadVideo(
          savedProduct.id,
          videoFile,
          token || undefined
        );
      }

      router.push("/admin/products");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving the product."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl">
      <PageHeader
        title={isEditing ? `Edit Piece: ${initialProduct?.title}` : "New Jewellery Piece"}
        subtitle="Catalogue registration with metal specifications, gemstone attributes, and Cloudinary media."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/products")}
            className="gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Card 1: Core Information */}
      <Card className="bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E1D8]">
            <Sparkles className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-serif text-base font-medium text-[#24211E]">
              Core Piece Identification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Piece Title" required>
              <Input
                placeholder="e.g. Celestial Diamond Solitaire Ring"
                value={title}
                onChange={handleTitleChange}
                disabled={isSubmitting}
              />
            </FormField>

            <div>
              <label className="block text-xs font-medium text-[#24211E] mb-1.5">
                Associated Category
              </label>
              <SearchableCategorySelect
                value={categoryId}
                onChange={setCategoryId}
                disabled={isSubmitting}
                allowQuickAdd={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="SKU Identifier" hint="Unique inventory code (e.g. PJ-CELEST-9F2A)">
              <Input
                placeholder="Auto-generated if left blank"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-xs"
              />
            </FormField>

            <FormField label="URL Slug" hint="Used for public SEO routing (e.g. /products/piece-slug)">
              <Input
                placeholder="Auto-generated from title"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                disabled={isSubmitting}
                className="font-mono text-xs"
              />
            </FormField>
          </div>

          <FormField label="Editorial Piece Description">
            <Textarea
              placeholder="Describe the silhouette, inspiration, metalwork, and emotional narrative..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Card 2: Pricing, Discounts & Vault Inventory */}
      <Card className="bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D8]">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#B08D57]" />
              <h3 className="font-serif text-base font-medium text-[#24211E]">
                Pricing, Discounts &amp; Vault Inventory
              </h3>
            </div>
            {compareAtPrice && parseFloat(compareAtPrice) > (parseFloat(price) || 0) && (
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Discount: -
                {Math.round(
                  (((parseFloat(compareAtPrice) || 0) - (parseFloat(price) || 0)) /
                    (parseFloat(compareAtPrice) || 1)) *
                    100
                )}
                % OFF
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Selling Price ($)" required hint="Customer storefront checkout amount">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 12500.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
            </FormField>

            <FormField
              label="Compare-At / Original Price ($)"
              hint="Shown as strike-through price if discounted"
            >
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 15000.00"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
            </FormField>

            <FormField
              label="Override Discount %"
              hint="Leave blank to auto-calculate from Compare-At"
            >
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Auto-calculated"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F0EAE2]">
            <FormField
              label="Vault Stock Quantity (Units)"
              hint="Available inventory. Auto-decrements upon customer purchase."
            >
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
            </FormField>

            <FormField
              label="Low Stock Alert Threshold"
              hint="Trigger alert when inventory drops below this number"
            >
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="5"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Cloudinary Media Gallery (Max 5 images & 1 video) */}
      <Card className="bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E1D8]">
            <Film className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-serif text-base font-medium text-[#24211E]">
              Cloudinary Media Gallery
            </h3>
          </div>

          {/* Multi-Image Uploader (Strictly Max 5 images) */}
          <MultiImageUploader
            images={images}
            onChange={setImages}
            maxImages={5}
            disabled={isSubmitting}
          />

          {/* Video Uploader (Max 1 video) */}
          <div className="pt-4 border-t border-[#E8E1D8]">
            <VideoUploader
              videoUrl={videoUrl}
              videoFile={videoFile}
              onChange={(file, previewUrl) => {
                setVideoFile(file);
                setVideoUrl(previewUrl);
              }}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Jewellery Attributes */}
      <Card className="bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E1D8]">
            <Layers className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-serif text-base font-medium text-[#24211E]">
              Fine Jewellery Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="Metal Type">
              <Input
                placeholder="e.g. 18K Yellow Gold"
                value={metalType}
                onChange={(e) => setMetalType(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Purity">
              <Input
                placeholder="e.g. 750 / 950 Plat"
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Gross Weight (g)">
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 6.85"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Net Metal Weight (g)">
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 6.10"
                value={netWeight}
                onChange={(e) => setNetWeight(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="Gemstone Type">
              <Input
                placeholder="e.g. Natural Diamond"
                value={gemstoneType}
                onChange={(e) => setGemstoneType(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Stone Weight (Carats)">
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 1.25"
                value={stoneWeight}
                onChange={(e) => setStoneWeight(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Collection">
              <Input
                placeholder="e.g. Celestial, Heritage"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Design Style">
              <Input
                placeholder="e.g. Solitaire, Pavé"
                value={designStyle}
                onChange={(e) => setDesignStyle(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Tags & Storefront Visibility */}
      <Card className="bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E1D8]">
            <Tag className="w-4 h-4 text-[#B08D57]" />
            <h3 className="font-serif text-base font-medium text-[#24211E]">
              Publishing & Storefront Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Categorization Tags" hint="Comma separated (e.g. Bridal, Solitaire, Platinum)">
              <Input
                placeholder="e.g. Bridal, Solitaire, Platinum"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="SEO Search Keywords" hint="Search indexing terms (e.g. engagement ring, fine diamond)">
              <Input
                placeholder="e.g. engagement ring, diamond"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#E8E1D8]">
            <div>
              <label className="text-xs font-semibold text-[#24211E] block mb-2">
                Lifecycle State
              </label>
              <div className="flex items-center gap-2">
                {(() => {
                  // If product is published (or was published), user cannot revert to draft ("if published then no drafting")
                  const isPublishedInitial = initialProduct?.status === "published";
                  const availableStatuses: ProductStatus[] = isPublishedInitial
                    ? ["published", "archived"]
                    : initialProduct?.status === "archived"
                    ? ["archived", "published", "draft"]
                    : ["draft", "published"];

                  return availableStatuses.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      disabled={isSubmitting}
                      className={`px-3 py-1.5 text-xs font-medium rounded capitalize border transition-all ${
                        status === st
                          ? "bg-[#24211E] text-white border-[#24211E]"
                          : "bg-white text-[#716B64] border-[#E8E1D8] hover:border-[#B08D57]"
                      }`}
                    >
                      {st}
                    </button>
                  ));
                })()}
              </div>
              {initialProduct?.status === "published" && (
                <p className="text-[11px] text-[#9E988F] mt-1.5 italic">
                  Published pieces cannot be reverted to draft. You can archive or delete this piece.
                </p>
              )}
            </div>

            <div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSubmitting}
                label="Storefront Active Status"
                description="When active and published, this piece will appear in the customer catalogue (provided its category is active)."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-sm p-4 border border-[#E8E1D8] shadow-lg flex items-center justify-between rounded">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/products")}
            disabled={isSubmitting || isDeleting}
          >
            Cancel
          </Button>

          {isEditing && initialProduct && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              disabled={isSubmitting || isDeleting}
              className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Piece
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status specific action buttons */}
          {status === "draft" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit("draft")}
                isLoading={isSubmitting}
                disabled={isSubmitting || isDeleting}
              >
                Save as Draft
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit("published")}
                isLoading={isSubmitting}
                disabled={isSubmitting || isDeleting}
                className="gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isEditing ? "Update & Publish" : "Publish Piece"}
              </Button>
            </>
          )}

          {status === "published" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit("archived")}
                isLoading={isSubmitting}
                disabled={isSubmitting || isDeleting}
                className="gap-1.5 text-amber-800 border-amber-300 hover:bg-amber-50"
              >
                <Archive className="w-3.5 h-3.5 text-amber-700" />
                Archive Piece
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit("published")}
                isLoading={isSubmitting}
                disabled={isSubmitting || isDeleting}
                className="gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </Button>
            </>
          )}

          {status === "archived" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSubmit("draft")}
                isLoading={isSubmitting}
                disabled={isSubmitting || isDeleting}
              >
                Revert to Draft
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit("published")}
                isLoading={isSubmitting}
                disabled={isSubmitting || isDeleting}
                className="gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Re-publish Piece
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete Product Confirmation Modal */}
      {isEditing && initialProduct && (
        <ConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Jewellery Piece"
          message={`Are you sure you want to permanently delete '${title}' (SKU: ${sku || initialProduct.sku})? All associated Cloudinary images will be removed.`}
          confirmLabel="Yes, Delete Piece"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
