import Link from "next/link";

import { CmsImage } from "@/components/media/cms-image";
import type { HomepageMomentRail } from "@abeera/shared";

export function MomentRail({ section }: { section: HomepageMomentRail }) {
  return (
    <section id="rail" aria-labelledby="moment-title" className="py-[clamp(3.5rem,8vw,6.5rem)] pl-[clamp(1.25rem,4vw,4.5rem)]">
      <div className="mx-auto mb-9 flex max-w-[1440px] flex-wrap items-end justify-between gap-4 pr-[clamp(1.25rem,4vw,4.5rem)]">
        <div>
          <p className="kicker">{section.kicker}</p>
          <h2 id="moment-title" className="mt-2 font-serif text-[length:var(--text-title)] leading-[1.05] font-normal">
            {section.title}
          </h2>
          <p className="mt-2 max-w-[36ch] text-muted-foreground">{section.lede}</p>
        </div>
        <Link
          href={section.viewAllHref}
          className="border-b border-champagne pb-0.5 text-[0.7rem] tracking-[0.14em] uppercase hover:text-espresso"
        >
          {section.viewAllLabel}
        </Link>
      </div>
      <div className="mx-auto flex max-w-[1440px] gap-4 overflow-x-auto pr-[clamp(1.25rem,4vw,4.5rem)] snap-x snap-mandatory [scrollbar-color:var(--champagne)_transparent]">
        {section.moments.map((moment, index) => (
          <Link
            key={`${moment.href}-${moment.title}-${index}`}
            href={moment.href}
            className="w-[min(70vw,280px)] shrink-0 snap-start"
          >
            <div className="relative mb-3.5 aspect-4/5 overflow-hidden bg-blush">
              <CmsImage src={moment.imageUrl} alt={moment.imageAlt} className="object-cover" sizes="280px" />
            </div>
            <h3 className="font-serif text-xl font-normal">{moment.title}</h3>
            <p className="mt-1 mb-2.5 text-sm text-muted-foreground">{moment.copy}</p>
            <span className="border-b border-champagne pb-0.5 text-[0.7rem] tracking-[0.14em] uppercase">
              {section.cardCtaLabel}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
