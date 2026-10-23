import Image from "next/image";
import Link from "next/link";

import { IMG } from "@/lib/catalog";

const moments = [
  {
    href: "/category/new-arrivals",
    title: "New arrivals",
    copy: "Just landed for the season.",
    image: IMG.collectionNew,
    alt: "New arrivals",
  },
  {
    href: "/category/stitched-suits",
    title: "Stitched suits",
    copy: "Ready silhouettes, refined finish.",
    image: IMG.hero,
    alt: "Stitched suits",
  },
  {
    href: "/shop?sort=featured",
    title: "Bestsellers",
    copy: "Most-loved across the house.",
    image: IMG.gallery4,
    alt: "Bestsellers",
  },
  {
    href: "/category/accessories",
    title: "Accessories",
    copy: "Finishing pieces for the look.",
    image: IMG.goldJewel,
    alt: "Accessories",
  },
] as const;

export function MomentRail() {
  return (
    <section id="rail" aria-labelledby="moment-title" className="py-[clamp(3.5rem,8vw,6.5rem)] pl-[clamp(1.25rem,4vw,4.5rem)]">
      <div className="mx-auto mb-9 flex max-w-[1440px] flex-wrap items-end justify-between gap-4 pr-[clamp(1.25rem,4vw,4.5rem)]">
        <div>
          <p className="kicker">Shop by moment</p>
          <h2 id="moment-title" className="mt-2 font-serif text-[length:var(--text-title)] leading-[1.05] font-normal">
            Find your edit
          </h2>
          <p className="mt-2 max-w-[36ch] text-muted-foreground">
            Clear paths into the catalog — Sapphire-style rails, Abeera voice.
          </p>
        </div>
        <Link
          href="/shop"
          className="border-b border-champagne pb-0.5 text-[0.7rem] tracking-[0.14em] uppercase hover:text-espresso"
        >
          View all pieces
        </Link>
      </div>
      <div className="mx-auto flex max-w-[1440px] gap-4 overflow-x-auto pr-[clamp(1.25rem,4vw,4.5rem)] snap-x snap-mandatory [scrollbar-color:var(--champagne)_transparent]">
        {moments.map((moment) => (
          <Link key={moment.href} href={moment.href} className="w-[min(70vw,280px)] shrink-0 snap-start">
            <div className="relative mb-3.5 aspect-4/5 overflow-hidden bg-blush">
              <Image src={moment.image} alt={moment.alt} fill className="object-cover" sizes="280px" />
            </div>
            <h3 className="font-serif text-xl font-normal">{moment.title}</h3>
            <p className="mt-1 mb-2.5 text-sm text-muted-foreground">{moment.copy}</p>
            <span className="border-b border-champagne pb-0.5 text-[0.7rem] tracking-[0.14em] uppercase">Shop now</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
