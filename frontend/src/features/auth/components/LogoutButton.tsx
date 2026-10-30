"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "../hooks/useAuth";

export interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  redirectTo?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  redirectTo = "/admin/login",
  showIcon = true,
  className,
  children,
  onClick,
  ...props
}: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    logout();
    toast.info("Session ended successfully.");
    if (onClick) {
      onClick(e);
    }
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        "inline-flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      {showIcon && <LogOut className="w-3.5 h-3.5" />}
      {children || <span>Sign Out</span>}
    </button>
  );
}
