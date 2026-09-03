import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/catalog/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="border border-border px-6 py-16 text-center">
        <p className="font-serif text-2xl">Nothing matches these filters</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Clear a filter, or browse the full atelier.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
