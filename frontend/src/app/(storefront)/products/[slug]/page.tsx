import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productApi } from "@/features/products/api/product.api";
import { ProductDetailView } from "@/components/storefront/product-detail-view";


export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productApi.getPublicBySlug(slug);
    if (!product) return { title: "Piece Not Found" };

    return {
      title: `${product.title} — PJ High Jewellery`,
      description:
        product.description ||
        `Explore the authentic ${product.title} in the PJ Jewellery Catalogue.`,
    };
  } catch {
    return { title: "Haute Jewellery Piece — PJ" };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  let product = null;
  try {
    product = await productApi.getPublicBySlug(slug);
  } catch (err) {
    console.error("Failed to load product detail by slug:", slug, err);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <ProductDetailView product={product} />
    </div>
  );
}
