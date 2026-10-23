import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { Reveal } from "@/components/sections/reveal";
import type { Product } from "@/lib/catalog/types";

export function ProductRail({
  eyebrow,
  title,
  href,
  products,
  lede,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: Product[];
  lede?: string;
}) {
  if (products.length === 0) return null;

  return (
    <Reveal>
      <section className="mx-auto max-w-[1440px] px-[clamp(1.25rem,4vw,4.5rem)] py-[clamp(3.5rem,8vw,6.5rem)]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
            <h2 className="mt-2 font-serif text-[length:var(--text-title)] leading-[1.05] font-normal">{title}</h2>
            {lede ? <p className="mt-2 max-w-[36ch] text-muted-foreground">{lede}</p> : null}
          </div>
          <Link
            href={href}
            className="border-b border-champagne pb-0.5 text-[0.7rem] tracking-[0.14em] uppercase hover:text-espresso"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-[clamp(1.1rem,2.2vw,1.85rem)] lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </Reveal>
  );
}
