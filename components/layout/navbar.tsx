"use client";

import Link from "next/link";
import * as React from "react";
import { MenuIcon, SearchIcon, ShoppingBagIcon, UserIcon } from "lucide-react";

import { useShop } from "@/lib/store/shop";
import { cn } from "@/lib/utils";

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { cartCount, setCartOpen, setSearchOpen, setNavOpen } = useShop();
  const [pastHero, setPastHero] = React.useState(false);
  const onPhoto = overlay && !pastHero;

  React.useEffect(() => {
    if (!overlay) return;

    const onScroll = () => {
      const hero = document.getElementById("home-hero");
      const bottom = hero ? hero.getBoundingClientRect().bottom : 0;
      setPastHero(bottom < 72);
    };

    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [overlay]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,color,border-color] duration-400",
        onPhoto
          ? "border-b border-transparent bg-transparent text-paper"
          : "border-b border-gold-line/35 bg-background/94 text-ink backdrop-blur-md",
      )}
    >
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-[clamp(1.25rem,4vw,4.5rem)] md:h-[4.5rem]">
        <div className="flex items-center gap-1 md:gap-5">
          <button
            type="button"
            aria-label="Open menu"
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              onPhoto ? "hover:bg-paper/10" : "hover:bg-ink/5",
            )}
            onClick={() => setNavOpen(true)}
          >
            <MenuIcon className="size-[1.1rem]" strokeWidth={1.35} />
          </button>
          <Link
            href="/#collections"
            className="hidden text-[0.7rem] font-medium tracking-[0.12em] uppercase opacity-85 hover:opacity-100 md:inline"
          >
            Collections
          </Link>
        </div>

        <Link href="/" className="font-serif text-[1.65rem] leading-none font-normal tracking-[0.06em] md:text-[1.85rem]">
          Abeera
        </Link>

        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            className="hidden h-10 items-center px-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase opacity-85 hover:opacity-100 md:inline-flex"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </button>
          <button
            type="button"
            aria-label="Search"
            className={cn(
              "flex size-10 items-center justify-center rounded-full md:hidden",
              onPhoto ? "hover:bg-paper/10" : "hover:bg-ink/5",
            )}
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="size-[1.1rem]" strokeWidth={1.35} />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className={cn(
              "hidden size-10 items-center justify-center rounded-full md:flex",
              onPhoto ? "hover:bg-paper/10" : "hover:bg-ink/5",
            )}
          >
            <UserIcon className="size-[1.1rem]" strokeWidth={1.35} />
          </Link>
          <button
            type="button"
            aria-label={`Open bag, ${cartCount} items`}
            className={cn(
              "flex h-10 items-center gap-1 rounded-full px-2",
              onPhoto ? "hover:bg-paper/10" : "hover:bg-ink/5",
            )}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBagIcon className="size-[1.1rem]" strokeWidth={1.35} />
            <span className="text-[0.65rem] tabular-nums tracking-wide">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
