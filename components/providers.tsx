"use client";

import { ShopProvider } from "@/lib/store/shop";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      {children}
      <Toaster />
    </ShopProvider>
  );
}
