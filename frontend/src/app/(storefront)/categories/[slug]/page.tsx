import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return MOCK_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Collection`,
    description: category.description || `Browse handcrafted ${category.name} in the PJ Jewellery Catalogue.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Filter products matching category
  const products = MOCK_PRODUCTS.filter((p) => p.category_id === category.id);

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
