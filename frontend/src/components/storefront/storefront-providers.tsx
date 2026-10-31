"use client";

import * as React from "react";
import { CartProvider } from "@/context/cart-context";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StorefrontCheckoutModal } from "@/components/storefront/storefront-checkout-modal";

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <StorefrontCheckoutModal />
    </CartProvider>
  );
}
