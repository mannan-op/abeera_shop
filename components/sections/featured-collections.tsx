import Image from "next/image";
import Link from "next/link";

import { IMG } from "@/lib/catalog";

const tiles = [
  {
    href: "/search?q=festive",
    title: "Festive Edit",
    label: "Shop the line",
    image: IMG.festivePortrait,
    alt: "Festive embroidered formal",
  },
  {
    href: "/search?q=lawn",
    title: "Everyday Pret",
    label: "Ready to wear",
    image: IMG.collectionDresses,
    alt: "Everyday pret silhouette",
  },
  {
    href: "/category/stitched-suits",
    title: "Formals",
    label: "Evening & occasion",
    image: IMG.bridalDetail,
    alt: "Formal occasion detail",
  },
] as const;

export function FeaturedCollections() {
  return (
    <section id="collections" aria-label="Featured collections" className="mx-auto grid max-w-[1440px] md:grid-cols-3">
      {tiles.map((tile) => (
        <Link key={tile.title} href={tile.href} className="group relative aspect-3/4 overflow-hidden bg-espresso text-paper">
          <Image
            src={tile.image}
            alt={tile.alt}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-ink/80 via-ink/10 to-transparent p-7">
            <h2 className="font-serif text-[1.85rem] leading-none font-normal">{tile.title}</h2>
            <span className="mt-1 text-[0.65rem] tracking-[0.16em] text-champagne-soft uppercase">{tile.label}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
