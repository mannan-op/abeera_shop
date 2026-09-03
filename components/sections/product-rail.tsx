import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { Reveal } from "@/components/sections/reveal";
import type { Product } from "@/lib/catalog/types";

export function ProductRail({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: Product[];
}) {
  return (
    <Reveal>
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">{eyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">{title}</h2>
          </div>
          <Link href={href} className="hidden kicker md:inline">
            View all
          </Link>
        </div>
        <div className="mt-12 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {products.map((product) => (
            <div key={product.id} className="min-w-[72%] md:min-w-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <Link href={href} className="kicker mt-6 inline-block md:hidden">
          View all
        </Link>
      </section>
    </Reveal>
  );
}
