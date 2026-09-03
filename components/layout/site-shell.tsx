"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchDialog } from "@/components/search/search-dialog";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const checkout = pathname.startsWith("/checkout");
  const admin = pathname.startsWith("/admin");
  const home = pathname === "/";
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    if (!home) {
      setScrolled(false);
      return;
    }
    function onScroll() {
      setScrolled(window.scrollY > 32);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home]);

  if (checkout || admin) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div
        className={cn(
          "z-50",
          home ? "fixed inset-x-0 top-0" : "sticky top-0",
        )}
      >
        <AnnouncementBar />
        <Navbar inverted={home && !scrolled} />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchDialog />
      <MobileNav />
    </div>
  );
}
