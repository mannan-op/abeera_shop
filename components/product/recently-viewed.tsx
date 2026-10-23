"use client";

import { ProductRail } from "@/components/sections/product-rail";
import { useCatalogProducts } from "@/lib/catalog/use-products";
import { useShop } from "@/lib/store/shop";

export function RecentlyViewed({ currentId }: { currentId: string }) {
  const { recentlyViewed } = useShop();
  const ids = recentlyViewed.filter((id) => id !== currentId).slice(0, 4);
  const products = useCatalogProducts(ids);

  if (products.length === 0) return null;

  return (
    <ProductRail
      eyebrow="Recently viewed"
      title="Return to these"
      href="/shop"
      products={products}
    />
  );
}
