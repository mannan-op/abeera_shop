import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/sections/reveal";
import { IMG } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function CampaignTile({
  href,
  image,
  title,
  className,
  sizes,
}: {
  href: string;
  image: string;
  title: string;
  className?: string;
  sizes: string;
}) {
  return (
    <Link href={href} className={cn("group relative block min-h-[22rem] overflow-hidden md:min-h-[34rem]", className)}>
      <Image
        src={image}
        alt=""
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes={sizes}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-[#14110e]/70 via-[#14110e]/10 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
        <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-ivory md:text-sm">
          {title}
        </p>
        <span className="mt-2 inline-block text-[11px] uppercase tracking-[0.18em] text-ivory underline underline-offset-4">
          Shop now
        </span>
      </div>
    </Link>
  );
}

export function CampaignThree() {
  const tiles = [
    { href: "/category/stitched-suits", image: IMG.collectionDresses, title: "Stitched Suits" },
    { href: "/category/new-arrivals", image: IMG.collectionNew, title: "New Arrivals" },
    { href: "/category/accessories", image: IMG.collectionOuter, title: "Accessories" },
  ];

  return (
    <section id="campaigns" className="grid scroll-mt-[7.5rem] grid-cols-1 md:grid-cols-3">
      {tiles.map((tile) => (
        <CampaignTile
          key={tile.href}
          {...tile}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ))}
    </section>
  );
}

export function TypeInterlude() {
  return (
    <section className="px-5 py-16 text-center md:px-10 md:py-24">
      <p className="kicker">The craft</p>
      <h2 className="mt-4 font-serif text-3xl uppercase tracking-[0.12em] md:text-5xl">
        Rooted in heritage. Made for today.
      </h2>
    </section>
  );
}

export function CampaignTwo() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <CampaignTile
        href="/category/stitched-suits"
        image={IMG.banner}
        title="Stitched Collection"
        sizes="(max-width: 768px) 100vw, 50vw"
        className="md:min-h-[40rem]"
      />
      <CampaignTile
        href="/about"
        image={IMG.story}
        title="Our Story"
        sizes="(max-width: 768px) 100vw, 50vw"
        className="md:min-h-[40rem]"
      />
    </section>
  );
}

export function CampaignFour() {
  const tiles = [
    { href: "/category/stitched-suits", image: IMG.collectionAccessories, title: "Stitched Suits" },
    { href: "/category/accessories", image: IMG.topWhiteA, title: "Accessories" },
    { href: "/category/sale", image: IMG.blazerA, title: "Sale" },
    { href: "/shop", image: IMG.atelier, title: "Shop All" },
  ];

  return (
    <Reveal>
      <section className="grid grid-cols-2 md:grid-cols-4">
        {tiles.map((tile) => (
          <CampaignTile
            key={tile.href}
            {...tile}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="min-h-[16rem] md:min-h-[22rem]"
          />
        ))}
      </section>
    </Reveal>
  );
}

export function BrandStrip() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
      <p className="kicker">Our heritage</p>
      <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
        Abeera began in Lahore — lawn from Faisalabad, chiffon from Gujranwala, zardozi from artisans who have stitched for generations. Every piece carries a story.
      </p>
      <Link
        href="/about"
        className="mt-8 inline-block text-[11px] uppercase tracking-[0.18em] underline underline-offset-4"
      >
        Read our story
      </Link>
    </section>
  );
}
