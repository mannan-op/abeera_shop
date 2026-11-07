import Link from "next/link";

import { CmsImage } from "@/components/media/cms-image";
import type { HomepageTile } from "@abeera/shared";

export function FeaturedCollections({ tiles }: { tiles: HomepageTile[] }) {
  return (
    <section
      id="collections"
      aria-label="Featured collections"
      className="scroll-mt-24 bg-background px-[var(--gutter)] pt-[clamp(2.75rem,6vw,4rem)] pb-[clamp(2rem,5vw,3.5rem)]"
    >
      <div className="mx-auto grid max-w-[1440px] gap-5 md:grid-cols-3 md:gap-6">
        {tiles.map((tile, index) => (
          <Link
            key={`${tile.href}-${tile.title}-${index}`}
            href={tile.href}
            className="group flex flex-col overflow-hidden rounded-[1.25rem] bg-paper text-ink shadow-[0_1px_0_rgba(26,22,19,0.06)] ring-1 ring-border/70 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(26,22,19,0.08)]"
          >
            <div className="relative aspect-3/4 overflow-hidden bg-blush">
              <CmsImage
                src={tile.imageUrl}
                alt={tile.imageAlt}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/35 via-transparent to-transparent opacity-80" />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3 px-5 py-5 md:px-6 md:py-6">
              <div>
                <p className="kicker text-champagne">{tile.label}</p>
                <h2 className="mt-2 font-serif text-[1.7rem] leading-none font-normal tracking-[0.02em] md:text-[1.95rem]">
                  {tile.title}
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.14em] text-muted-foreground uppercase transition-colors group-hover:text-champagne">
                Explore
                <span aria-hidden className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}