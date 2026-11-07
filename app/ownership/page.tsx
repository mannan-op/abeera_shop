import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ContactList, fact, PolicyPage } from "@/components/site/policy";
import { LEGAL } from "@/lib/site/legal";
import { getSiteSettings } from "@/lib/site/settings";

export const metadata: Metadata = { title: "Ownership Statement", description: "Who owns and operates Abeera." };

export default async function OwnershipPage() {
  const settings = await getSiteSettings();
  const rows: [string, ReactNode][] = [
    ["Brand", "Abeera"],
    ["Owner", fact(LEGAL.ownerLegalName, "OWNER LEGAL NAME")],
    ["Registered business name", fact(LEGAL.registeredBusinessName, "REGISTERED BUSINESS NAME")],
    ["Business type", fact(LEGAL.businessType, "BUSINESS TYPE, e.g. sole proprietorship")],
    ["Tax registration", fact(LEGAL.taxRegistration, "TAX REGISTRATION")],
    ...(LEGAL.secpNumber ? ([["SECP registration", LEGAL.secpNumber]] as [string, ReactNode][]) : []),
    ["Business / shop address", fact(settings.store.address, "SHOP ADDRESS")],
    ["Registered address (FBR)", <>{fact(LEGAL.registeredAddress, "REGISTERED BUSINESS ADDRESS")}, Pakistan</>],
    ["Country", "Pakistan"],
  ];
  return (
    <PolicyPage
      title="Ownership Statement"
      path="/ownership"
      intro={
        <p>
          The Abeera website and the Abeera brand are owned and operated by {fact(LEGAL.ownerLegalName, "OWNER LEGAL NAME")} trading as {fact(LEGAL.registeredBusinessName, "REGISTERED BUSINESS NAME")}, a business based in Pakistan. All sales made on this website are contracts with this business.
        </p>
      }
      sections={[
        {
          id: "details",
          title: "Business details",
          body: (
            <dl className="divide-y divide-gold-line/20 rounded-xl border border-gold-line/30 bg-paper/60">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_1fr]">
                  <dt className="text-xs tracking-[0.08em] uppercase">{k}</dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          ),
        },
        {
          id: "payments",
          title: "Payments",
          body: <p>Card payments on this website are processed by Safepay on behalf of the business named above, and appear on your statement under that business. Cash on delivery is collected by our courier partners on our behalf.</p>,
        },
        {
          id: "contact",
          title: "Contact",
          body: <ContactList settings={settings} />,
        },
      ]}
    />
  );
}
