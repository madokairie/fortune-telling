"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, MessageCircle, User, Settings } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/chat", label: "チャット", icon: MessageCircle },
  { href: "/profile", label: "性質", icon: User },
  { href: "/settings", label: "設定", icon: Settings },
] as const;

/**
 * Mobile bottom tab bar (visible below lg breakpoint)
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-border bg-card lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="tablist"
      aria-label="メインナビゲーション"
    >
      {navItems.map((item) => {
        const isActive = item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            aria-label={item.label}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors duration-150",
              isActive
                ? "text-brand-gold"
                : "text-brand-silver hover:text-brand-pearl"
            )}
          >
            <item.icon className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-[11px] font-medium leading-none">
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full bg-brand-gold"
                transition={{ type: "spring", stiffness: 500, damping: 35, duration: 0.2 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Desktop sidebar (visible at lg breakpoint and above)
 */
export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:border-r lg:border-border lg:bg-card"
      role="navigation"
      aria-label="メインナビゲーション"
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/10">
          <span className="font-heading text-sm font-bold text-brand-gold">
            FT
          </span>
        </div>
        <span className="font-heading text-base font-medium tracking-wide text-foreground">
          Fortune Telling
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "text-brand-gold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-lg bg-brand-gold/10"
                  transition={{ type: "spring", stiffness: 500, damping: 35, duration: 0.2 }}
                />
              )}
              <item.icon className="relative z-10 h-5 w-5" strokeWidth={1.5} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer brand */}
      <div className="border-t border-border px-6 py-4">
        <p className="font-heading-en text-xs tracking-widest text-muted-foreground uppercase">
          Fortune Telling
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">
          紫微斗数パーソナル鑑定
        </p>
      </div>
    </aside>
  );
}
