"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Shield, Sparkles, ShoppingBag, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCart } from "@/context/cart-context";

import { categoryApi } from "@/features/categories/api/category.api";
import type { CategoryPublicResponse } from "@/features/categories/types/category.types";

export function StorefrontHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<CategoryPublicResponse[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();

  React.useEffect(() => {
    let mounted = true;
    categoryApi
      .listPublic()
      .then((cats) => {
        if (mounted && Array.isArray(cats)) {
          setCategories(cats);
        }
      })
      .catch((err) => {
        console.error("Failed to load header categories:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const navigation = [
    { name: "All Jewellery", href: "/products" },
    ...categories.map((cat) => ({
      name: cat.name,
      href: `/categories/${cat.slug}`,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#E8E1D8]">
      {/* Top Banner Notice */}
      <div className="bg-[#1A1816] text-[#E8E1D8] text-[11px] py-1.5 px-4 text-center tracking-widest uppercase font-sans">
        <span className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#B08D57]" />
          Single-Brand Haute Joaillerie Catalogue &mdash; Atelier PJ
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#24211E] hover:text-[#B08D57] focus:outline-none"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Wordmark / Logo */}
          <div className="flex-1 md:flex-none text-center md:text-left">
            <Link href="/" className="inline-block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57]">
              <span className="font-serif text-3xl tracking-widest text-[#24211E] font-medium group-hover:text-[#B08D57] transition-colors">
                PJ
              </span>
              <span className="block text-[9px] uppercase tracking-[0.35em] text-[#716B64] font-sans -mt-1 group-hover:text-[#9A7947] transition-colors">
                Haute Joaillerie
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-xs uppercase tracking-widest transition-colors py-1 relative font-medium",
                    isActive
                      ? "text-[#B08D57]"
                      : "text-[#24211E] hover:text-[#B08D57]"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B08D57]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search, Cart & Admin Link */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Header Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="hidden lg:flex items-center relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewellery..."
                className="w-32 focus:w-48 transition-all duration-300 pl-8 pr-2.5 py-1 text-xs bg-white/80 border border-[#DCD3C7] focus:border-[#B08D57] focus:bg-white focus:outline-none rounded-full text-[#24211E] placeholder:text-[#9A9388]"
              />
              <Search className="w-3.5 h-3.5 text-[#B08D57] absolute left-2.5 pointer-events-none" />
            </form>

            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-[#24211E] hover:text-[#B08D57] transition-colors flex items-center gap-1.5 focus:outline-none"
              aria-label={`View shopping bag with ${totalItems} items`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#24211E]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-bold text-white bg-[#B08D57] rounded-full shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs uppercase tracking-wider font-medium text-[#24211E]">
                Bag
              </span>
            </button>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#716B64] hover:text-[#24211E] border border-[#E8E1D8] hover:border-[#B08D57] transition-colors bg-white/60"
            >
              <Shield className="w-3.5 h-3.5 text-[#B08D57]" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E1D8] bg-[#FAF8F4] px-4 pt-2 pb-6 space-y-3">
          {/* Mobile Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setMobileMenuOpen(false);
                router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="relative w-full mb-3"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jewellery pieces..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DCD3C7] focus:border-[#B08D57] rounded-full text-[#24211E] placeholder:text-[#9A9388]"
            />
            <Search className="w-4 h-4 text-[#B08D57] absolute left-3 top-2.5 pointer-events-none" />
          </form>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm uppercase tracking-wider text-[#24211E] hover:text-[#B08D57] border-b border-[#F0EAE2] font-medium"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openCart();
              }}
              className="flex items-center justify-between py-2 text-xs uppercase tracking-wider text-[#24211E] border-b border-[#F0EAE2]"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#B08D57]" />
                Shopping Bag
              </span>
              <span className="font-bold text-[#B08D57] font-mono">({totalItems})</span>
            </button>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-xs uppercase tracking-wider text-[#B08D57]"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
