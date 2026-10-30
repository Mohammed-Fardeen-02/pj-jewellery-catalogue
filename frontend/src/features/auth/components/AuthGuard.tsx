"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  redirectTo = "/admin/login",
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  if (isLoading) {
    return (
      fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#B08D57] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#716B64]">
              Verifying Atelier Credentials...
            </p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
