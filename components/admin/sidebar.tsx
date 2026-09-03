"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3Icon, BoxIcon, LogOutIcon, ShoppingCartIcon } from "lucide-react";

import { logoutAction } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3Icon },
  { href: "/admin/products", label: "Products", icon: BoxIcon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCartIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col bg-[#1a1613] text-ivory">
      <div className="px-6 py-6">
        <Link href="/admin" className="font-serif text-2xl tracking-wide">
          Abeera
        </Link>
        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ivory/50">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-ivory/10 text-ivory"
                  : "text-ivory/60 hover:bg-ivory/5 hover:text-ivory",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
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
