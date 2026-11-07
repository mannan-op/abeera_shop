import type { Metadata } from "next";
import Link from "next/link";

import { ContactList, PolicyPage } from "@/components/site/policy";
import { LEGAL } from "@/lib/site/legal";
import { getSiteSettings } from "@/lib/site/settings";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Shipping & Delivery", description: "Delivery fees, timelines and tracking for Abeera orders in Pakistan." };

export default async function ShippingPage() {
  const settings = await getSiteSettings();
  const { store } = settings;
  return (
    <PolicyPage
      kicker="Help"
      title="Shipping & Delivery"
      path="/shipping"
      intro={<p>We deliver across Pakistan from our {LEGAL.dispatchCity} studio. We do not ship internationally.</p>}
      sections={[
        {
          id: "rates",
          title: "Fees and timelines",
          body: (
            <>
              <ul>
                <li><strong>Standard</strong> — {formatPrice(store.standardShipping)}, {LEGAL.standardDeliveryDays} working days.</li>
                <li><strong>Express</strong> — {formatPrice(store.expressShipping)}, {LEGAL.expressDeliveryDays} working days.</li>
              </ul>
              {store.freeShippingThreshold > 0 ? <p>Standard delivery is free on orders of {formatPrice(store.freeShippingThreshold)} or more.</p> : null}
              <p>Delivery times are counted in working days from your order and may be longer for remote areas, public holidays and Eid rush.</p>
            </>
          ),
        },
        {
          id: "payment",
          title: "Paying on delivery",
          body: <p>{store.payments.cod ? "Cash on delivery is available at checkout — pay the courier when your parcel arrives." : "Cash on delivery is currently paused."}</p>,
        },
        {
          id: "tracking",
          title: "Tracking",
          body: <p>A tracking note goes out by SMS and email once the parcel leaves {LEGAL.dispatchCity}.</p>,
        },
        {
          id: "cancel",
          title: "Cancellations and exchanges",
          body: <p>Eligible pieces can be exchanged within {LEGAL.returnWindowDays} days of delivery, subject to stock. See our <Link href="/refund-policy" className="underline underline-offset-4">Exchange, Cancellation &amp; Refund Policy</Link> for cancellations and the rare cases where we refund.</p>,
        },
        { id: "contact", title: "Questions", body: <ContactList settings={settings} /> },
      ]}
    />
  );
}
