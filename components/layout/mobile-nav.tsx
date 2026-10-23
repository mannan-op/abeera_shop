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
      <SheetContent side="left" className="w-[min(100%,22rem)] overflow-y-auto bg-background p-8">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <p className="font-serif text-3xl tracking-[0.08em]">Abeera</p>
        <p className="mt-2 text-sm text-muted-foreground">Lahore</p>
        <nav className="mt-10 flex flex-col gap-4">
          <Link href="/shop" className="font-serif text-2xl" onClick={() => setNavOpen(false)}>
            Shop
          </Link>
          {navCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="font-serif text-2xl text-foreground/85"
              onClick={() => setNavOpen(false)}
            >
              {category.name}
            </Link>
          ))}
          <Link href="/about" className="mt-6 text-sm" onClick={() => setNavOpen(false)}>
            About
          </Link>
          <Link href="/contact" className="text-sm" onClick={() => setNavOpen(false)}>
            Contact
          </Link>
          <Link href="/account" className="text-sm" onClick={() => setNavOpen(false)}>
            Account
          </Link>
          <Link href="/account/wishlist" className="text-sm" onClick={() => setNavOpen(false)}>
            Wishlist
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
