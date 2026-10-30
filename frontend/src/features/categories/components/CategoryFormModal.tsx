"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { CategoryCreatePayload, CategoryResponse } from "../types/category.types";

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CategoryCreatePayload) => Promise<void>;
  initialData?: CategoryResponse | null;
  isLoading?: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sync state when initialData changes or modal opens
  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setDescription(initialData.description || "");
      setIsActive(initialData.is_active);
      setSlugManuallyEdited(true);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setIsActive(true);
      setSlugManuallyEdited(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slugManuallyEdited && !initialData) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        is_active: isActive,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Jewellery Category" : "New Jewellery Category"}
      subtitle={
        isEditing
          ? `Modify category details for '${initialData?.name}'`
          : "Register a new classification tier in the catalogue"
      }
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {isEditing ? "Update Category" : "Save Category"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
            {error}
          </div>
        )}

        <FormField label="Category Name" required error={!name.trim() && error ? error : undefined}>
          <Input
            placeholder="e.g. Diamond Solitaire Rings"
            value={name}
            onChange={handleNameChange}
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="URL Slug"
          hint="Unique identifier used in storefront URLs (e.g. /categories/diamond-solitaire-rings)"
        >
          <Input
            placeholder="e.g. diamond-solitaire-rings"
            value={slug}
            onChange={handleSlugChange}
            disabled={isLoading}
            className="font-mono text-xs"
          />
        </FormField>

        <FormField label="Editorial Description" hint="Customer-facing category overview">
          <Textarea
            placeholder="Describe the craftsmanship, style, or collection theme..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </FormField>

        <div className="pt-2 border-t border-[#E8E1D8]">
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isLoading}
            label="Active Catalogue Status"
            description="Inactive categories hide all associated products from the customer storefront."
          />
        </div>
      </form>
    </Modal>
  );
};
