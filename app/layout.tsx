import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteShell } from "@/components/layout/site-shell";
import { getCategories } from "@/lib/catalog";
import { isComingSoon } from "@/lib/coming-soon";
import { isCatalogApiRequired, isSampleCatalogPreview } from "@/lib/catalog/source";
import type { Category } from "@/lib/catalog/types";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://abeera.example"),
  title: {
    default: "Abeera — Pakistani Women's Clothing",
    template: "%s — Abeera",
  },
  description:
    "Abeera is a Pakistani women's clothing brand offering stitched suits, formals, and accessories with craftsmanship rooted in tradition.",
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Abeera",
    title: "Abeera — Pakistani Women's Clothing",
    description:
      "Stitched suits, formals, and accessories with craftsmanship rooted in tradition.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isComingSoon()) {
    return (
      <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }

  const sampleCatalog = isSampleCatalogPreview();
  const categories: Category[] | null = isCatalogApiRequired() ? await getCategories() : null;

  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <SiteShell categories={categories} sampleCatalog={sampleCatalog}>
            {children}
          </SiteShell>
        </Providers>
      </body>
    </html>
  );
}
