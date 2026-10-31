import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { categoryApi } from "@/features/categories/api/category.api";
import { productApi } from "@/features/products/api/product.api";
import type { CategoryPublicResponse } from "@/features/categories/types/category.types";
import type { ProductPublicResponse } from "@/features/products/types/product.types";


interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await categoryApi.getPublicBySlug(slug);
    if (!category) return { title: "Category Not Found — PJ Haute Joaillerie" };

    return {
      title: `${category.name} Collection — PJ Haute Joaillerie`,
      description: category.description || `Browse handcrafted ${category.name} in the PJ Jewellery Catalogue.`,
    };
  } catch {
    return { title: "Haute Jewellery Collection — PJ" };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let category: CategoryPublicResponse | null = null;
  let products: ProductPublicResponse[] = [];

  try {
    const [catRes, prodRes] = await Promise.all([
      categoryApi.getPublicBySlug(slug),
      productApi.listPublic({ category_slug: slug, limit: 50 }),
    ]);
    category = catRes;
    products = prodRes?.items || [];
  } catch (err) {
    console.error("Failed to load category data for slug:", slug, err);
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#716B64] hover:text-[#24211E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Jewellery
        </Link>
      </div>

      <PageHeader
        title={`${category.name} Collection`}
        subtitle={category.description || "Handcrafted master pieces from the PJ atelier."}
        breadcrumbs={
          <span>
            <Link href="/" className="hover:underline">Home</Link> &nbsp;/&nbsp;{" "}
            <Link href="/products" className="hover:underline">Catalogue</Link> &nbsp;/&nbsp;{" "}
            <span>{category.name}</span>
          </span>
        }
      />

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${category.name} Currently Active`}
          description="Pieces in this collection are presently reserved or undergoing studio finishing."
          action={
            <Link
              href="/products"
              className="text-xs uppercase tracking-wider text-[#B08D57] hover:underline font-medium"
            >
              Browse other jewellery collections &rarr;
            </Link>
          }
        />
      )}
    </div>
  );
}
