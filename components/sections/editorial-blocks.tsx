import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/sections/reveal";
import { IMG } from "@/lib/catalog";

export function EditorialBanner() {
  return (
    <Reveal>
      <section className="relative min-h-[36rem] overflow-hidden md:min-h-[44rem]">
        <Image
          src={IMG.banner}
          alt=""
          fill
          className="object-cover scale-105"
          sizes="100vw"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-[#14110e]/75 via-[#14110e]/40 to-transparent" />
        <div className="relative mx-auto flex min-h-[36rem] max-w-[1440px] flex-col justify-center px-5 py-16 text-ivory md:min-h-[44rem] md:px-10">
          <p className="kicker text-gold">Lookbook</p>
          <h2 className="mt-5 max-w-xl font-serif text-5xl leading-[1.02] md:text-7xl">
            The dress that <em className="italic text-gold">does not perform.</em>
          </h2>
          <Button asChild variant="light" className="mt-10 w-fit">
            <Link href="/category/dresses">Shop dresses</Link>
          </Button>
        </div>
      </section>
    </Reveal>
  );
}

export function CategoryStrip() {
  const items = [
    { href: "/category/dresses", label: "Dresses" },
    { href: "/category/tops", label: "Tops" },
    { href: "/category/bottoms", label: "Bottoms" },
    { href: "/category/outerwear", label: "Outerwear" },
    { href: "/category/accessories", label: "Accessories" },
  ];
  return (
    <Reveal>
      <section className="border-y border-border/80 bg-card/40">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-10 md:px-10">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-serif text-2xl text-foreground/70 transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

export function BrandStory() {
  return (
    <Reveal>
      <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-10 md:py-32">
        <div className="relative aspect-4/5 overflow-hidden">
          <Image src={IMG.heroEid} alt="Embroidered festive ensemble from Abeera" fill className="object-cover" sizes="50vw" />
        </div>
        <div className="max-w-lg">
          <p className="kicker">The house</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
            Fewer pieces. <em className="italic text-gold">Better cloth.</em>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            Abeera began in Lahore. Lawn from Faisalabad, chiffon from mills we trust, zardozi from hands that have stitched for generations. The edit stays small so every suit can be finished properly.
          </p>
          <Button asChild variant="outline" className="mt-10">
            <Link href="/about">Read the story</Link>
          </Button>
        </div>
      </section>
    </Reveal>
  );
}
