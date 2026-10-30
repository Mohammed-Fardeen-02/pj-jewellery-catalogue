"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm, productApi, type ProductResponse } from "@/features/products";
import { useAuth } from "@/features/auth";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

function EditProductContent() {
  const params = useParams();
  const router = useRouter();
  const { tokens } = useAuth();
  const token = tokens?.access_token;

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = React.useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await productApi.getById(id, token || undefined);
        setProduct(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <LoadingSpinner className="p-0" />
        <span className="text-xs text-[#716B64]">Loading piece specification...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-xs text-red-600 bg-red-50 p-4 border border-red-200 rounded max-w-md mx-auto">
          {error || "Product not found."}
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/products")}>
          Back to Products List
        </Button>
      </div>
    );
  }

  return <ProductForm initialProduct={product} isEditing={true} />;
}

export default function EditProductPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner className="p-0" />
          <span className="text-xs text-[#716B64]">Loading piece editor...</span>
        </div>
      }
    >
      <EditProductContent />
    </React.Suspense>
  );
}
