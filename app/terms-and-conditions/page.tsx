import type { Metadata } from "next";
import Link from "next/link";

import { ContactList, fact, PolicyPage } from "@/components/site/policy";
import { LEGAL } from "@/lib/site/legal";
import { getSiteSettings } from "@/lib/site/settings";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Terms and Conditions", description: "The terms for using the Abeera website and buying from Abeera." };

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const { store } = settings;
  const business = fact(LEGAL.registeredBusinessName, "REGISTERED BUSINESS NAME");
  return (
    <PolicyPage
      title="Terms and Conditions"
      path="/terms-and-conditions"
      intro={
        <>
          <p>
            These terms govern your use of the Abeera website and every purchase you make from it. Abeera is a Pakistani women&apos;s clothing brand owned and operated by {business}, a business registered with the FBR in Pakistan. Our shop is at {fact(store.address, "SHOP ADDRESS")}. Full registration details are in our <Link href="/ownership" className="underline underline-offset-4">Ownership Statement</Link>.
          </p>
          <p className="mt-3">By using the website or placing an order you accept these terms. If you do not agree, please do not use the website.</p>
        </>
      }
      sections={[
        {
          id: "use",
          title: "Using the website",
          body: (
            <ul>
              <li>You must be at least 18, or use the website with a parent or guardian&apos;s permission.</li>
              <li>You do not need an account to shop. Please give a correct email and phone number at checkout — we use them to confirm and deliver your order.</li>
              <li>Do not misuse the website, attempt to break its security, or submit false orders or reviews.</li>
              <li>All photographs, designs, text and logos on the website belong to Abeera and may not be copied without written permission.</li>
            </ul>
          ),
        },
        {
          id: "products",
          title: "Products and prices",
          body: (
            <>
              <p>All prices are shown in Pakistani Rupees (PKR / Rs.) and include applicable taxes unless stated otherwise. Delivery charges are shown separately at checkout before you pay.</p>
              <p>We photograph our own pieces and describe fabric, size and colour as accurately as we can; small differences in shade can occur between screens and because many pieces are hand-finished. Size guides are a guide — please check measurements before ordering.</p>
              <p>We may change prices, collections and availability at any time. If a price is listed in error we will contact you before dispatch and you may cancel for a full refund.</p>
            </>
          ),
        },
        {
          id: "orders",
          title: "Orders",
          body: <p>Your order is an offer to buy. We accept it when we confirm it by email, SMS or WhatsApp. We may decline or cancel an order — for example if an item is out of stock, the address cannot be served, or we suspect fraud — and will refund any payment in full.</p>,
        },
        {
          id: "payment",
          title: "Payment",
          body: (
            <>
              <p>We accept:</p>
              <ul>
                <li><strong>Cash on delivery</strong> — pay the courier in cash when your parcel arrives.</li>
                <li><strong>Debit or credit card</strong> — processed securely by Safepay. Card details are entered on Safepay&apos;s page and are never stored by Abeera. Your bank may require verification (3-D Secure / OTP).</li>
              </ul>
              <p>Card payment will appear at checkout once it is enabled. All charges are in PKR; your bank may apply its own fees or exchange rate for non-PKR cards.</p>
            </>
          ),
        },
        {
          id: "delivery",
          title: "Delivery",
          body: (
            <p>
              We deliver within Pakistan only. Standard delivery costs {formatPrice(store.standardShipping)} and takes {LEGAL.standardDeliveryDays} working days; express costs {formatPrice(store.expressShipping)} and takes {LEGAL.expressDeliveryDays} working days.
              {store.freeShippingThreshold > 0 ? <> Standard delivery is free on orders of {formatPrice(store.freeShippingThreshold)} or more.</> : null} Full details are on our <Link href="/shipping" className="underline underline-offset-4">Shipping page</Link>.
            </p>
          ),
        },
        {
          id: "returns",
          title: "Exchanges, cancellations and refunds",
          body: <p>Abeera offers exchanges, not refunds, for change of mind. Refunds are given only in the exceptional cases set out in our <Link href="/refund-policy" className="underline underline-offset-4">Exchange, Cancellation &amp; Refund Policy</Link>, which forms part of these terms.</p>,
        },
        {
          id: "complaints",
          title: "Complaints",
          body: (
            <p>
              If something is not right, contact us by email, phone or WhatsApp (details below) with your order number. We acknowledge every complaint within {fact(LEGAL.complaintAcknowledgeDays, "COMPLAINT ACKNOWLEDGEMENT WORKING DAYS")} working day(s) and aim to resolve it, or offer a solution, within {fact(LEGAL.complaintResolveDays, "COMPLAINT RESOLUTION WORKING DAYS")} working days.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Liability",
          body: <p>Nothing in these terms limits your rights as a consumer under Pakistani law. Otherwise, our liability for any order is limited to the amount you paid for it, and we are not responsible for delays caused by events outside our control, such as courier disruption, strikes or natural events.</p>,
        },
        {
          id: "law",
          title: "Governing law",
          body: <p>These terms are governed by the laws of Pakistan. Any dispute will be handled by the courts of {fact(LEGAL.jurisdictionCity, "JURISDICTION CITY")}, Pakistan.</p>,
        },
        {
          id: "contact",
          title: "Contact us",
          body: (
            <>
              <p>{business}, a sole proprietorship owned by {fact(LEGAL.ownerLegalName, "OWNER LEGAL NAME")}. {LEGAL.taxRegistration}.</p>
              <ContactList settings={settings} />
            </>
          ),
        },
      ]}
    />
  );
}
