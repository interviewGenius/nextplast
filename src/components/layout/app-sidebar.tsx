"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, PanelLeftClose, PanelLeft, X } from "lucide-react";
import { logout } from "@/features/auth/lib/logout";
import { Logo, CoinIcon } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { logoutNavItem, type NavItem } from "@/constants/navigation";
import { getNavIcon } from "@/components/layout/nav-icons";
import { formatCoin, coinsToInternalInr, formatInr } from "@/utils/coin";

interface AppSidebarProps {
  items: NavItem[];
  coinBalance?: number;
  title?: string;
}

/**
 * Collapsible app sidebar — desktop sticky + mobile sheet overlay.
 * Matches Frontend Design AppShell navigation patterns.
 */
export function AppSidebar({ items, coinBalance, title }: AppSidebarProps) {
  const pathname = usePathname();
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } =
    useSidebarStore();
  const LogOutIcon = getNavIcon(logoutNavItem.icon);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    void logout().catch(() => setLoggingOut(false));
  };

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-0.5 px-3 py-4">
      {title ? (
        <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
          {title}
        </p>
      ) : null}
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = getNavIcon(item.icon);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/10 text-primary shadow-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && (
              <span className="flex-1 text-left">{item.title}</span>
            )}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-busy={loggingOut}
        className={cn(
          "text-muted-foreground mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-60 dark:hover:bg-red-950",
          collapsed && "justify-center px-2",
        )}
      >
        {loggingOut ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin" />
        ) : (
          <LogOutIcon className="h-[18px] w-[18px]" />
        )}
        {!collapsed && (loggingOut ? "Logging out…" : logoutNavItem.title)}
      </button>
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "border-border bg-card sticky top-0 hidden h-screen flex-col border-r transition-all duration-300 lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="border-border flex h-16 items-center justify-between border-b px-4">
          {!collapsed ? (
            <Link href="/">
              <Logo size={28} />
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <Logo size={28} className="[&>span]:hidden" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapsed}
            className={cn(collapsed && "mx-auto")}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <NavList />
        </ScrollArea>
        {!collapsed && typeof coinBalance === "number" ? (
          <div className="border-border border-t p-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-950 dark:to-teal-950">
              <div className="mb-1 flex items-center gap-2">
                <CoinIcon size={20} />
                <span className="font-display font-bold">
                  {formatCoin(coinBalance)}
                </span>
                <span className="text-muted-foreground text-xs">coins</span>
              </div>
              <p className="text-muted-foreground text-xs">
                ≈ {formatInr(coinsToInternalInr(coinBalance))} reward value
              </p>
            </div>
          </div>
        ) : null}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <div className="animate-fade-in fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="border-border bg-card animate-slide-up absolute top-0 bottom-0 left-0 flex w-72 flex-col border-r">
            <div className="border-border flex h-16 items-center justify-between border-b px-4">
              <Logo size={28} />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <NavList onNavigate={() => setMobileOpen(false)} />
            </ScrollArea>
          </aside>
        </div>
      ) : null}
    </>
  );
}
