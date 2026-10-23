import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { Lookbook } from "@/components/sections/lookbook";
import type { Product } from "@/lib/catalog/types";

export function ProductGrid({
  products,
  empty = "filters",
}: {
  products: Product[];
  empty?: "filters" | "catalog";
}) {
  if (products.length === 0 && empty === "catalog") {
    return (
      <Lookbook
        title="Nothing on the rails yet"
        lede="The catalog is quiet for the moment. The house is still here — lawn, chiffon, zardozi, and the Eid edit, dressed in Lahore."
      />
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
        <p className="font-serif text-3xl">Nothing matches this edit</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Clear a filter, or start again from the full collection.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <Link href="/shop" className="text-primary underline-offset-4 hover:underline">
            Shop all
          </Link>
          <Link href="/category/stitched-suits" className="text-primary underline-offset-4 hover:underline">
            Stitched suits
          </Link>
          <Link href="/category/new-arrivals" className="text-primary underline-offset-4 hover:underline">
            New arrivals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
