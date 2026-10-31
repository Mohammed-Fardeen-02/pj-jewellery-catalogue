import type { Metadata } from "next";
import Link from "next/link";
import { Gem } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ProductCard } from "@/components/storefront/product-card";
import { productApi } from "@/features/products/api/product.api";
import { categoryApi } from "@/features/categories/api/category.api";
import type { ProductPublicResponse } from "@/features/products/types/product.types";
import type { CategoryPublicResponse } from "@/features/categories/types/category.types";


export const metadata: Metadata = {
  title: "Atelier Catalogue — PJ Fine Jewellery",
  description: "Browse the authentic PJ Jewellery catalogue of master-crafted rings, necklaces, earrings, and bracelets.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const selectedCategorySlug = resolvedParams.category;
  const searchQuery = resolvedParams.search;
  const sortBy = resolvedParams.sort || "created_at";

  let products: ProductPublicResponse[] = [];
  let total = 0;
  let categories: CategoryPublicResponse[] = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      productApi.listPublic({
        category_slug: selectedCategorySlug,
        search: searchQuery,
        sort_by: sortBy === "title" ? "title" : "created_at",
        limit: 50,
      }),
      categoryApi.listPublic(),
    ]);

    products = productsRes.items || [];
    total = productsRes.total || 0;
    categories = categoriesRes || [];
  } catch (err) {
    console.error("Failed to load products for storefront:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <PageHeader
        title="The Jewellery Catalogue"
        subtitle="Explore our bespoke collection. Each piece is crafted by hand in our atelier using ethically sourced metals and certified gemstones."
        breadcrumbs={
          <span>
            <Link href="/" className="hover:underline">Home</Link> &nbsp;/&nbsp; <span>Catalogue</span>
          </span>
        }
      />

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E1D8] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/products"
            className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all ${
              !selectedCategorySlug
                ? "bg-[#24211E] text-white"
                : "bg-white text-[#716B64] border border-[#E8E1D8] hover:border-[#B08D57]"
            }`}
          >
            All Pieces ({total})
          </Link>
          {categories.map((cat) => {
            const isActive = selectedCategorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all ${
                  isActive
                    ? "bg-[#24211E] text-white"
                    : "bg-white text-[#716B64] border border-[#E8E1D8] hover:border-[#B08D57]"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        <span className="text-xs text-[#716B64] italic">
          Single-Brand Private Collection &middot; {total} available
        </span>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-24 bg-white border border-[#E8E1D8] p-8">
          <Gem className="w-10 h-10 text-[#B08D57] mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-2xl text-[#24211E]">No Pieces Found</h3>
          <p className="text-sm text-[#716B64] mt-1.5 max-w-sm mx-auto">
            {selectedCategorySlug
              ? "There are currently no published pieces in this category."
              : "No pieces match your selected filter criteria."}
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="px-4 py-2 bg-[#FAF8F4] border border-[#D4C9BA] text-xs font-semibold uppercase tracking-wider text-[#24211E] hover:border-[#B08D57]"
            >
              Reset Filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
