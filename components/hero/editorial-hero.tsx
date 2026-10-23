import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IMG } from "@/lib/catalog";

export function EditorialHero() {
  return (
    <section
      id="home-hero"
      aria-label="Eid Collection"
      className="relative -mt-16 flex min-h-[min(94vh,900px)] items-end overflow-hidden bg-espresso text-paper md:-mt-[4.5rem]"
    >
      <div className="absolute inset-0">
        <Image
          src={IMG.heroEid}
          alt="Woman in an embroidered cream festive ensemble, Abeera Eid Collection"
          fill
          priority
          className="animate-hero-in object-cover object-[center_18%]"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,17,14,0.55)_0%,rgba(20,17,14,0.12)_24%,transparent_40%),linear-gradient(105deg,rgba(20,17,14,0.72)_0%,rgba(20,17,14,0.2)_48%,rgba(20,17,14,0.45)_100%)]"
        />
      </div>
      <div className="animate-rise relative z-[1] mx-auto w-full max-w-[1440px] px-[clamp(1.25rem,4vw,4.5rem)] pb-[clamp(3.25rem,8vw,5.5rem)]">
        <p className="mb-4 text-[0.65rem] font-medium tracking-[0.22em] text-champagne-soft uppercase">Eid · Lahore</p>
        <h1 className="max-w-[11ch] font-serif text-[length:var(--text-display)] leading-[0.94] font-normal">
          Woven with <em className="text-champagne-soft italic">tradition & grace</em>
        </h1>
        <p className="mt-6 flex items-center gap-3 text-[0.65rem] tracking-[0.2em] text-paper/70 uppercase">
          <span aria-hidden className="h-px w-7 bg-gold-line" />
          Lahore · Contemporary pret
        </p>
        <p className="mt-6 max-w-[34ch] text-[1.02rem] leading-relaxed text-paper/90">
          A Pakistani womenswear house for celebration and the everyday — lawn, chiffon, and stitched silhouettes
          with an international fashion-house calm.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="light">
            <Link href="/shop">Explore the Collection</Link>
          </Button>
          <Button asChild variant="overlay">
            <Link href="/search?q=lawn">Shop unstitched</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
