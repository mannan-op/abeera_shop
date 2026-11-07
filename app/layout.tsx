import type { Metadata } from "next";
import { Average, Work_Sans } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteShell } from "@/components/layout/site-shell";
import { getCategories, getSaleBanner } from "@/lib/catalog";
import { isComingSoon } from "@/lib/coming-soon";
import { isCatalogApiRequired, isSampleCatalogPreview } from "@/lib/catalog/source";
import type { Category } from "@/lib/catalog/types";
import { getSiteSettings, whatsappDigits } from "@/lib/site/settings";

import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const average = Average({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});



// Render on each request so catalog data is read from the API when a request arrives.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  return {
    metadataBase: new URL("https://abeera.example"),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.description,
    openGraph: {
      type: "website",
      locale: "en_PK",
      siteName: "Abeera",
      title: seo.defaultTitle,
      description: seo.shareDescription,
      ...(seo.shareImage ? { images: [seo.shareImage] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isComingSoon()) {
    return (
      <html lang="en" className={`${workSans.variable} ${average.variable}`}>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }

  const sampleCatalog = isSampleCatalogPreview();
  const [categories, settings, saleBanner] = await Promise.all([
    isCatalogApiRequired() ? getCategories() : Promise.resolve<Category[] | null>(null),
    getSiteSettings(),
    getSaleBanner(),
  ]);

  return (
    <html lang="en" className={`${workSans.variable} ${average.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <SiteShell
            categories={categories}
            sampleCatalog={sampleCatalog}
            settings={settings}
            whatsapp={whatsappDigits(settings)}
            saleBanner={saleBanner}
          >
            {children}
          </SiteShell>
        </Providers>
      </body>
    </html>
  );
}
