import Link from "next/link";

import { NewsletterForm } from "@/components/sections/newsletter-form";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All" },
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
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-primary text-ivory">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-10 md:py-24">
        <div>
          <p className="font-serif text-4xl tracking-[0.04em] md:text-5xl">Abeera</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/65">
            A contemporary fashion house of considered silhouettes, natural cloth, and an editorial approach to everyday dressing.
          </p>
          <div className="mt-8 max-w-sm">
            <p className="kicker mb-3">Correspondence</p>
            <NewsletterForm compact inverted />
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="kicker">{column.title}</p>
            <ul className="mt-5 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/65 transition-colors hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-6 text-[12px] tracking-[0.12em] text-ivory/45 md:flex-row md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} Abeera Atelier</p>
          <p>Paris · by appointment</p>
        </div>
      </div>
    </footer>
  );
}
