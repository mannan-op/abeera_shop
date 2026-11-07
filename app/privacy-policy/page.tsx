import type { Metadata } from "next";
import Link from "next/link";

import { ContactList, fact, PolicyPage } from "@/components/site/policy";
import { LEGAL } from "@/lib/site/legal";
import { getSiteSettings } from "@/lib/site/settings";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Abeera collects, uses and protects your personal information." };

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const business = fact(LEGAL.registeredBusinessName, "REGISTERED BUSINESS NAME");
  return (
    <PolicyPage
      title="Privacy Policy"
      path="/privacy-policy"
      intro={
        <p>
          This policy explains what personal information Abeera (operated by {business}, Pakistan) collects when you visit this website or place an order, how we use it, and the choices you have. By using the website you agree to this policy.
        </p>
      }
      sections={[
        {
          id: "collect",
          title: "Information we collect",
          body: (
            <>
              <ul>
                <li><strong>Order details</strong> — your name, email address, phone number, delivery address and city, the items you buy and your order history.</li>
                <li><strong>Payment details</strong> — if you pay by card, your card is entered on the secure page of our payment processor, Safepay. Abeera never sees or stores your full card number, expiry date or CVV. We receive only a payment reference and status. Cash on delivery orders involve no card data.</li>
                <li><strong>Messages</strong> — anything you send us by email, WhatsApp, phone or the contact form.</li>
                <li><strong>Technical data</strong> — basic device, browser and usage information, plus cookies that remember your bag, wishlist and the last order you placed on this device.</li>
              </ul>
            </>
          ),
        },
        {
          id: "use",
          title: "How we use it",
          body: (
            <ul>
              <li>To process, deliver and support your orders, including emailing your order slip and sending order and delivery updates by SMS, email or WhatsApp.</li>
              <li>To let you track an order with its number and your email, and to handle exchanges and any refunds.</li>
              <li>To answer questions and handle complaints.</li>
              <li>To prevent fraud and keep the website secure.</li>
              <li>To improve our collections and the website.</li>
              <li>To send news and offers only if you ask for them; you can unsubscribe at any time.</li>
            </ul>
          ),
        },
        {
          id: "share",
          title: "Who we share it with",
          body: (
            <>
              <p>We do not sell or rent your personal information. We share only what is needed with:</p>
              <ul>
                <li><strong>Courier partners</strong> — your name, address and phone number, to deliver your parcel.</li>
                <li><strong>Safepay</strong> and the banks and card networks behind it — to process card payments and refunds.</li>
                <li><strong>Service providers</strong> who host the website, store images and send emails or messages for us, under confidentiality obligations.</li>
                <li><strong>Authorities</strong> — where Pakistani law, a court or a regulator requires it.</li>
              </ul>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: <p>We use essential cookies to hold your bag and wishlist, remember your last order for its confirmation page, and protect checkout. You do not need an account to shop. You can block cookies in your browser, but your bag and checkout may not work.</p>,
        },
        {
          id: "security",
          title: "How we keep it safe",
          body: <p>The website is served over HTTPS and access to customer records is limited to staff who need it. No method of transmission or storage is completely secure, but we work to protect your information and will tell you if a breach affects you.</p>,
        },
        {
          id: "retention",
          title: "How long we keep it",
          body: <p>We keep order and payment records for as long as Pakistani tax and accounting law requires, and contact details linked to an order for as long as we need them to support that order, then as the law requires. Messages and reviews are kept while they are needed to support you.</p>,
        },
        {
          id: "rights",
          title: "Your choices",
          body: <p>You can ask us for a copy of the information we hold, ask us to correct it, or ask us to delete it where the law allows, by writing to us at the contact details below. We reply within {fact(LEGAL.complaintResolveDays, "COMPLAINT RESOLUTION WORKING DAYS")} working days.</p>,
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: <p>We may update this policy from time to time. The effective date at the top shows when it last changed. Significant changes will be announced on the website.</p>,
        },
        {
          id: "contact",
          title: "Contact us",
          body: (
            <>
              <p>For any privacy question or request, contact {business}:</p>
              <ContactList settings={settings} />
              <p>See also our <Link href="/terms-and-conditions" className="underline underline-offset-4">Terms &amp; Conditions</Link>.</p>
            </>
          ),
        },
      ]}
    />
  );
}
