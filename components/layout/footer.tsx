import type { SiteSettings } from "@abeera/shared";
import Link from "next/link";

import { cn } from "@/lib/utils";

const GRID = [
  "md:grid-cols-[1fr]",
  "md:grid-cols-[1.4fr_1fr]",
  "md:grid-cols-[1.4fr_1fr_1fr]",
  "md:grid-cols-[1.4fr_1fr_1fr_1fr]",
  "md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]",
];

export function Footer({ footer, store }: { footer: SiteSettings["footer"]; store?: SiteSettings["store"] }) {
  const columns = footer.columns;
  return (
    <footer className="border-t border-gold-line/25 bg-espresso text-paper/72">
      <div className={cn("mx-auto grid max-w-[1440px] gap-10 px-[clamp(1.25rem,4vw,4.5rem)] py-14 md:py-16", GRID[columns.length])}>
        <div>
          <Link href="/" className="font-serif text-[1.85rem] tracking-[0.06em] text-paper">
            Abeera
          </Link>
          {footer.blurb ? <p className="mt-3 max-w-sm text-sm leading-relaxed">{footer.blurb}</p> : null}
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[0.65rem] font-medium tracking-[0.16em] text-paper uppercase">{column.title}</p>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-champagne-soft">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-[clamp(1.25rem,4vw,4.5rem)] py-5 text-[0.7rem] tracking-[0.05em] md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {footer.copyrightName}
          </p>
          {store && (store.contactEmail || store.contactPhone) ? (
            <p>
              {store.contactEmail ? <a href={`mailto:${store.contactEmail}`} className="hover:text-champagne-soft">{store.contactEmail}</a> : null}
              {store.contactEmail && store.contactPhone ? " · " : null}
              {store.contactPhone ? <a href={`tel:${store.contactPhone.replace(/[^+\d]/g, "")}`} className="hover:text-champagne-soft">{store.contactPhone}</a> : null}
            </p>
          ) : null}
          {footer.location ? <p>{footer.location}</p> : null}
        </div>
      </div>
    </footer>
  );
}
