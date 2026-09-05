"use client";

import { ProductRail } from "@/components/sections/product-rail";
import { getProductByIdSync } from "@/lib/catalog/queries";
import { useShop } from "@/lib/store/shop";

export function RecentlyViewed({ currentId }: { currentId: string }) {
  const { recentlyViewed } = useShop();
  const products = recentlyViewed
    .filter((id) => id !== currentId)
    .map((id) => getProductByIdSync(id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .slice(0, 4);

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
