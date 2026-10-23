import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IMG } from "@/lib/catalog";

export function EditorialHero() {
  return (
    <section className="bg-background" aria-label="Eid Collection">
      <div className="mx-auto grid max-w-[1280px] items-center gap-6 px-5 py-8 md:grid-cols-2 md:gap-10 md:px-10 md:py-12 lg:gap-16">
        <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-blush md:aspect-[6/5]">
          <Image
            src={IMG.heroEid}
            alt="Woman in an embroidered cream festive ensemble, Abeera Eid Collection"
            fill
            priority
            className="object-cover object-[center_20%]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="max-w-xl md:py-6">
          <h1 className="font-serif text-[length:var(--text-display)] leading-[1.05] text-foreground">
            Eid Collection · Lahore
          </h1>
          <p className="mt-4 font-serif text-[length:var(--text-lead)] italic text-foreground/80 md:text-3xl">
            Woven with tradition & grace
          </p>
          <Button asChild className="mt-8 normal-case tracking-normal">
            <Link href="/shop">Shop the drop</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
