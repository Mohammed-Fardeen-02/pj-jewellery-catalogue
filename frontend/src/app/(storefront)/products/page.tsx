import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ProductCard } from "@/components/storefront/product-card";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "All Fine Jewellery",
  description: "Browse the complete PJ Jewellery catalogue of rings, necklaces, earrings, and bracelets.",
};

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        title="The Jewellery Catalogue"
        subtitle="Explore our complete bespoke collection. Each piece is crafted by hand in our atelier using ethically sourced metals and certified gemstones."
        breadcrumbs={
          <span>
            <Link href="/" className="hover:underline">Home</Link> &nbsp;/&nbsp; <span>Catalogue</span>
          </span>
        }
      />

      <div className="mb-8 flex items-center justify-between text-xs text-[#716B64] border-b border-[#E8E1D8] pb-3">
        <span>Showing {MOCK_PRODUCTS.length} curated catalogue pieces</span>
        <span className="italic">Single-Brand Private Collection</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
