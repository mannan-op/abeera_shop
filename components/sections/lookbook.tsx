import Link from "next/link";

import { CmsImage } from "@/components/media/cms-image";
import { defaultHomepageContent, type HomepageLookbook } from "@abeera/shared";

export function Lookbook({
  content = defaultHomepageContent.lookbook,
  title,
  lede,
}: {
  content?: HomepageLookbook;
  title?: string;
  lede?: string;
}) {
  const heading = title ?? content.title;
  const intro = lede ?? content.lede;

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16" aria-labelledby="lookbook-title">
      <p className="kicker">{content.kicker}</p>
      <h2 id="lookbook-title" className="mt-3 max-w-xl font-serif text-[length:var(--text-title)] leading-tight">
        {heading}
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {content.edits.map((edit, index) => (
          <li key={`${edit.href}-${edit.title}-${index}`}>
            <Link href={edit.href} className="group block">
              <div className="relative aspect-4/5 overflow-hidden bg-blush">
                <CmsImage
                  src={edit.imageUrl}
                  alt={edit.imageAlt}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="pt-4">
                <h3 className="font-serif text-2xl font-normal">{edit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{edit.copy}</p>
                <span className="mt-4 inline-block border-b border-champagne pb-0.5 text-[0.7rem] tracking-[0.14em] uppercase">
                  {content.cardCtaLabel}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
