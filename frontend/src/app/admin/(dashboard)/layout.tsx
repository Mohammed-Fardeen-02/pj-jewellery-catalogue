"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gem,
  FolderTree,
  Settings,
  ExternalLink,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";
import { LogoutButton } from "@/features/auth";
import { cn } from "@/lib/utils/cn";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const navigation = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Jewellery Products", href: "/admin/products", icon: Gem },
    { name: "Categories Master", href: "/admin/categories", icon: FolderTree },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1816] text-[#FAF8F4] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-[#2C2723]",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Header & Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#2C2723]">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="font-serif text-2xl tracking-widest text-white font-medium">PJ</span>
              <span className="text-[10px] uppercase tracking-widest text-[#B08D57] font-semibold border-l border-[#3E3832] pl-2.5">
                Dashboard
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-[#888177] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors",
                    isActive
                      ? "bg-[#272320] text-[#B08D57] border-l-2 border-[#B08D57]"
                      : "text-[#A8A29A] hover:bg-[#23201D] hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2C2723] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 text-xs text-[#888177] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Storefront
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#B08D57]">Live</span>
          </Link>

          <LogoutButton className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-[#E8E1D8] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 lg:hidden text-[#24211E] hover:text-[#B08D57]"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xs uppercase tracking-widest text-[#716B64] font-semibold hidden sm:inline">
              PJ High Jewellery Management Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#24211E] font-medium hidden sm:inline">Admin Session Active</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F4] border border-[#E8E1D8] flex items-center justify-center font-serif text-xs font-semibold text-[#B08D57]">
              PJ
            </div>
          </div>
        </header>

        {/* Security Boundary Notice */}
        <div className="bg-[#FAF0E6] border-b border-[#EADAC5] px-4 sm:px-8 py-2 text-[11px] text-[#8C6E3D] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            <strong>Architectural Boundary:</strong> This UI shell visualizes administrative controls. Strict authorization and permissions are validated independently by FastAPI backend endpoints on every query.
          </span>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
