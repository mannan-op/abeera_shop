import Image from "next/image";
import Link from "next/link";

import { IMG } from "@/lib/catalog";

const chips = [
  {
    href: "/category/stitched-suits",
    label: "Stitched Suits",
    image: IMG.festivePortrait,
    alt: "Embroidered formal suit",
  },
  {
    href: "/category/new-arrivals",
    label: "New Arrivals",
    image: IMG.heroEid,
    alt: "Embroidered festive arrival",
  },
  {
    href: "/search?q=festive",
    label: "Festive",
    image: IMG.bridalDetail,
    alt: "Festive florals and gold jewellery",
  },
  {
    href: "/search?q=lawn",
    label: "Lawn",
    image: IMG.lawnPrint,
    alt: "Soft floral print",
  },
  {
    href: "/category/accessories",
    label: "Accessories",
    image: IMG.goldJewel,
    alt: "Gold bangles",
  },
];

export function CategoryChips() {
  return (
    <section aria-label="Shop by edit" className="border-t border-border/70 bg-background">
      <ul className="mx-auto flex max-w-[1280px] gap-5 overflow-x-auto px-5 py-8 snap-x snap-mandatory md:justify-center md:gap-10 md:overflow-visible md:px-10 md:py-10">
        {chips.map((chip) => (
          <li key={chip.href} className="snap-start">
            <Link href={chip.href} className="group flex w-[5.5rem] flex-col items-center md:w-28">
              <span className="relative size-[5.5rem] overflow-hidden rounded-full bg-blush ring-1 ring-border transition-shadow group-hover:ring-primary/40 md:size-28">
                <Image
                  src={chip.image}
                  alt={chip.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="112px"
                />
              </span>
              <span className="mt-3 text-center text-[13px] text-foreground">{chip.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
