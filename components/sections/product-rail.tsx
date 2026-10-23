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
  if (products.length === 0) return null;

  return (
    <Reveal>
      <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
            <h2 className="mt-2 font-serif text-[length:var(--text-title)] leading-tight">{title}</h2>
          </div>
          <Link href={href} className="hidden text-sm text-primary underline-offset-4 hover:underline md:inline">
            View all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link href={href} className="mt-6 inline-block text-sm text-primary underline-offset-4 hover:underline md:hidden">
          View all
        </Link>
      </section>
    </Reveal>
  );
}
