"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DASHBOARD_NAV_ITEMS,
  getDashboardActiveKey,
} from "@/components/local/dashboard/dashboardNavConfig";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const activeKey = getDashboardActiveKey(pathname, hash);

  return (
    <nav
      aria-label="Navegación del dashboard"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-default/80 bg-surface/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(16,24,40,0.08)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end gap-2">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium text-text-muted transition-colors",
                  isActive && !item.primary && "bg-primary-soft/70 text-primary",
                  item.primary &&
                    "-mt-4 rounded-2xl border border-primary/15 bg-primary px-3 py-2 text-white shadow-lg shadow-primary/30"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    item.primary && "h-5 w-5",
                    !item.primary && isActive && "text-primary",
                    !item.primary && !isActive && "group-hover:text-text-primary"
                  )}
                  aria-hidden="true"
                />
                <span className={cn(item.primary && "text-xs font-semibold")}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
