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
  Boxes,
  ShoppingBag,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronRightSquare,
  Sparkles,
  Server,
  Database,
  Radio,
} from "lucide-react";
import { LogoutButton } from "@/features/auth";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAVIGATION: NavItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Jewellery Products", href: "/admin/products", icon: Gem },
  { name: "Vault Stock", href: "/admin/stock", icon: Boxes },
  { name: "Customer Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Atelier Analytics", href: "/admin/analytics", icon: TrendingUp },
  { name: "Categories Master", href: "/admin/categories", icon: FolderTree },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
];

function SidebarNav({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", isCollapsed ? "p-2" : "p-4")}>
      {NAVIGATION.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            title={isCollapsed ? item.name : undefined}
            className={cn(
              "flex items-center transition-all duration-200 group relative",
              isCollapsed
                ? "justify-center py-3 px-0 rounded hover:bg-[#23201D]"
                : "gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-medium",
              isActive
                ? isCollapsed
                  ? "bg-[#272320] text-[#B08D57] shadow-inner"
                  : "bg-[#272320] text-[#B08D57] border-l-2 border-[#B08D57]"
                : "text-[#A8A29A] hover:bg-[#23201D] hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "shrink-0 transition-transform duration-200",
                isCollapsed ? "w-5 h-5 group-hover:scale-110" : "w-4 h-4",
                isActive ? "text-[#B08D57]" : "text-[#888177] group-hover:text-white"
              )}
            />
            {!isCollapsed && <span>{item.name}</span>}

            {/* Tooltip in collapsed mode on desktop */}
            {isCollapsed && (
              <span className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-[#1A1816] text-[#FAF8F4] text-xs uppercase tracking-wider rounded shadow-xl border border-[#2C2723] whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function getBreadcrumbs(pathname: string): Array<{ label: string; href?: string }> {
  const crumbs: Array<{ label: string; href?: string }> = [{ label: "Admin", href: "/admin" }];

  if (pathname === "/admin") {
    crumbs.push({ label: "Overview" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/products")) {
    crumbs.push({ label: "Jewellery Products", href: "/admin/products" });
    if (pathname === "/admin/products/new") {
      crumbs.push({ label: "New Piece" });
    } else if (pathname.includes("/edit")) {
      crumbs.push({ label: "Edit Piece" });
    }
    return crumbs;
  }

  if (pathname.startsWith("/admin/stock")) {
    crumbs.push({ label: "Vault Stock", href: "/admin/stock" });
    if (pathname === "/admin/stock/adjust") {
      crumbs.push({ label: "Adjust Stock" });
    } else if (pathname === "/admin/stock/alerts") {
      crumbs.push({ label: "Shortage Alerts" });
    }
    return crumbs;
  }

  if (pathname.startsWith("/admin/orders")) {
    crumbs.push({ label: "Customer Orders", href: "/admin/orders" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/analytics")) {
    crumbs.push({ label: "Atelier Analytics", href: "/admin/analytics" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/categories")) {
    crumbs.push({ label: "Categories Master", href: "/admin/categories" });
    return crumbs;
  }

  if (pathname.startsWith("/admin/settings")) {
    crumbs.push({ label: "System Settings", href: "/admin/settings" });
    return crumbs;
  }

  return crumbs;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Sync collapsed state with localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("pj_admin_sidebar_collapsed");
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pj_admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const breadcrumbs = React.useMemo(() => getBreadcrumbs(pathname), [pathname]);

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
          "fixed inset-y-0 left-0 z-50 bg-[#1A1816] text-[#FAF8F4] flex flex-col justify-between transition-all duration-300 ease-in-out lg:static border-r border-[#2C2723]",
          isCollapsed ? "w-20" : "w-64",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div>
          {/* Header & Logo with PJ Toggle Feature */}
          <div
            className={cn(
              "h-20 flex items-center border-b border-[#2C2723] transition-all",
              isCollapsed ? "justify-center px-2" : "justify-between px-6"
            )}
          >
            {isCollapsed ? (
              // In collapsed mode: Clicking the PJ Logo expands the sidebar back to full width!
              <button
                type="button"
                onClick={handleToggleCollapse}
                title="Click PJ Logo to expand sidebar"
                className="group flex flex-col items-center justify-center p-2 rounded hover:bg-[#272320] transition-colors"
              >
                <span className="font-serif text-2xl tracking-widest text-[#B08D57] group-hover:text-white font-medium transition-colors">
                  PJ
                </span>
                <span className="text-[8px] uppercase tracking-tighter text-[#888177] group-hover:text-[#B08D57]">
                  Expand
                </span>
              </button>
            ) : (
              // In expanded mode: Logo links to admin, plus dedicated collapse button
              <>
                <Link href="/admin" className="flex items-center gap-2.5">
                  <span className="font-serif text-2xl tracking-widest text-white font-medium">
                    PJ
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#B08D57] font-semibold border-l border-[#3E3832] pl-2.5">
                    Dashboard
                  </span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleToggleCollapse}
                    title="Collapse sidebar (w-20)"
                    className="hidden lg:flex items-center justify-center w-7 h-7 rounded text-[#888177] hover:text-white hover:bg-[#272320] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="lg:hidden text-[#888177] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Navigation Links wrapped in Suspense for Next.js PPR */}
          <React.Suspense fallback={<div className="p-4 space-y-2" />}>
            <SidebarNav
              isCollapsed={isCollapsed}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </React.Suspense>
        </div>

        {/* Sidebar Footer */}
        <div className={cn("border-t border-[#2C2723] space-y-2", isCollapsed ? "p-2" : "p-4")}>
          <Link
            href="/"
            target="_blank"
            title={isCollapsed ? "Public Storefront" : undefined}
            className={cn(
              "flex items-center text-xs text-[#888177] hover:text-white transition-colors rounded",
              isCollapsed
                ? "justify-center py-2.5 hover:bg-[#23201D]"
                : "justify-between px-3.5 py-2"
            )}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 shrink-0 text-[#B08D57]" />
              {!isCollapsed && <span>Public Storefront</span>}
            </span>
            {!isCollapsed && (
              <span className="text-[10px] tracking-wider uppercase text-[#B08D57]">Live</span>
            )}
          </Link>

          {isCollapsed ? (
            <LogoutButton
              title="Sign out of Admin Session"
              className="w-full flex items-center justify-center py-2.5 text-rose-400 hover:text-rose-300 hover:bg-[#23201D] rounded transition-colors"
            >
              {null}
            </LogoutButton>
          ) : (
            <LogoutButton className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors" />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Breadcrumbs & Session Info */}
        <header className="h-20 bg-white border-b border-[#E8E1D8] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 lg:hidden text-[#24211E] hover:text-[#B08D57]"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label}>
                    {idx > 0 && <span className="text-[#C5BCB1]">/</span>}
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="text-[#716B64] hover:text-[#B08D57] transition-colors font-medium"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isLast ? "font-semibold text-[#24211E]" : "text-[#716B64]"}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs bg-[#FAF8F4] px-3 py-1.5 rounded-full border border-[#E8E1D8]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#24211E] font-medium hidden sm:inline">
                Admin Session Active
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#8C6D37] hover:text-[#24211E] font-medium transition-colors"
            >
              <span>View Boutique</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="w-8 h-8 rounded-full bg-[#FAF8F4] border border-[#E8E1D8] flex items-center justify-center font-serif text-xs font-semibold text-[#B08D57] shadow-xs">
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
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <React.Suspense
            fallback={<div className="p-8 text-center text-xs text-[#716B64]">Loading view...</div>}
          >
            {children}
          </React.Suspense>
        </main>

        {/* Polished Admin Footer with System Status */}
        <footer className="mt-auto border-t border-[#E8E1D8] bg-white px-4 sm:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#716B64]">
            <div className="flex items-center gap-4">
              <span className="font-serif font-medium text-[#24211E]">
                PJ High Jewellery Atelier &amp; Vault
              </span>
              <span className="hidden sm:inline text-[#C5BCB1]">•</span>
              <span className="text-[11px]">Catalogue Master &amp; Inventory Ledger</span>
            </div>

            {/* System Status Indicators */}
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>FastAPI Backend v1.0</span>
              </div>
              <span className="text-[#C5BCB1]">•</span>
              <div className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-[#B08D57]" />
                <span>Vault DB Synced</span>
              </div>
              <span className="text-[#C5BCB1]">•</span>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-blue-500" />
                <span>Cloudinary CDN</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
