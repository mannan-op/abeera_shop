import Link from "next/link";

import { CmsImage } from "@/components/media/cms-image";
import type { HomepageTile } from "@abeera/shared";

export function FeaturedCollections({ tiles }: { tiles: HomepageTile[] }) {
  return (
    <section id="collections" aria-label="Featured collections" className="mx-auto grid max-w-[1440px] md:grid-cols-3">
      {tiles.map((tile, index) => (
        <Link
          key={`${tile.href}-${tile.title}-${index}`}
          href={tile.href}
          className="group relative aspect-3/4 overflow-hidden bg-espresso text-paper"
        >
          <CmsImage
            src={tile.imageUrl}
            alt={tile.imageAlt}
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
