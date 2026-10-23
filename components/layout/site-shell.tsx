"use client";

import { usePathname } from "next/navigation";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { SearchDialog } from "@/components/search/search-dialog";
import type { Category } from "@/lib/catalog/types";

function SampleCatalogNotice() {
  return (
    <p
      role="status"
      className="bg-destructive px-4 py-2 text-center text-[12px] leading-snug text-ivory"
    >
      No catalog API is configured for this deploy, so the shop is showing the sample catalog
      from this repo. Set NEXT_PUBLIC_API_URL to read Postgres. Sample products are not used
      once that URL is set.
    </p>
  );
}

export function SiteShell({
  children,
  categories,
  sampleCatalog = false,
}: {
  children: React.ReactNode;
  categories?: Category[] | null;
  sampleCatalog?: boolean;
}) {
  const pathname = usePathname();
  const home = pathname === "/";
  const checkout = pathname.startsWith("/checkout");
  const admin = pathname.startsWith("/admin");

  if (checkout || admin) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {sampleCatalog ? <SampleCatalogNotice /> : null}
      <AnnouncementBar />
      <Navbar overlay={home} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFab />
      <CartDrawer />
      <SearchDialog />
      <MobileNav categories={categories ?? undefined} />
    </div>
  );
}
