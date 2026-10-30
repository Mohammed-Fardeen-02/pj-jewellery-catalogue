import * as React from "react";
import { AuthProvider } from "@/features/auth";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
