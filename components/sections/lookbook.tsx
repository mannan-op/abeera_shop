import Image from "next/image";
import Link from "next/link";

import { IMG } from "@/lib/catalog";

const edits = [
  {
    href: "/search?q=lawn",
    title: "Lawn",
    copy: "Breathable prints from Faisalabad mills, stitched for warm days.",
    image: IMG.lawnPrint,
    alt: "Soft floral print",
  },
  {
    href: "/search?q=zardozi",
    title: "Chiffon & zardozi",
    copy: "Sheer layers and hand embroidery for weddings and Eid nights.",
    image: IMG.goldJewel,
    alt: "Gold jewellery from the festive edit",
  },
  {
    href: "/shop",
    title: "The Eid drop",
    copy: "A celebration edit of stitched suits, cut in Lahore.",
    image: IMG.festivePortrait,
    alt: "Embroidered festive formal",
  },
];

export function Lookbook({
  title = "The lookbook",
  lede = "The rails are being dressed for the season. Until new pieces land, wander the cloth we cut in Lahore.",
}: {
  title?: string;
  lede?: string;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-10 md:py-16" aria-labelledby="lookbook-title">
      <p className="kicker">Collections</p>
      <h2 id="lookbook-title" className="mt-3 max-w-xl font-serif text-[length:var(--text-title)] leading-tight">
        {title}
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">{lede}</p>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {edits.map((edit) => (
          <li key={edit.title}>
            <Link href={edit.href} className="group block overflow-hidden rounded-xl bg-card ring-1 ring-border">
              <div className="relative aspect-[4/5] bg-blush">
                <Image
                  src={edit.image}
                  alt={edit.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-2xl">{edit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{edit.copy}</p>
                <span className="mt-4 inline-block text-[12px] tracking-[0.12em] text-primary uppercase">
                  Explore
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
