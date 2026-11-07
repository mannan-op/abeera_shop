"use client";

import type { SiteSettings } from "@abeera/shared";
import Link from "next/link";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { categories as memoryCategories } from "@/lib/catalog/products";
import type { Category } from "@/lib/catalog/types";
import { useShop } from "@/lib/store/shop";

export function MobileNav({
  categories,
  navigation,
}: {
  categories?: Category[];
  navigation: SiteSettings["navigation"];
}) {
  const { navOpen, setNavOpen } = useShop();
  const navCategories = categories ?? memoryCategories;
  const close = () => setNavOpen(false);
  const primary = navigation.primary.filter((l) => l.visible);
  const secondary = navigation.secondary.filter((l) => l.visible);

  return (
    <Sheet open={navOpen} onOpenChange={setNavOpen}>
      <SheetContent side="left" className="w-[min(100%,22rem)] overflow-y-auto bg-background p-8">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <p className="font-serif text-[1.85rem] font-normal tracking-[0.06em]">Abeera</p>
        {navigation.tagline ? (
          <p className="mt-2 text-[0.65rem] tracking-[0.16em] text-champagne uppercase">{navigation.tagline}</p>
        ) : null}
        <nav className="mt-10 flex flex-col gap-4">
          {primary.map((link) => (
            <Link key={`p-${link.href}-${link.label}`} href={link.href} className="font-serif text-2xl" onClick={close}>
              {link.label}
            </Link>
          ))}
          {navigation.showCategories
            ? navCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="font-serif text-2xl text-foreground/85"
                  onClick={close}
                >
                  {category.name}
                </Link>
              ))
            : null}
          {secondary.map((link, i) => (
            <Link key={`s-${link.href}-${link.label}`} href={link.href} className={i === 0 ? "mt-6 text-sm" : "text-sm"} onClick={close}>
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
