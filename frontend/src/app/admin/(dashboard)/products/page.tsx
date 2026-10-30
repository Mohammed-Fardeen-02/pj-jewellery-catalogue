import * as React from "react";
import { Plus, Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Jewellery Products Master"
        subtitle="Catalogue of registered jewellery items, SKU identifiers, gemstone attributes, and publishing status."
        action={
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add New Piece
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E8E1D8]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#716B64] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search title, SKU, or tags..." className="pl-9 h-9 text-xs" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5" />
            Filter Status
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[#E8E1D8] text-[11px] uppercase tracking-wider text-[#716B64]">
                <tr>
                  <th className="py-3 px-6 font-semibold">SKU</th>
                  <th className="py-3 px-6 font-semibold">Title</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE2]">
                {MOCK_PRODUCTS.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF8F4]/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-[#716B64]">{product.sku}</td>
                    <td className="py-4 px-6 font-serif text-sm font-medium text-[#24211E]">
                      {product.title}
                    </td>
                    <td className="py-4 px-6 text-[#716B64]">{product.category?.name}</td>
                    <td className="py-4 px-6">
                      <Badge variant={product.is_published ? "success" : "outline"}>
                        {product.is_published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-[#FAF8F4] border border-[#E8E1D8] text-xs text-[#716B64] flex items-center justify-between">
        <span>Backend integration scheduled for Catalogue Domain Milestone.</span>
        <Badge variant="gold">CRUD Foundation Prepared</Badge>
      </div>
    </div>
  );
}
