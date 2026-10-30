import * as React from "react";
import Link from "next/link";
import { Gem, FolderTree, Sparkles, CheckCircle2, Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const publishedCount = MOCK_PRODUCTS.filter((p) => p.is_published).length;
  const draftCount = MOCK_PRODUCTS.length - publishedCount;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Atelier Overview"
        subtitle="Manage the PJ single-brand high jewellery catalogue, categories, and AI-assisted metadata curation."
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button size="sm">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Jewellery Piece
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
              Total Pieces
            </span>
            <Gem className="w-4 h-4 text-[#B08D57]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#24211E] font-medium">
              {MOCK_PRODUCTS.length}
            </div>
            <p className="text-[11px] text-[#716B64] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">Preview metric</span>
              &middot; Live catalogue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
              Categories
            </span>
            <FolderTree className="w-4 h-4 text-[#B08D57]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#24211E] font-medium">
              {MOCK_CATEGORIES.length}
            </div>
            <p className="text-[11px] text-[#716B64] mt-1">
              Rings, Necklaces, Earrings, Bracelets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
              Published Status
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#24211E] font-medium">
              {publishedCount}
            </div>
            <p className="text-[11px] text-[#716B64] mt-1">
              Live on storefront ({draftCount} draft)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wider text-[#716B64] font-medium">
              AI Enrichment
            </span>
            <Sparkles className="w-4 h-4 text-[#B08D57]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#24211E] font-medium">Ready</div>
            <p className="text-[11px] text-[#716B64] mt-1">
              AI Tagging &amp; Description Engine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Catalogue Management Section */}
      <Card className="bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0EAE2]">
          <div>
            <CardTitle>Recent Catalogue Masterpieces</CardTitle>
            <CardDescription>
              Registered jewellery pieces currently stored in the catalogue database.
            </CardDescription>
          </div>
          <Link
            href="/admin/products"
            className="text-xs uppercase tracking-wider text-[#B08D57] hover:text-[#24211E] font-medium inline-flex items-center gap-1 transition-colors"
          >
            Manage All Products
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[#E8E1D8] text-[11px] uppercase tracking-wider text-[#716B64]">
                <tr>
                  <th className="py-3 px-6 font-semibold">SKU</th>
                  <th className="py-3 px-6 font-semibold">Title</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Primary Specs</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE2]">
                {MOCK_PRODUCTS.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF8F4]/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-[#716B64] font-medium">
                      {product.sku}
                    </td>
                    <td className="py-4 px-6 font-serif text-sm font-medium text-[#24211E]">
                      {product.title}
                    </td>
                    <td className="py-4 px-6 text-[#716B64]">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="py-4 px-6 text-[#716B64]">
                      {product.attributes.metal || "18K Gold"}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={product.is_published ? "success" : "outline"}>
                        {product.is_published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="text-[11px] text-[#B08D57] hover:underline font-medium"
                      >
                        Preview &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
