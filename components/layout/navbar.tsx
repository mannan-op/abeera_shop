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
import { getCategories, getCollections } from "@/lib/catalog";
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

export function Navbar({ inverted = false }: { inverted?: boolean }) {
  const { cartCount, wishlist, setCartOpen, setSearchOpen, setNavOpen } = useShop();
  const collections = getCollections();
  const featured = collections[0];
  const categories = getCategories().filter(
    (category) => category.slug !== "new-arrivals" && category.slug !== "sale",
  );

  const iconHover = inverted ? "hover:bg-white/10" : "hover:bg-muted/70";

  return (
    <header
      className={cn(
        "border-b transition-colors duration-300",
        inverted
          ? "border-transparent bg-transparent text-ivory"
          : "border-border/60 bg-background/95 text-foreground backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center gap-4 px-5 md:h-20 md:px-10">
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className={cn("flex size-11 items-center justify-center", iconHover)}
            onClick={() => setNavOpen(true)}
          >
            <MenuIcon className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Search"
            className={cn("flex size-11 items-center justify-center", iconHover)}
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="size-5" />
          </button>
        </div>

        <Link
          href="/"
          className={cn(
            "font-serif text-[1.85rem] leading-none tracking-[0.14em] md:mr-8",
            inverted && "text-gold",
          )}
        >
          Abeera
        </Link>

        <nav className="hidden flex-1 justify-center md:flex">
          <NavigationMenu className={cn(inverted && "text-ivory")}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={inverted ? "text-ivory hover:text-gold" : undefined}>
                  Collections
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[640px] grid-cols-[1fr_240px] gap-8">
                    <ul className="flex flex-col justify-center">
                      {collectionCopy.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className="block px-2 py-3 text-foreground normal-case tracking-normal"
                            >
                              <span className="block font-serif text-xl font-normal tracking-normal normal-case">
                                {item.title}
                              </span>
                              <span className="mt-1 block text-sm font-normal tracking-normal text-muted-foreground normal-case">
                                {item.description}
                              </span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                    <NavigationMenuLink asChild>
                      <Link href={featured.href} className="group block text-foreground">
                        <div className="relative aspect-3/4 overflow-hidden">
                          <Image
                            src={featured.image}
                            alt={featured.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="240px"
                          />
                        </div>
                        <p className="kicker mt-3">{featured.name}</p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {categories.slice(0, 4).map((category) => (
                <NavigationMenuItem key={category.slug}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/category/${category.slug}`}
                      className={cn(
                        "inline-flex h-10 items-center px-3",
                        inverted && "text-ivory hover:text-gold",
                      )}
                    >
                      {category.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/category/sale"
                    className="inline-flex h-10 items-center px-3 text-gold"
                  >
                    Sale
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="ml-auto flex items-center justify-end gap-0.5">
          <button
            type="button"
            aria-label="Search"
            className={cn("hidden size-11 items-center justify-center md:flex", iconHover)}
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="size-5" />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className={cn("hidden size-11 items-center justify-center md:flex", iconHover)}
          >
            <UserIcon className="size-5" />
          </Link>
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className={cn("relative flex size-11 items-center justify-center", iconHover)}
          >
            <HeartIcon className="size-5" />
            {wishlist.length > 0 ? (
              <span
                className={cn(
                  "absolute top-1.5 right-1.5 min-w-4 rounded-full px-1 text-center text-[9px]",
                  inverted ? "bg-ivory text-primary" : "bg-primary text-primary-foreground",
                )}
              >
                {wishlist.length}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Open bag"
            className={cn("relative flex size-11 items-center justify-center", iconHover)}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBagIcon className="size-5" />
            <span
              className={cn(
                "absolute top-1.5 right-1.5 min-w-4 rounded-full px-1 text-center text-[9px]",
                cartCount > 0
                  ? inverted
                    ? "bg-ivory text-primary"
                    : "bg-primary text-primary-foreground"
                  : inverted
                    ? "text-ivory/70"
                    : "text-muted-foreground",
              )}
            >
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
