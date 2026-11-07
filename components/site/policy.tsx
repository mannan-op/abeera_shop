import type { SiteSettings } from "@abeera/shared";
import Link from "next/link";
import type { ReactNode } from "react";

import { LEGAL } from "@/lib/site/legal";
import { whatsappDigits } from "@/lib/site/settings";

/** A fact we don't have yet: shows as a highlighted [PLACEHOLDER] so it can't be missed. */
export function Ph({ children }: { children: string }) {
  return <mark className="rounded-sm bg-[#f6e3b4] px-1 font-medium text-espresso">[{children}]</mark>;
}

export function fact(value: string | null | undefined, placeholder: string): ReactNode {
  return value ? value : <Ph>{placeholder}</Ph>;
}

export const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms-and-conditions", label: "Terms & conditions" },
  { href: "/refund-policy", label: "Exchanges, cancellation & refunds" },
  { href: "/shipping", label: "Shipping & delivery" },
  { href: "/ownership", label: "Ownership statement" },
];

export function PolicyPage({
  kicker = "Policies",
  title,
  intro,
  path,
  sections,
}: {
  kicker?: string;
  title: string;
  intro: ReactNode;
  path: string;
  sections: { id: string; title: string; body: ReactNode }[];
}) {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-16 md:grid-cols-[220px_1fr] md:py-24">
      <aside className="hidden md:block">
        <nav aria-label="Policies" className="sticky top-28 space-y-2 text-sm">
          <p className="kicker mb-4">Policies</p>
          {POLICY_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.href === path ? "page" : undefined}
              className={l.href === path ? "block text-foreground" : "block text-muted-foreground hover:text-foreground"}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="max-w-2xl">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{title}</h1>
        <p className="mt-3 text-xs tracking-[0.04em] text-muted-foreground">Effective {fact(LEGAL.effectiveDate, "EFFECTIVE DATE")}</p>
        <div className="mt-6 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">{intro}</div>
        <ol className="mt-8 flex flex-wrap gap-x-4 gap-y-1 border-y border-gold-line/30 py-3 text-xs">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-28 border-b border-gold-line/20 py-8 last:border-0">
            <h2 className="font-serif text-2xl">
              <span className="mr-2 text-champagne">{i + 1}.</span>
              {s.title}
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem] [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:space-y-1.5">
              {s.body}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}

/** Email, phone, WhatsApp and address from Site settings; placeholders where they are empty. */
export function ContactList({ settings }: { settings: SiteSettings }) {
  const { contactEmail, contactPhone, address } = settings.store;
  const wa = whatsappDigits(settings);
  return (
    <ul>
      <li>
        <strong>Email:</strong> {contactEmail ? <a className="underline underline-offset-4" href={`mailto:${contactEmail}`}>{contactEmail}</a> : <Ph>CONTACT EMAIL</Ph>}
      </li>
      <li>
        <strong>Phone:</strong> {contactPhone ? <a className="underline underline-offset-4" href={`tel:${contactPhone.replace(/[^+\d]/g, "")}`}>{contactPhone}</a> : <Ph>CUSTOMER SERVICE PHONE</Ph>}
      </li>
      <li>
        <strong>WhatsApp:</strong> {wa ? <a className="underline underline-offset-4" href={`https://wa.me/${wa}`}>+{wa}</a> : <Ph>WHATSAPP NUMBER</Ph>}
      </li>
      <li>
        <strong>Address:</strong> {fact(address, "SHOP / OFFICE ADDRESS")}
      </li>
    </ul>
  );
}
