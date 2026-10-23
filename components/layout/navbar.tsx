"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon, MenuIcon, SearchIcon, ShoppingBagIcon, UserIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { categories as catalogCategories, collections } from "@/lib/catalog/products";
import type { Category } from "@/lib/catalog/types";
import { useShop } from "@/lib/store/shop";
import { cn } from "@/lib/utils";

const collectionCopy = [
  {
    title: "New Arrivals",
    href: "/category/new-arrivals",
    description: "Fresh prints and embroideries for the season.",
  },
  {
    title: "Best Sellers",
    href: "/shop?sort=featured",
    description: "The pieces our customers love most.",
  },
  {
    title: "Sale",
    href: "/category/sale",
    description: "Previous-season pieces at reduced prices.",
  },
];

const textLink =
  "inline-flex h-10 items-center px-3 text-[15px] font-normal normal-case tracking-normal text-foreground transition-colors hover:text-primary";

export function Navbar({ categories: categorySource }: { categories?: Category[] }) {
  const { cartCount, wishlist, setCartOpen, setSearchOpen, setNavOpen } = useShop();
  const featured = collections[0];
  const categories = (categorySource ?? catalogCategories).filter(
    (category) => category.slug !== "new-arrivals" && category.slug !== "sale",
  );

  return (
    <header className="border-b border-border/80 bg-background/95 text-foreground backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-3 items-center gap-2 px-3 md:h-[4.5rem] md:px-10">
        <div className="flex items-center md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setNavOpen(true)}
          >
            <MenuIcon className="size-5" />
          </button>
        </div>

        <nav className="hidden items-center md:flex" aria-label="Primary">
          <Link href="/shop" className={textLink}>
            Shop
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-[15px] font-normal normal-case tracking-normal hover:text-primary">
                  Collections
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[640px] grid-cols-[1fr_220px] gap-8">
                    <ul className="flex flex-col justify-center">
                      {collectionCopy.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="block px-2 py-3 text-foreground normal-case tracking-normal"
                            >
                              <span className="block font-serif text-xl font-normal normal-case tracking-normal">
                                {item.title}
                              </span>
                              <span className="mt-1 block text-sm font-normal normal-case tracking-normal text-muted-foreground">
                                {item.description}
                              </span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                      {categories.slice(0, 3).map((category) => (
                        <li key={category.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/category/${category.slug}`}
                              className="block px-2 py-2 text-sm normal-case tracking-normal text-foreground"
                            >
                              {category.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                    <NavigationMenuLink asChild>
                      <Link href={featured.href} className="group block text-foreground">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                          <Image
                            src={featured.image}
                            alt={featured.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="220px"
                          />
                        </div>
                        <p className="kicker mt-3">{featured.name}</p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Link href="/about" className={textLink}>
            About
          </Link>
        </nav>

        <Link
          href="/"
          className="justify-self-center font-serif text-[1.85rem] leading-none tracking-[0.12em] text-foreground md:text-[2.45rem]"
        >
          Abeera
        </Link>

        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            aria-label="Search"
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="size-5" />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden size-11 items-center justify-center rounded-full hover:bg-muted md:flex"
          >
            <UserIcon className="size-5" />
          </Link>
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className={cn(
              "relative size-11 items-center justify-center rounded-full hover:bg-muted",
              "hidden md:flex",
            )}
          >
            <HeartIcon className="size-5" />
            {wishlist.length > 0 ? (
              <span className="absolute top-1.5 right-1.5 min-w-4 rounded-full bg-primary px-1 text-center text-[9px] text-primary-foreground">
                {wishlist.length}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={`Open bag, ${cartCount} items`}
            className="relative flex size-11 items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBagIcon className="size-5" />
            <span className="absolute top-1.5 right-1 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-primary-foreground">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
