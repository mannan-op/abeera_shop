"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  BoxIcon,
  ImageIcon,
  LayoutGridIcon,
  LogOutIcon,
  MessageSquareIcon,
  PanelsTopLeftIcon,
  SettingsIcon,
  ShoppingCartIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";

import { logoutAction } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Store",
    items: [
      { href: "/admin", label: "Dashboard", icon: BarChart3Icon },
      { href: "/admin/homepage", label: "Homepage", icon: PanelsTopLeftIcon },
      { href: "/admin/shop-page", label: "Shop page", icon: StoreIcon },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: BoxIcon },
      { href: "/admin/categories", label: "Categories", icon: LayoutGridIcon },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCartIcon },
      { href: "/admin/customers", label: "Customers", icon: UsersIcon },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareIcon, badge: "reviews" as const },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/admin/settings", label: "Site settings", icon: SettingsIcon }],
  },
];

export function AdminSidebar({ pendingReviews = 0 }: { pendingReviews?: number }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-[#1a1613] text-ivory">
      <div className="px-6 py-6">
        <Link href="/admin" className="font-serif text-2xl tracking-wide">
          Abeera
        </Link>
        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ivory/50">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[10px] tracking-[0.18em] text-ivory/35 uppercase">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const badge = "badge" in item && item.badge === "reviews" && pendingReviews > 0 ? pendingReviews : null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-ivory/10 text-ivory" : "text-ivory/60 hover:bg-ivory/5 hover:text-ivory",
                    )}
                  >
                    <item.icon className="size-4" />
                    <span className="flex-1">{item.label}</span>
                    {badge ? (
                      <span className="rounded-full bg-[#b08d57] px-1.5 text-[10px] font-medium text-[#1a1613]" aria-label={`${badge} waiting`}>
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ivory/10 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ivory/60 transition-colors hover:bg-ivory/5 hover:text-ivory"
          >
            <LogOutIcon className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
