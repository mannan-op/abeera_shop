"use client";

import Link from "next/link";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { categories as memoryCategories } from "@/lib/catalog/products";
import type { Category } from "@/lib/catalog/types";
import { useShop } from "@/lib/store/shop";

export function MobileNav({ categories }: { categories?: Category[] }) {
  const { navOpen, setNavOpen } = useShop();
  const navCategories = categories ?? memoryCategories;

  return (
    <Sheet open={navOpen} onOpenChange={setNavOpen}>
      <SheetContent side="left" className="w-[min(100%,22rem)] bg-background p-8">
        <SheetTitle>Menu</SheetTitle>
        <nav className="mt-12 flex flex-col gap-5">
          <Link
            href="/shop"
            className="text-sm uppercase tracking-[0.18em]"
            onClick={() => setNavOpen(false)}
          >
            Shop
          </Link>
          {navCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="text-sm uppercase tracking-[0.18em] text-foreground/80"
              onClick={() => setNavOpen(false)}
            >
              {category.name}
            </Link>
          ))}
          <Link href="/about" className="mt-6 kicker" onClick={() => setNavOpen(false)}>
            The House
          </Link>
          <Link href="/account" className="kicker" onClick={() => setNavOpen(false)}>
            Account
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
