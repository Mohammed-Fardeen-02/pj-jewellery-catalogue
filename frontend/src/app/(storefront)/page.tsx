import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Gem, ShieldCheck, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { CategoryCard } from "@/components/storefront/category-card";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";

export default function StorefrontHomePage() {
  const featuredProducts = MOCK_PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-24 pb-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F2EB] to-[#FAF8F4] border-b border-[#E8E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-[#E8E1D8] text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
                Atelier PJ Catalogue
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#24211E] tracking-tight font-normal leading-[1.08]">
                Timeless Artistry. <br />
                <span className="italic font-light text-[#9A7947]">Sculpted by Light.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#716B64] max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
                Discover the private fine jewellery collection of PJ. Every piece is an architectural dialogue between rare natural gems and meticulous handcrafted metalwork.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Catalogue
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/categories/rings">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/50">
                    Bespoke Rings
                  </Button>
                </Link>
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
              <div className="relative aspect-4/3 sm:aspect-square w-full max-w-lg mx-auto border border-[#E8E1D8] bg-white p-3 shadow-sm">
                <div className="relative w-full h-full bg-[#FAF8F4] overflow-hidden">
                  <Image
                    src="/images/hero-jewellery.svg"
                    alt="PJ High Jewellery Signature Solitaire"
                    fill
                    priority
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Collections / Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#E8E1D8]">
          <div>
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold block mb-1">
              Curated Masterworks
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#24211E]">
              Browse by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs uppercase tracking-widest text-[#716B64] hover:text-[#B08D57] font-semibold mt-3 md:mt-0 transition-colors"
          >
            All Collections &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 3. Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#E8E1D8]">
          <div>
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#B08D57] font-semibold block mb-1">
              Current Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#24211E]">
              Signature Catalogue Pieces
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs uppercase tracking-widest text-[#716B64] hover:text-[#B08D57] font-semibold mt-3 md:mt-0 transition-colors"
          >
            View All ({MOCK_PRODUCTS.length}) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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

      {/* 5. Phase 1 Architecture Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 bg-[#F6F3EE] border border-[#E8E1D8] text-xs text-[#716B64] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-[#24211E] uppercase tracking-wider block font-semibold mb-0.5">
              Frontend Foundation Status
            </strong>
            <span>
              This storefront demonstrates typography, layout, design tokens, and typed models. Products shown are illustrative mock data awaiting Catalogue Domain Milestone backend activation.
            </span>
          </div>
          <Link href="/admin/login" className="shrink-0">
            <Button variant="outline" size="sm" className="bg-white">
              Inspect Admin Shell
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
