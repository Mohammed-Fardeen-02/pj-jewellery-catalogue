import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, API_V1_PREFIX } from "@/lib/api/endpoints";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Architecture &amp; Settings"
        subtitle="Configuration parameters, backend integration URLs, and single-brand catalogue metadata."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>API Connection &amp; Gateway</CardTitle>
            <CardDescription>Target backend endpoints configured in runtime environment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#F0EAE2]">
              <span className="text-[#716B64]">API Base URL:</span>
              <span className="font-mono text-[#24211E]">{API_BASE_URL}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EAE2]">
              <span className="text-[#716B64]">API Version Prefix:</span>
              <span className="font-mono text-[#24211E]">{API_V1_PREFIX}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EAE2]">
              <span className="text-[#716B64]">Database Driver:</span>
              <span className="text-[#24211E]">SQLAlchemy 2.0 Async (asyncpg)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#716B64]">Auth Scheme:</span>
              <span className="text-[#24211E]">JWT Bearer + Argon2</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Single-Brand Catalogue Boundary</CardTitle>
            <CardDescription>Brand scope configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#F0EAE2]">
              <span className="text-[#716B64]">Catalogue Mode:</span>
              <Badge variant="gold">Single-Brand Private Atelier</Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EAE2]">
              <span className="text-[#716B64]">Brand Identity:</span>
              <span className="text-[#24211E]">PJ Fine Jewellery</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#716B64]">Multi-Tenant Isolation:</span>
              <span className="text-[#716B64]">Omitted by design</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
