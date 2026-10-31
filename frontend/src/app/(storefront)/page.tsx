import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Gem, ShieldCheck, Compass, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { CategoryCard } from "@/components/storefront/category-card";
import { productApi } from "@/features/products/api/product.api";
import { categoryApi } from "@/features/categories/api/category.api";
import { StorefrontCatalogueExplorer } from "@/components/storefront/storefront-catalogue-explorer";
import type { CategoryPublicResponse } from "@/features/categories/types/category.types";
import type { ProductPublicResponse } from "@/features/products/types/product.types";


export const dynamic = "force-dynamic";

export default async function StorefrontHomePage() {
  let products: ProductPublicResponse[] = [];
  let categories: CategoryPublicResponse[] = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      productApi.listPublic({ limit: 50 }),
      categoryApi.listPublic(),
    ]);
    products = productsRes.items || [];
    categories = categoriesRes || [];
  } catch (err) {
    console.error("Storefront data fetch error:", err);
  }

  // Pick top hero highlight
  const heroProduct = products.length > 0 ? products[0] : null;
  const heroImage =
    heroProduct?.primary_image?.image_url ||
    (heroProduct?.images && heroProduct.images[0]?.image_url) ||
    "/images/hero-jewellery.svg";

  return (
    <div className="space-y-24 pb-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F2EB] to-[#FAF8F4] border-b border-[#E8E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#E8E1D8] text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
                Atelier PJ Fine Catalogue
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#24211E] tracking-tight font-normal leading-[1.08]">
                Timeless Artistry. <br />
                <span className="italic font-light text-[#9A7947]">Sculpted by Light.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#716B64] max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
                Discover the private fine jewellery collection of PJ. Every piece is an architectural dialogue between rare natural gems, ethical sourcing, and meticulous handcrafted metalwork.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Catalogue ({products.length} Pieces)
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                {categories.length > 0 && (
                  <Link href={`/products?category=${categories[0].slug}`}>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/50">
                      {categories[0].name}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-[#E8E1D8]/80 text-left">
                <div>
                  <span className="block font-serif text-xl sm:text-2xl text-[#24211E]">100%</span>
                  <span className="text-[11px] text-[#716B64] uppercase tracking-wider">Single-Brand</span>
                </div>
                <div>
                  <span className="block font-serif text-xl sm:text-2xl text-[#24211E]">Haute</span>
                  <span className="text-[11px] text-[#716B64] uppercase tracking-wider">Craftsmanship</span>
                </div>
                <div>
                  <span className="block font-serif text-xl sm:text-2xl text-[#24211E]">Ethical</span>
                  <span className="text-[11px] text-[#716B64] uppercase tracking-wider">Origin Verified</span>
                </div>
              </div>
            </div>

            {/* Hero Artwork Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 sm:aspect-square w-full max-w-lg mx-auto border border-[#E8E1D8] bg-white p-3 shadow-md group">
                <div className="relative w-full h-full bg-[#FAF8F4] overflow-hidden">
                  <Image
                    src={heroImage}
                    alt={heroProduct?.title || "PJ High Jewellery Signature Solitaire"}
                    fill
                    priority
                    unoptimized={heroImage.startsWith("/images/") || heroImage.endsWith(".svg")}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {heroProduct && (
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                      <span className="text-[10px] uppercase tracking-widest text-[#E8D4B0] block">Featured Masterpiece</span>
                      <h3 className="font-serif text-base font-normal truncate">{heroProduct.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold">${Number(heroProduct.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        <Link href={`/products/${heroProduct.slug}`} className="text-xs text-[#E8D4B0] underline hover:text-white transition-colors">
                          View Details &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Catalogue Explorer with Horizontal Category Badges & Live Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StorefrontCatalogueExplorer categories={categories} initialProducts={products} />
      </section>

      {/* 4. Brand Heritage & Story */}
      <section className="bg-white border-y border-[#E8E1D8] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-block text-[11px] tracking-[0.3em] uppercase text-[#B08D57] font-semibold">
              The Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#24211E] font-normal leading-tight">
              An Ode to Solitary Grace and Sculptural Purity
            </h2>
            <p className="text-sm text-[#716B64] font-sans leading-relaxed">
              At Atelier PJ, jewellery is never mass manufactured. We operate strictly as an independent high-jewellery house where precious metals and rare natural stones are elevated through architectural proportion and centuries-old lapidary expertise.
            </p>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-[#FAF8F4] border border-[#E8E1D8]">
                <Gem className="w-5 h-5 text-[#B08D57] mx-auto mb-2.5" />
                <h4 className="font-serif text-base text-[#24211E]">Curated Gemology</h4>
                <p className="text-xs text-[#716B64] mt-1 font-sans">Hand-selected for brilliance and distinct character.</p>
              </div>
              <div className="p-6 bg-[#FAF8F4] border border-[#E8E1D8]">
                <Compass className="w-5 h-5 text-[#B08D57] mx-auto mb-2.5" />
                <h4 className="font-serif text-base text-[#24211E]">Bespoke Dimensions</h4>
                <p className="text-xs text-[#716B64] mt-1 font-sans">Crafted to harmonize with personal posture and movement.</p>
              </div>
              <div className="p-6 bg-[#FAF8F4] border border-[#E8E1D8]">
                <ShieldCheck className="w-5 h-5 text-[#B08D57] mx-auto mb-2.5" />
                <h4 className="font-serif text-base text-[#24211E]">Verified Pedigree</h4>
                <p className="text-xs text-[#716B64] mt-1 font-sans">Every master piece registered under unique catalogue SKU.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
