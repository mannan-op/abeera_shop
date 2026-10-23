import Link from "next/link";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/category/new-arrivals", label: "New arrivals" },
      { href: "/category/stitched-suits", label: "Stitched suits" },
      { href: "/shop?sort=featured", label: "Bestsellers" },
      { href: "/category/sale", label: "Sale" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "House",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gold-line/25 bg-espresso text-paper/72">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-[clamp(1.25rem,4vw,4.5rem)] py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-16">
        <div>
          <Link href="/" className="font-serif text-[1.85rem] tracking-[0.06em] text-paper">
            Abeera
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            A Lahore house for lawn, chiffon, zardozi, and stitched pret — made for Eid, weddings, and the days in
            between.
          </p>
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
          <p>© {new Date().getFullYear()} Abeera</p>
          <p>Lahore, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
