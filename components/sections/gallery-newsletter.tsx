import Image from "next/image";

import { Reveal } from "@/components/sections/reveal";
import { NewsletterForm } from "@/components/sections/newsletter-form";
import { IMG } from "@/lib/catalog";
import type { HomepageNewsletter } from "@abeera/shared";

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

export function NewsletterSection({ newsletter }: { newsletter: HomepageNewsletter }) {
  return (
    <section className="bg-espresso px-[clamp(1.25rem,4vw,4.5rem)] py-[clamp(3.5rem,8vw,6.5rem)] text-center text-paper">
      <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.85rem)] font-normal">{newsletter.title}</h2>
      <p className="mx-auto mt-3 max-w-[34ch] text-paper/80">{newsletter.lede}</p>
      <div className="mt-6">
        <NewsletterForm
          inverted
          id="letters-email"
          emailLabel={newsletter.emailLabel}
          placeholder={newsletter.placeholder}
          submitLabel={newsletter.submitLabel}
          sendingLabel={newsletter.sendingLabel}
          successMessage={newsletter.successMessage}
        />
      </div>
    </section>
  );
}
