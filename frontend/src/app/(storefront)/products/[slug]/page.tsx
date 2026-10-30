import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShieldCheck, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Piece Not Found" };

  return {
    title: product.title,
    description: product.description || `Explore ${product.title} in the PJ Jewellery Catalogue.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.is_primary) || product.images[0]
      : null;

  const imageSrc = primaryImage?.storage_path || "/images/placeholder-ring.svg";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#716B64] hover:text-[#24211E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalogue
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Product Visual Presentation */}
        <div className="lg:col-span-7">
          <div className="aspect-4/5 w-full bg-white border border-[#E8E1D8] relative p-6">
            <div className="relative w-full h-full bg-[#FAF8F4] overflow-hidden">
              <Image
                src={imageSrc}
                alt={product.title}
                fill
                priority
                className="object-contain p-8"
              />
            </div>
          </div>
        </div>

        {/* Product Specifications & Details */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="gold">{product.category?.name || "Haute Jewellery"}</Badge>
              <span className="text-xs text-[#716B64] font-mono">SKU: {product.sku}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#24211E] font-normal leading-snug">
              {product.title}
            </h1>
            <div className="mt-3">
              {product.price ? (
                <span className="text-2xl font-serif text-[#24211E] font-medium">
                  ${product.price.toLocaleString()}
                </span>
              ) : (
                <span className="text-sm text-[#716B64] italic">Price available upon private enquiry</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-[#E8E1D8] pt-4">
            <h3 className="text-xs uppercase tracking-wider text-[#716B64] font-semibold mb-2">
              Piece Overview
            </h3>
            <p className="text-sm text-[#24211E] leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Jewellery Attributes Specifications */}
          <div className="border-t border-[#E8E1D8] pt-4 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[#716B64] font-semibold">
              Specifications &amp; Gemology
            </h3>
            <div className="bg-white border border-[#E8E1D8] divide-y divide-[#F0EAE2] text-xs">
              {Object.entries(product.attributes).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2.5 px-3.5">
                  <span className="text-[#716B64] capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-medium text-[#24211E] text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-[#E8E1D8] pt-6 space-y-3">
            <Button size="lg" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Request Private Viewing
            </Button>
            <p className="text-[11px] text-[#716B64] text-center">
              Private consultations available at our flagship salon or via encrypted digital appointment.
            </p>
          </div>

          {/* Assurance guarantees */}
          <div className="bg-[#FAF8F4] border border-[#E8E1D8] p-4 flex items-center gap-3 text-xs text-[#716B64]">
            <ShieldCheck className="w-5 h-5 text-[#B08D57] shrink-0" />
            <span>Includes Atelier PJ Certificate of Authenticity and comprehensive valuation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
