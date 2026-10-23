import Link from "next/link";

import { NewsletterForm } from "@/components/sections/newsletter-form";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All pieces" },
      { href: "/category/new-arrivals", label: "New Arrivals" },
      { href: "/category/stitched-suits", label: "Stitched Suits" },
      { href: "/category/accessories", label: "Accessories" },
      { href: "/category/sale", label: "Sale" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
    ],
  },
  {
    title: "Lahore",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/contact", label: "Write to us" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 px-5 py-8 md:flex-row md:items-center md:px-10">
          <div>
            <p className="font-serif text-3xl tracking-wide">Shop the collection</p>
            <p className="mt-1 text-sm text-primary-foreground/80">Timeless pieces for every celebration.</p>
          </div>
          <Link
            href="/shop"
            className="text-[12px] font-medium tracking-[0.16em] text-gold-on-dark uppercase hover:underline"
          >
            Shop the collection →
          </Link>
        </div>
      </div>
      <div className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10 md:py-16">
          <div>
            <p className="font-serif text-4xl tracking-[0.06em]">Abeera</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A Lahore house for lawn, chiffon, zardozi, and stitched pret — made for Eid, weddings, and the days in between.
            </p>
            <div className="mt-8 max-w-sm">
              <p className="kicker mb-3">Letters from Lahore</p>
              <NewsletterForm compact id="footer-email" />
            </div>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="kicker">{column.title}</p>
              <ul className="mt-5 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-6 text-[12px] tracking-[0.08em] text-muted-foreground md:flex-row md:justify-between md:px-10">
            <p>© {new Date().getFullYear()} Abeera</p>
            <p>Lahore, Pakistan</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
