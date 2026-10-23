import Image from "next/image";

import { Reveal } from "@/components/sections/reveal";
import { NewsletterForm } from "@/components/sections/newsletter-form";
import { IMG } from "@/lib/catalog";

const frames = [IMG.gallery1, IMG.gallery2, IMG.gallery3, IMG.gallery4, IMG.gallery5, IMG.gallery6];

export function SocialGallery() {
  return (
    <Reveal>
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <p className="kicker">@abeera.pk</p>
        <h2 className="mt-4 font-serif text-4xl md:text-5xl">As worn by you</h2>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-3">
          {frames.map((src, index) => (
            <div key={`${src}-${index}`} className="group relative aspect-square overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="20vw"
              />
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

export function NewsletterSection() {
  return (
    <Reveal>
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker">Letters from Lahore</p>
          <h2 className="mt-4 font-serif text-[length:var(--text-title)] leading-tight md:text-5xl">
            Notes when a new edit lands
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Eid drops, lawn restocks, and pret worth writing home about. We keep the letters short.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </Reveal>
  );
}
