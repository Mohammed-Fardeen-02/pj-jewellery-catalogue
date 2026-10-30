import Link from "next/link";
import { Shield } from "lucide-react";

export function StorefrontFooter() {
  return (
    <footer className="bg-[#1A1816] text-[#FAF8F4] mt-auto border-t border-[#312C28]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <span className="font-serif text-3xl tracking-widest text-[#FFFFFF] font-medium block">
              PJ
            </span>
            <p className="text-xs text-[#A8A29A] leading-relaxed max-w-xs font-sans">
              Dedicated to bespoke craftsmanship, ethically sourced rare gemstones, and sculptural jewellery design that endures generations.
            </p>
          </div>

          {/* Catalogue Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D5CEC5]">
              <li>
                <Link href="/categories/rings" className="hover:text-[#B08D57] transition-colors">
                  Haute Rings
                </Link>
              </li>
              <li>
                <Link href="/categories/necklaces" className="hover:text-[#B08D57] transition-colors">
                  Necklaces & Pendants
                </Link>
              </li>
              <li>
                <Link href="/categories/earrings" className="hover:text-[#B08D57] transition-colors">
                  Cascade Earrings
                </Link>
              </li>
              <li>
                <Link href="/categories/bracelets" className="hover:text-[#B08D57] transition-colors">
                  Articulated Bracelets
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#B08D57] transition-colors">
                  View Full Catalogue
                </Link>
              </li>
            </ul>
          </div>

          {/* Atelier Services */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-4">
              Atelier & Care
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D5CEC5]">
              <li className="hover:text-white transition-colors cursor-pointer">Bespoke Commissions</li>
              <li className="hover:text-white transition-colors cursor-pointer">Private Salon Consultations</li>
              <li className="hover:text-white transition-colors cursor-pointer">Gemological Certification</li>
              <li className="hover:text-white transition-colors cursor-pointer">Restoration & Maintenance</li>
            </ul>
          </div>

          {/* Legal & Administration */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-4">
              Governance
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D5CEC5]">
              <li>
                <Link href="/admin/login" className="hover:text-[#B08D57] transition-colors inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#B08D57]" />
                  Administrator Portal
                </Link>
              </li>
              <li className="text-[#888177] text-[11px] pt-2">
                Single-Brand Private Catalogue System
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom separator */}
        <div className="border-t border-[#2C2723] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#888177] gap-4">
          <p>&copy; 2026 PJ Fine Jewellery. All rights reserved.</p>
          <p className="tracking-wide">Crafted with precision &amp; AI-assisted curation.</p>
        </div>
      </div>
    </footer>
  );
}
