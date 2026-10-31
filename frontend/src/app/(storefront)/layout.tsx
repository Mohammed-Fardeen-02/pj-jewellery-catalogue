import * as React from "react";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontProviders } from "@/components/storefront/storefront-providers";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StorefrontProviders>
      <div className="min-h-screen flex flex-col bg-[#FAF8F4]">
        <StorefrontHeader />
        <main className="flex-1">{children}</main>
        <StorefrontFooter />
      </div>
    </StorefrontProviders>
  );
}
