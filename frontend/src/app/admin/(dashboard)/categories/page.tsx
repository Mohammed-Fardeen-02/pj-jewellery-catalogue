import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories Master"
        subtitle="Catalogue classification hierarchy for luxury rings, necklaces, earrings, and bracelets."
        action={
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Category
          </Button>
        }
      />

      <Card className="bg-white">
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F4] border-b border-[#E8E1D8] text-[11px] uppercase tracking-wider text-[#716B64]">
              <tr>
                <th className="py-3 px-6 font-semibold">Name</th>
                <th className="py-3 px-6 font-semibold">Slug</th>
                <th className="py-3 px-6 font-semibold">Description</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE2]">
              {MOCK_CATEGORIES.map((category) => (
                <tr key={category.id} className="hover:bg-[#FAF8F4]/60 transition-colors">
                  <td className="py-4 px-6 font-serif text-sm font-medium text-[#24211E]">
                    {category.name}
                  </td>
                  <td className="py-4 px-6 font-mono text-[#716B64]">{category.slug}</td>
                  <td className="py-4 px-6 text-[#716B64] max-w-xs truncate">
                    {category.description}
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={category.is_active ? "success" : "outline"}>
                      {category.is_active ? "Active" : "Archived"}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
