/* eslint-disable @next/next/no-img-element */
"use client";

import type { HomepageContent } from "@abeera/shared";

import { cn } from "@/lib/utils";

export type PreviewSection = keyof HomepageContent;

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return src ? <img src={src} alt={alt} className={cn("object-cover", className)} /> : <div className={cn("bg-[#e9e2d6]", className)} />;
}

const kicker = "text-[9px] tracking-[0.24em] uppercase text-[#8a7b6e]";

export function HomepagePreview({
  content,
  section,
  mobile,
  selected,
}: {
  content: HomepageContent;
  section: PreviewSection;
  mobile: boolean;
  selected?: number;
}) {
  const cols = mobile ? "grid-cols-1" : "grid-cols-3";
  switch (section) {
    case "hero": {
      const h = content.hero;
      return (
        <div className={cn("relative text-white", mobile ? "h-[460px]" : "h-[420px]")}>
          <Img src={h.imageUrl} alt={h.imageAlt} className="absolute inset-0 h-full w-full object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2b211c]/80 via-[#2b211c]/35 to-transparent" />
          <div className={cn("absolute bottom-7 left-6", mobile ? "right-6" : "w-[78%]")}>
            <p className="text-[9px] tracking-[0.26em] text-[#e8d5b0] uppercase">{h.eyebrow}</p>
            <h3 className="mt-2 font-serif text-[2.1rem] leading-[1.04] font-normal">
              {h.headlineLead}
              {h.headlineEmphasis ? (
                <>
                  <br />
                  <em className="text-[#e8d5b0]">{h.headlineEmphasis}</em>
                </>
              ) : null}
            </h3>
            <p className="mt-2 text-[10px] tracking-[0.08em] opacity-90">{h.subline}</p>
            <p className="mt-1.5 line-clamp-3 text-[10.5px] leading-relaxed opacity-85">{h.body}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="bg-[#faf7f2] px-2.5 py-1.5 text-[8.5px] tracking-[0.14em] text-[#2b211c] uppercase">{h.primaryCta.label}</span>
              <span className="border border-white/60 px-2.5 py-1.5 text-[8.5px] tracking-[0.14em] uppercase">{h.secondaryCta.label}</span>
            </div>
          </div>
        </div>
      );
    }
    case "collections":
      return (
        <div className="p-4">
          <div className={cn("grid gap-2", cols)}>
            {content.collections.map((tile, i) => (
              <div key={i} className={cn("relative overflow-hidden text-white", mobile ? "h-48" : "h-56", selected === i && "outline-2 outline-offset-2 outline-[#b08d57]")}>
                <Img src={tile.imageUrl} alt={tile.imageAlt} className="absolute inset-0 h-full w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2b211c]/75 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5">
                  <p className="text-[8px] tracking-[0.18em] uppercase opacity-90">{tile.label}</p>
                  <p className="font-serif text-[1.05rem]">{tile.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "moments": {
      const m = content.moments;
      return (
        <div className="p-5">
          <p className={kicker}>{m.kicker}</p>
          <div className="flex items-end justify-between gap-3">
            <h3 className="mt-1 font-serif text-2xl">{m.title}</h3>
            <span className="text-[9px] tracking-[0.14em] text-[#2b211c] uppercase underline underline-offset-4">{m.viewAllLabel}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8a7b6e]">{m.lede}</p>
          <div className={cn("mt-4 grid gap-2.5", mobile ? "grid-cols-1" : "grid-cols-2")}>
            {m.moments.map((card, i) => (
              <div key={i} className={cn(selected === i && "outline-2 outline-offset-2 outline-[#b08d57]")}>
                <Img src={card.imageUrl} alt={card.imageAlt} className="h-28 w-full" />
                <p className="mt-1.5 font-serif text-[0.95rem]">{card.title}</p>
                <p className="text-[10px] text-[#8a7b6e]">{card.copy}</p>
                <p className="mt-1 text-[8.5px] tracking-[0.14em] uppercase">{m.cardCtaLabel} →</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "productRail": {
      const r = content.productRail;
      return (
        <div className="p-5">
          <p className={kicker}>{r.eyebrow}</p>
          <div className="flex items-end justify-between gap-3">
            <h3 className="mt-1 font-serif text-2xl">{r.title}</h3>
            <span className="text-[9px] tracking-[0.14em] uppercase underline underline-offset-4">{r.viewAllLabel}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8a7b6e]">{r.lede}</p>
          <div className={cn("mt-4 grid gap-2.5", mobile ? "grid-cols-2" : "grid-cols-4")}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <div className="grid h-28 place-items-center bg-[#efe6d8] text-center text-[9px] tracking-[0.12em] text-[#8a7b6e] uppercase">From your catalog</div>
                <div className="mt-1.5 h-2 w-3/4 bg-[#e4dccf]" />
                <div className="mt-1 h-2 w-1/3 bg-[#efe6d8]" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "brandStory": {
      const b = content.brandStory;
      return (
        <div className={cn("grid gap-4 p-5", mobile ? "grid-cols-1" : "grid-cols-2")}>
          <Img src={b.imageUrl} alt={b.imageAlt} className={cn("w-full", mobile ? "h-48" : "h-72")} />
          <div className="self-center">
            <p className={kicker}>{b.kicker}</p>
            <h3 className="mt-1.5 font-serif text-xl leading-snug">{b.title}</h3>
            <p className="mt-2 text-[11px] text-[#2b211c]">{b.lede}</p>
            <p className="mt-2 line-clamp-5 text-[10.5px] leading-relaxed text-[#8a7b6e]">{b.body}</p>
            <p className="mt-3 text-[9px] tracking-[0.14em] uppercase underline underline-offset-4">{b.ctaLabel}</p>
          </div>
        </div>
      );
    }
    case "trust":
      return (
        <div className={cn("grid gap-px border-y border-[#e4dccf] bg-[#e4dccf]", mobile ? "grid-cols-2" : "grid-cols-4")}>
          {content.trust.map((item, i) => (
            <div key={i} className="bg-[#faf7f2] px-3 py-5 text-center">
              <p className="font-serif text-[0.95rem]">{item.title}</p>
              <p className="mt-1 text-[10px] text-[#8a7b6e]">{item.copy}</p>
            </div>
          ))}
        </div>
      );
    case "newsletter": {
      const n = content.newsletter;
      return (
        <div className="bg-[#2b211c] px-6 py-10 text-center text-[#faf7f2]">
          <h3 className="font-serif text-2xl">{n.title}</h3>
          <p className="mx-auto mt-2 max-w-xs text-[11px] opacity-80">{n.lede}</p>
          <div className="mx-auto mt-5 flex max-w-xs">
            <span className="flex-1 border border-white/30 px-3 py-2 text-left text-[10px] opacity-60">{n.placeholder}</span>
            <span className="bg-[#b08d57] px-3 py-2 text-[9px] tracking-[0.14em] uppercase">{n.submitLabel}</span>
          </div>
          <p className="mt-4 text-[10px] italic opacity-60">After signing up: “{n.successMessage}”</p>
        </div>
      );
    }
    case "lookbook": {
      const l = content.lookbook;
      return (
        <div className="p-5">
          <p className={kicker}>{l.kicker}</p>
          <h3 className="mt-1 font-serif text-2xl">{l.title}</h3>
          <p className="mt-1 text-[11px] text-[#8a7b6e]">{l.lede}</p>
          <div className={cn("mt-4 grid gap-2.5", cols)}>
            {l.edits.map((edit, i) => (
              <div key={i} className={cn(selected === i && "outline-2 outline-offset-2 outline-[#b08d57]")}>
                <Img src={edit.imageUrl} alt={edit.imageAlt} className="h-36 w-full" />
                <p className="mt-1.5 font-serif text-[0.95rem]">{edit.title}</p>
                <p className="line-clamp-2 text-[10px] text-[#8a7b6e]">{edit.copy}</p>
                <p className="mt-1 text-[8.5px] tracking-[0.14em] uppercase">{l.cardCtaLabel} →</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
}
