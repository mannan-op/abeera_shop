import type { Metadata } from "next";
import { Instrument_Serif, Outfit } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteShell } from "@/components/layout/site-shell";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://abeera.example"),
  title: {
    default: "Abeera — Contemporary Fashion",
    template: "%s — Abeera",
  },
  description:
    "Abeera is a contemporary fashion house of considered silhouettes, natural fabrics, and an editorial approach to everyday dressing.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Abeera",
    title: "Abeera — Contemporary Fashion",
    description:
      "Considered silhouettes, natural fabrics, and an editorial approach to everyday dressing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${instrument.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
