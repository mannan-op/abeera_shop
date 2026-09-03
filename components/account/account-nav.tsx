import Link from "next/link";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountNav() {
  return (
    <nav className="flex flex-wrap gap-4 border-b border-border pb-4">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="text-sm tracking-[0.04em] text-muted-foreground transition-colors hover:text-foreground">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
