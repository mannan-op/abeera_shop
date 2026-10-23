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
    <section className="grid bg-paper md:grid-cols-2">
      <div className="relative min-h-[460px]">
        <Image
          src={IMG.banner}
          alt="Abeera festive campaign"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col justify-center px-[clamp(1.25rem,4vw,4.5rem)] py-[clamp(2.5rem,6vw,5rem)]">
        <p className="kicker">The House</p>
        <h2 className="mt-4 max-w-[16ch] font-serif text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.05] font-normal">
          A Lahore house for lawn, chiffon, zardozi, and stitched pret
        </h2>
        <p className="mt-5 max-w-[38ch] text-muted-foreground">
          Made for Eid, weddings, and the days in between.
        </p>
        <p className="mt-4 max-w-[38ch] text-muted-foreground">
          Abeera began in Lahore. Lawn comes from Faisalabad, chiffon from mills we trust, and zardozi from artisans
          who have stitched for generations. The collection stays small on purpose.
        </p>
        <Button asChild className="mt-8 w-fit">
          <Link href="/about">About Abeera</Link>
        </Button>
      </div>
    </section>
  );
}
